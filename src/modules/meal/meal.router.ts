import { Router } from "express";
import { MealController } from "./meal.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createMealSchema, updateMealSchema } from "./meal.validation";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router();

// PUBLIC
router.get("/", MealController.getAllMeals);
router.get("/:id", MealController.getMealById);

// PROVIDER
router.post(
    "/",
    auth(UserRole.PROVIDER),
    validateRequest(createMealSchema),
    MealController.createMeal
);

router.get(
    "/my/meals",
    auth(UserRole.PROVIDER),
    MealController.getMyMeals
);

router.get(
    "/my/meals/:id",
    auth(UserRole.PROVIDER),
    MealController.getMyMealById
);

router.patch(
    "/:id",
    auth(UserRole.PROVIDER),
    validateRequest(updateMealSchema),
    MealController.updateMeal
);

router.delete(
    "/:id",
    auth(UserRole.PROVIDER),
    MealController.deleteMeal
);

export const mealRouter: Router = router;