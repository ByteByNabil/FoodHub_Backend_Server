import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/client";

const getAllUsers = async () => {
    return await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });
};


const updateUserStatus = async (userId: string, status: string) => {
    if (!Object.values(UserStatus).includes(status as UserStatus)) {
        throw new Error("Invalid status");
    }

    return await prisma.user.update({
        where: { id: userId },
        data: { status: status as UserStatus },
    });
};

const getAllOrders = async () => {
    return await prisma.order.findMany({
        include: {
            items: true,
            customer: { select: { name: true } },
        },
    });
};

export const AdminService = {
    getAllUsers,
    updateUserStatus,
    getAllOrders,
};