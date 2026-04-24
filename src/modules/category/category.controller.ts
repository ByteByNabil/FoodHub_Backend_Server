import { Request, Response, NextFunction } from "express";
import { CategoryService } from "./category.service";

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await CategoryService.createCategory(req.body);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await CategoryService.getAllCategories();

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await CategoryService.getCategoryById(id as string);

        res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await CategoryService.updateCategory(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await CategoryService.deleteCategory(id as string);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const CategoryController = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};