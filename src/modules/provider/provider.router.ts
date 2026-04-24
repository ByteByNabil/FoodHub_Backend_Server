import { Router } from "express";
import { ProviderController } from "./provider.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
    createProviderSchema,
    updateProviderSchema,
} from "./provider.validation";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// PUBLIC
router.get("/", ProviderController.getAllProviders);
router.get("/:id", ProviderController.getProviderById);

// PROVIDER
router.post(
    "/",
    auth(UserRole.PROVIDER),
    validateRequest(createProviderSchema),
    ProviderController.createProvider
);

router.get(
    "/me",
    auth(UserRole.PROVIDER),
    ProviderController.getMyProvider
);

router.patch(
    "/me",
    auth(UserRole.PROVIDER),
    validateRequest(updateProviderSchema),
    ProviderController.updateProvider
);

// ADMIN
router.patch(
    "/:id/approve",
    auth(UserRole.ADMIN),
    ProviderController.approveProvider
);

export const providerRouter: Router = router;