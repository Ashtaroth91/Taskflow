import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Auth API Endpoints - Validations & Guards", () => {
    describe("POST /api/v1/auth/register", () => {
        it("should reject registration with 422 when required fields are missing", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({});

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message", "Validation Error");
            expect(Array.isArray(response.body.errors)).toBe(true);
            expect(response.body.errors.length).toBeGreaterThan(0);
        });

        it("should reject registration when email format is invalid", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    username: "validuser",
                    email: "not-an-email",
                    password: "ValidPassword123!",
                });

            expect(response.status).toBe(422);
            expect(response.body.success).toBe(false);
            const errorKeys = response.body.errors.map((err) => Object.keys(err)[0]);
            expect(errorKeys).toContain("email");
        });

        it("should reject registration when username is shorter than 5 characters", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    username: "usr",
                    email: "test@example.com",
                    password: "ValidPassword123!",
                });

            expect(response.status).toBe(422);
            expect(response.body.success).toBe(false);
            const errorKeys = response.body.errors.map((err) => Object.keys(err)[0]);
            expect(errorKeys).toContain("username");
        });

        it("should reject registration when password is shorter than 8 characters", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    username: "validuser",
                    email: "test@example.com",
                    password: "short",
                });

            expect(response.status).toBe(422);
            expect(response.body.success).toBe(false);
            const errorKeys = response.body.errors.map((err) => Object.keys(err)[0]);
            expect(errorKeys).toContain("password");
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("should reject login with 422 when password is missing", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "test@example.com",
                });

            expect(response.status).toBe(422);
            expect(response.body.success).toBe(false);
            const errorKeys = response.body.errors.map((err) => Object.keys(err)[0]);
            expect(errorKeys).toContain("password");
        });
    });

    describe("Protected Auth Endpoints without JWT", () => {
        it("should return 401 when accessing GET /api/v1/auth/current-user without token", async () => {
            const response = await request(app).get("/api/v1/auth/current-user");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message", "Unauthorized request");
        });

        it("should return 401 when accessing POST /api/v1/auth/logout without token", async () => {
            const response = await request(app).post("/api/v1/auth/logout");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message", "Unauthorized request");
        });

        it("should return 401 when providing an invalid JWT Bearer token", async () => {
            const response = await request(app)
                .get("/api/v1/auth/current-user")
                .set("Authorization", "Bearer invalid.jwt.token");

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});

