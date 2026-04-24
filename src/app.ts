import express, { Application } from "express";
import cors from "cors";

const app: Application = express();

app.use(cors({ origin: process.env.APP_URL, credentials: true }))
app.use(express.json())

app.get("/", (req, res) => {
    res.send("FoodHub API running...");
});



export default app;
