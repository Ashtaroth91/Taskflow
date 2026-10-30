import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Root & HealthCheck API Endpoints", () => {
    it("should return 200 and 'Hello, World!' for GET /", async () => {
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
        expect(response.text).toBe("Hello, World!");
    });

    it("should return 200 and healthy payload for GET /api/v1/healthcheck", async () => {
        const response = await request(app).get("/api/v1/healthcheck");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("statusCode", 200);
        expect(response.body).toHaveProperty("message", "Health check successful");
        expect(response.body.data).toEqual({ status: "OK" });
    });

    it("should serve OpenAPI Swagger UI at /api-docs/", async () => {
        const response = await request(app).get("/api-docs/");
        // Swagger UI typically redirects or returns 200 with HTML
        expect([200, 301, 302]).toContain(response.status);
    });
});

