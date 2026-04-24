import { Router } from "express";
import { CategoryController } from "./category.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createCategorySchema, updateCategorySchema } from "./category.validation";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// PUBLIC
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

// ADMIN ONLY
router.post(
    "/",
    auth(UserRole.ADMIN),
    validateRequest(createCategorySchema),
    CategoryController.createCategory
);

router.patch(
    "/:id",
    auth(UserRole.ADMIN),
    validateRequest(updateCategorySchema),
    CategoryController.updateCategory
);

router.delete(
    "/:id",
    auth(UserRole.ADMIN),
    CategoryController.deleteCategory
);

export const categoryRouter: Router = router;