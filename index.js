import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import {resolve} from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import userRouter from "./routes/user.routes.js";
import todoRouter from "./routes/todo.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT||3010;

app.use(express.json());

app.use(express.static(resolve(__dirname,"public")));

app.use("/api/users", userRouter);
app.use("/api/todos", todoRouter);


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`Server running on ${port}`));
  })
  .catch((err) => console.log("MongoDB connection error:", err));




