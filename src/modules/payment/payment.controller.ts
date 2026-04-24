import { Request, Response } from "express";
import { createCheckoutSession } from "./payment.service";

export const createPayment = async (req: Request, res: Response) => {
    const user = req.user!;
    const { orderId } = req.body;

    const url = await createCheckoutSession(orderId, user.id);

    res.json({
        success: true,
        url,
    });
};