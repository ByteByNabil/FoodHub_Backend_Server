import { Router } from "express";
import { handleChat } from "./ai.controller";

export const aiRouter: Router = Router();

aiRouter.post("/chat", handleChat);
