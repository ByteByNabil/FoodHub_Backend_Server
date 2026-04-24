import { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const result = await OrderService.createOrder(user.id, req.body);

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const result = await OrderService.getMyOrders(user.id);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getProviderOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const result = await OrderService.getProviderOrders(user.id);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const { id } = req.params;
        const result = await OrderService.updateOrderStatus(
            id as string,
            user.id,
            user.role,
            req.body.status
        );

        res.status(200).json({
            success: true,
            message: "Order updated",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const OrderController = {
    createOrder,
    getMyOrders,
    getProviderOrders,
    updateOrderStatus,
};