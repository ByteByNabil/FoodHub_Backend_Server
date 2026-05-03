import { prisma } from "../../lib/prisma";

const createMeal = async (
    userId: string,
    payload: any
) => {
    // find provider profile
    const provider = await prisma.providerProfile.findUniqueOrThrow({
        where: { userId },
    });

    if (!provider.isApproved) {
        throw new Error("Provider not approved yet");
    }

    return await prisma.meal.create({
        data: {
            ...payload,
            providerId: provider.id,
        },
    });
};

const getAllMeals = async (query: any) => {
    const {
        search,
        categoryId,
        minPrice,
        maxPrice,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 10,
    } = query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const conditions: any[] = [];

    //  search
    if (search) {
        conditions.push({
            OR: [
                {
                    title: { contains: search, mode: "insensitive" },
                },
                {
                    description: { contains: search, mode: "insensitive" },
                },
            ],
        });
    }

    //  category filter
    if (categoryId) {
        conditions.push({ categoryId });
    }

    //  price range
    if (minPrice || maxPrice) {
        conditions.push({
            price: {
                gte: minPrice ? Number(minPrice) : undefined,
                lte: maxPrice ? Number(maxPrice) : undefined,
            },
        });
    }

    //  only available meals
    conditions.push({ isAvailable: true });

    // sort logic
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price") {
        orderBy = { price: sortOrder === "asc" ? "asc" : "desc" };
    } else if (sortBy === "title") {
        orderBy = { title: sortOrder === "asc" ? "asc" : "desc" };
    }

    const data = await prisma.meal.findMany({
        where: { AND: conditions },
        include: {
            category: true,
            provider: {
                include: {
                    user: { select: { name: true } },
                },
            },
        },
        skip,
        take: Number(limit),
        orderBy,
    });

    const total = await prisma.meal.count({
        where: { AND: conditions },
    });

    return {
        data,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / limitNumber),
        },
    };
};

const getMealById = async (id: string) => {
    return await prisma.meal.findUniqueOrThrow({
        where: { id },
        include: {
            category: true,
            provider: {
                include: {
                    user: { select: { name: true } },
                },
            },
            reviews: true,
        },
    });
};

const getMyMealById = async (userId: string, mealId: string) => {
    // 1. get provider
    const provider = await prisma.providerProfile.findUniqueOrThrow({
        where: { userId },
    });

    // 2. get meal
    const meal = await prisma.meal.findUniqueOrThrow({
        where: { id: mealId },
    });

    // 3. ownership check
    if (meal.providerId !== provider.id) {
        throw new Error("You are not authorized to access this meal");
    }

    return meal;
};

const getMyMeals = async (userId: string) => {
    const provider = await prisma.providerProfile.findUniqueOrThrow({
        where: { userId },
    });

    return await prisma.meal.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" },
    });
};

const updateMeal = async (
    id: string,
    userId: string,
    payload: any
) => {
    const provider = await prisma.providerProfile.findUniqueOrThrow({
        where: { userId },
    });

    const meal = await prisma.meal.findUniqueOrThrow({
        where: { id },
    });

    if (meal.providerId !== provider.id) {
        throw new Error("You are not owner of this meal");
    }

    return await prisma.meal.update({
        where: { id },
        data: payload,
    });
};

const deleteMeal = async (id: string, userId: string) => {
    const provider = await prisma.providerProfile.findUniqueOrThrow({
        where: { userId },
    });

    const meal = await prisma.meal.findUniqueOrThrow({
        where: { id },
    });

    if (meal.providerId !== provider.id) {
        throw new Error("You are not owner of this meal");
    }

    return await prisma.meal.delete({
        where: { id },
    });
};

export const MealService = {
    createMeal,
    getAllMeals,
    getMealById,
    getMyMeals,
    updateMeal,
    deleteMeal,
    getMyMealById,
};