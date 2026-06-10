import express from "express";
import cors from "cors";
import CookieParser from "cookie-parser";

const app = express();

//basic configurations
app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({extended : true, limit : "16kb"}));
app.use(express.static("public"));
app.use(CookieParser());
app.use("/images", express.static("public/images"));

//cors configuration
app.use(cors({
    origin : process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials : true,
    allowedHeaders : ["Content-Type", "Authorization"]
}));

import healthCheckRouter from "./routes/healthCheck.route.js";
import authRouter from "./routes/auth.route.js";
import projectRouter from "./routes/project.route.js"
import taskRouter from "./routes/task.route.js"
import noteRouter from "./routes/note.route.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notes", noteRouter);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// Global error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const errors = err.errors || [];

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

export default app;