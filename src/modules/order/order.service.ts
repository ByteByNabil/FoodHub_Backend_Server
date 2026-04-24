import { prisma } from "../../lib/prisma";

const createOrder = async (
    userId: string,
    payload: {
        items: { mealId: string; quantity: number }[];
        address: string;
    }
) => {
    return await prisma.$transaction(async (tx) => {
        // 0. basic validation (never trust client)
        if (!payload.items.length) {
            throw new Error("Order must contain at least one item");
        }

        if (payload.items.some((i) => i.quantity <= 0)) {
            throw new Error("Invalid quantity");
        }

        // 1. get meals with provider info
        const mealIds = payload.items.map((i) => i.mealId);

        const meals = await tx.meal.findMany({
            where: { id: { in: mealIds } },
            include: {
                provider: {
                    select: { id: true, isApproved: true },
                },
            },
        });

        // 2. validate meals exist
        if (meals.length !== payload.items.length) {
            throw new Error("Invalid meal detected");
        }

        if (meals.length === 0) {
            throw new Error("No meals found");
        }

        // 3. check availability
        const hasUnavailableMeal = meals.some((m) => !m.isAvailable);
        if (hasUnavailableMeal) {
            throw new Error("One or more meals are not available");
        }

        // 4. ensure same provider
        const providerId = meals[0]!.providerId;

        const allSameProvider = meals.every(
            (m) => m.providerId === providerId
        );

        if (!allSameProvider) {
            throw new Error("All meals must be from same provider");
        }

        // 5. check provider approval (optimized: from included relation)
        const isApproved = meals[0]!.provider.isApproved;

        if (!isApproved) {
            throw new Error("Provider is not approved yet");
        }

        // 6. calculate total price
        let totalPrice = 0;

        const orderItemsData = payload.items.map((item) => {
            const meal = meals.find((m) => m.id === item.mealId)!;

            const itemTotal = meal.price * item.quantity;
            totalPrice += itemTotal;

            return {
                mealId: meal.id,
                quantity: item.quantity,
                price: meal.price,
            };
        });

        // 7. create order
        const order = await tx.order.create({
            data: {
                customerId: userId,
                providerId,
                totalPrice,
                address: payload.address,
            },
        });

        // 8. create order items
        await tx.orderItem.createMany({
            data: orderItemsData.map((item) => ({
                ...item,
                orderId: order.id,
            })),
        });

        return order;
    });
};

const getMyOrders = async (userId: string) => {
    return await prisma.order.findMany({
        where: { customerId: userId },
        include: {
            items: {
                include: {
                    meal: true,
                },
            },
            provider: {
                include: {
                    user: {
                        select: { name: true },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};

const getProviderOrders = async (userId: string) => {
    const provider = await prisma.providerProfile.findUniqueOrThrow({
        where: { userId },
    });

    return await prisma.order.findMany({
        where: { providerId: provider.id },
        include: {
            items: {
                include: { meal: true },
            },
            customer: {
                select: { name: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};

const updateOrderStatus = async (
    orderId: string,
    userId: string,
    role: string,
    status: string
) => {
    const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
    });

    // CUSTOMER → can only cancel
    if (role === "CUSTOMER") {
        if (order.customerId !== userId) {
            throw new Error("Unauthorized");
        }

        if (status !== "CANCELLED") {
            throw new Error("Customer can only cancel order");
        }

        if (order.status !== "PLACED") {
            throw new Error("Order cannot be cancelled at this stage");
        }
    }

    // PROVIDER → controlled flow
    if (role === "PROVIDER") {
        const provider = await prisma.providerProfile.findUniqueOrThrow({
            where: { userId },
        });

        if (order.providerId !== provider.id) {
            throw new Error("Unauthorized");
        }

        const validTransitions: Record<string, string[]> = {
            PLACED: ["PREPARING"],
            PREPARING: ["READY"],
            READY: ["DELIVERED"],
        };

        const allowedNextStatuses = validTransitions[order.status] || [];

        if (!allowedNextStatuses.includes(status)) {
            throw new Error(
                `Invalid status transition from ${order.status} to ${status}`
            );
        }
    }

    // ADMIN (optional future support)
    if (role === "ADMIN") {
        // Admin can do anything (optional rule)
    }

    return await prisma.order.update({
        where: { id: orderId },
        data: { status: status as any },
    });
};

export const OrderService = {
    createOrder,
    getMyOrders,
    getProviderOrders,
    updateOrderStatus,
};