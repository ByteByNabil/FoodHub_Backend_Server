import { z } from "zod";

export const createMealSchema = z.object({
    title: z.string().min(2),
    price: z.number().positive(),
    description: z.string().optional(),
    image: z.string().optional(),
    categoryId: z.string(),
});

export const updateMealSchema = z.object({
    title: z.string().optional(),
    price: z.number().positive().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    categoryId: z.string().optional(),
    isAvailable: z.boolean().optional(),
});