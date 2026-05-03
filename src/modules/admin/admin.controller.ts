import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.getAllUsers(req.query);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await AdminService.updateUserStatus(
            id as string,
            req.body.status as string
        );

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AdminService.getAllOrders(req.query);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const AdminController = {
    getAllUsers,
    updateUserStatus,
    getAllOrders,
};