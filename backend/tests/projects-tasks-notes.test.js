import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Protected Resources API - Project, Task & Note Guards", () => {
    describe("Projects Endpoints", () => {
        it("GET /api/v1/projects requires authentication (401)", async () => {
            const response = await request(app).get("/api/v1/projects");
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Unauthorized request");
        });

        it("POST /api/v1/projects requires authentication (401)", async () => {
            const response = await request(app)
                .post("/api/v1/projects")
                .send({ name: "Test Project", description: "Test Description" });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("GET /api/v1/projects/:projectId requires authentication (401)", async () => {
            const response = await request(app).get("/api/v1/projects/507f1f77bcf86cd799439011");
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe("Tasks Endpoints", () => {
        it("GET /api/v1/tasks/:projectId requires authentication (401)", async () => {
            const response = await request(app).get("/api/v1/tasks/507f1f77bcf86cd799439011");
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("POST /api/v1/tasks/:projectId requires authentication (401)", async () => {
            const response = await request(app)
                .post("/api/v1/tasks/507f1f77bcf86cd799439011")
                .send({ title: "New Task" });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe("Notes Endpoints", () => {
        it("GET /api/v1/notes/:projectId requires authentication (401)", async () => {
            const response = await request(app).get("/api/v1/notes/507f1f77bcf86cd799439011");
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it("POST /api/v1/notes/:projectId requires authentication (401)", async () => {
            const response = await request(app)
                .post("/api/v1/notes/507f1f77bcf86cd799439011")
                .send({ content: "Meeting notes" });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});

