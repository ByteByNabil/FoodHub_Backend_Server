import { Request, Response, NextFunction } from "express";
import { ReviewService } from "./review.service";

const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const result = await ReviewService.createReview(user.id, req.body);

        res.status(201).json({
            success: true,
            message: "Review added",
            data: result,
        });
    } catch (e) {
        next(e);
    }
};

const getMealReviews = async (req: Request, res: Response) => {
    const { mealId } = req.params;
    const result = await ReviewService.getMealReviews(mealId as string);

    res.status(200).json({
        success: true,
        data: result,
    });
};

const getMealRating = async (req: Request, res: Response) => {
    const { mealId } = req.params;
    const result = await ReviewService.getMealRating(mealId as string);

    res.status(200).json({
        success: true,
        data: result,
    });
};

export const ReviewController = {
    createReview,
    getMealReviews,
    getMealRating,
};