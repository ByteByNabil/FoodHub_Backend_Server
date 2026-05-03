import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors,
            });
        }
    };
};

export default validateRequest;