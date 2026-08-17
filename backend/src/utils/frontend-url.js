const configuredFrontendUrl = () => {
    const configuredUrl =
        process.env.FRONTEND_URL || process.env.CORS_ORIGIN?.split(",")[0];

    return (configuredUrl || "http://localhost:5173").replace(/\/$/, "");
};

export { configuredFrontendUrl };
