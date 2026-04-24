import { Request, Response, NextFunction } from "express";
import { MealService } from "./meal.service";

const createMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const result = await MealService.createMeal(user.id, req.body);

        res.status(201).json({
            success: true,
            message: "Meal created",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllMeals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MealService.getAllMeals(req.query);

        res.status(200).json({
            success: true,
            message: "Meals fetched",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMealById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await MealService.getMealById(id as string);

        res.status(200).json({
            success: true,
            message: "Meal fetched",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMyMealById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const { id } = req.params;

        const result = await MealService.getMyMealById(user.id, id as string);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMyMeals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const result = await MealService.getMyMeals(user.id);

        res.status(200).json({
            success: true,
            message: "My meals",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const { id } = req.params;
        const result = await MealService.updateMeal(
            id as string,
            user.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Meal updated",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const { id } = req.params;
        const result = await MealService.deleteMeal(id as string, user.id);

        res.status(200).json({
            success: true,
            message: "Meal deleted",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const MealController = {
    createMeal,
    getAllMeals,
    getMealById,
    getMyMeals,
    updateMeal,
    deleteMeal,
    getMyMealById,
};