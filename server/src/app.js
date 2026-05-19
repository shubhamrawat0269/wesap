import cors from "cors";
import express from "express";

import userRoutes from "./routes/user.route.js";

const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_LOCAL_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);

export default app;
