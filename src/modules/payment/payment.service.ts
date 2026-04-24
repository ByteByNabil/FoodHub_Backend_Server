import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import crypto from "crypto";

const getCheckoutBaseUrl = () => {
    const baseUrl = process.env.CLIENT_URL || process.env.APP_URL;

    if (!baseUrl) {
        throw new Error(
            "Missing CLIENT_URL or APP_URL. Set one of them to a full URL like http://localhost:3000."
        );
    }

    try {
        return new URL(baseUrl).origin;
    } catch {
        throw new Error(
            `Invalid CLIENT_URL/APP_URL: "${baseUrl}". Use a full URL like http://localhost:3000.`
        );
    }
};

export const createCheckoutSession = async (orderId: string, userId: string) => {
    const checkoutBaseUrl = getCheckoutBaseUrl();

    const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    meal: true,
                },
            },
        },
    });

    // prevent duplicate checkout
    if (order.isLocked) {
        throw new Error("Order already processing payment");
    }

    // lock order
    await prisma.order.update({
        where: { id: orderId },
        data: { isLocked: true },
    });

    const idempotencyKey = crypto.randomUUID();

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],

        line_items: order.items.map((item) => {
            if (!item.meal) throw new Error("Meal missing");

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.meal.title,
                    },
                    unit_amount: Math.round(item.meal.price * 100),
                },
                quantity: item.quantity,
            };
        }),

        metadata: {
            orderId,
            userId,
            idempotencyKey,
        },

        success_url: `${checkoutBaseUrl}/payment/success`,
        cancel_url: `${checkoutBaseUrl}/payment/cancel`,
    });

    await prisma.payment.create({
        data: {
            orderId,
            userId,
            amount: order.totalPrice,
            provider: "stripe",
            stripeSessionId: session.id,
            idempotencyKey,
        },
    });

    return session.url;
};
