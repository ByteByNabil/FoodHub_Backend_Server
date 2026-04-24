import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response) => {
    const result = await AdminService.getAllUsers();
    res.json({ success: true, data: result });
};

const updateUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AdminService.updateUserStatus(
        id as string,
        req.body.status as string
    );

    res.json({ success: true, data: result });
};

const getAllOrders = async (req: Request, res: Response) => {
    const result = await AdminService.getAllOrders();
    res.json({ success: true, data: result });
};

export const AdminController = {
    getAllUsers,
    updateUserStatus,
    getAllOrders,
};