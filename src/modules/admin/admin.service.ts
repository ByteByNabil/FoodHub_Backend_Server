import { prisma } from "../../lib/prisma";
import { UserStatus } from "../../../generated/prisma/client.js";

const getAllUsers = async (query: any = {}) => {
    const { page = 1, limit = 10 } = query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const data = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
    });

    const total = await prisma.user.count();

    return {
        data,
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPage: Math.ceil(total / limitNumber),
        },
    };
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

const getAllOrders = async (query: any = {}) => {
    const { page = 1, limit = 10 } = query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const data = await prisma.order.findMany({
        include: {
            items: true,
            customer: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
    });

    const total = await prisma.order.count();

    return {
        data,
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPage: Math.ceil(total / limitNumber),
        },
    };
};

export const AdminService = {
    getAllUsers,
    updateUserStatus,
    getAllOrders,
};
