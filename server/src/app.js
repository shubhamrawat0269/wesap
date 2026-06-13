import cors from "cors";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.route.js";
import statusRoutes from "./routes/status.route.js";
import messageRoutes from "./routes/message.route.js";

import { initiazeSockets } from "./services/socket.service.js";

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
app.use(cookieParser());

const server = http.createServer(app);
const io = initiazeSockets(server);

// middleware to apply socket before routing
app.use((req, res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap;

  next();
});

app.use("/api/users", userRoutes);
app.use("/api/chat", messageRoutes);
app.use("/api/status", statusRoutes);

export default app;
