import { z } from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(1, "Category name is required")
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name is too long"),
});

export const updateCategorySchema = z.object({
    name: z
        .string()
        .min(2)
        .max(50)
        .optional(),
});