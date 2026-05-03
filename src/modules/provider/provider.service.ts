import { prisma } from "../../lib/prisma";

const createProviderProfile = async (
    userId: string,
    payload: {
        restaurantName: string;
        description?: string;
        address: string;
    }
) => {
    // prevent duplicate profile
    const existing = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (existing) {
        throw new Error("Provider profile already exists!");
    }

    return await prisma.providerProfile.create({
        data: {
            userId,
            ...payload,
        },
    });
};

const getAllProviders = async (query: any = {}) => {
    const { page = 1, limit = 10 } = query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const data = await prisma.providerProfile.findMany({
        where: { isApproved: true },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
    });

    const total = await prisma.providerProfile.count({
        where: { isApproved: true },
    });

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

const getProviderById = async (id: string) => {
    return await prisma.providerProfile.findUniqueOrThrow({
        where: { id },
        include: {
            user: {
                select: { name: true },
            },
            meals: true,
        },
    });
};

const getMyProviderProfile = async (userId: string) => {
    return await prisma.providerProfile.findUniqueOrThrow({
        where: { userId },
    });
};

const updateProviderProfile = async (
    userId: string,
    payload: any
) => {
    const provider = await prisma.providerProfile.findUniqueOrThrow({
        where: { userId },
    });

    return await prisma.providerProfile.update({
        where: { id: provider.id },
        data: payload,
    });
};

const approveProvider = async (id: string) => {
    return await prisma.providerProfile.update({
        where: { id },
        data: { isApproved: true },
    });
};

export const ProviderService = {
    createProviderProfile,
    getAllProviders,
    getProviderById,
    getMyProviderProfile,
    updateProviderProfile,
    approveProvider,
};