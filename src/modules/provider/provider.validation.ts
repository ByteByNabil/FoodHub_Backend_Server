import { z } from "zod";

export const createProviderSchema = z.object({
    restaurantName: z.string().min(2),
    description: z.string().optional(),
    address: z.string().min(5),
});

export const updateProviderSchema = z.object({
    restaurantName: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
});