import { prisma } from "../../lib/prisma";

const createReview = async (
    userId: string,
    payload: {
        mealId: string;
        rating: number;
        comment?: string;
    }
) => {
    // 1. check delivered order exists
    const hasOrdered = await prisma.order.findFirst({
        where: {
            customerId: userId,
            status: "DELIVERED",
            items: {
                some: {
                    mealId: payload.mealId,
                },
            },
        },
    });

    if (!hasOrdered) {
        throw new Error("You can only review meals you have ordered");
    }

    // 2. prevent duplicate review
    const alreadyReviewed = await prisma.review.findFirst({
        where: {
            userId: userId,
            mealId: payload.mealId,
        }
    });

    if (alreadyReviewed) {
        throw new Error("You already reviewed this meal");
    }

    return await prisma.review.create({
        data: {
            ...payload,
            userId: userId,
        },
    });
};

const getMealReviews = async (mealId: string) => {
    return await prisma.review.findMany({
        where: { mealId },
        include: {
            user: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};

const getMealRating = async (mealId: string) => {
    return await prisma.review.aggregate({
        where: { mealId },
        _avg: { rating: true },
        _count: { rating: true },
    });
};

export const ReviewService = {
    createReview,
    getMealReviews,
    getMealRating,
};