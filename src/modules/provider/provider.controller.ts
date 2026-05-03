import { Request, Response, NextFunction } from "express";
import { ProviderService } from "./provider.service";

const createProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        if (!user) throw new Error("Unauthorized");

        const result = await ProviderService.createProviderProfile(
            user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Provider profile created",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllProviders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ProviderService.getAllProviders(req.query);

        res.status(200).json({
            success: true,
            message: "Providers fetched",
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

const getProviderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const result = await ProviderService.getProviderById(id as string);

        res.status(200).json({
            success: true,
            message: "Provider fetched",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMyProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const result = await ProviderService.getMyProviderProfile(user.id);

        res.status(200).json({
            success: true,
            message: "My provider profile",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;
        const result = await ProviderService.updateProviderProfile(user.id, req.body);

        res.status(200).json({
            success: true,
            message: "Provider updated",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const approveProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const result = await ProviderService.approveProvider(id as string);

        res.status(200).json({
            success: true,
            message: "Provider approved",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const ProviderController = {
    createProvider,
    getAllProviders,
    getProviderById,
    getMyProvider,
    updateProvider,
    approveProvider,
};