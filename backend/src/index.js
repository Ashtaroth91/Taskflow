import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});

// Load application modules only after environment variables are available.
const [{ default: app }, { default: connectDB }] = await Promise.all([
    import("./app.js"),
    import("./db/db.js"),
]);

const port = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}`);
    });
}).catch((error) => {
    console.error("Error starting server:", error);
});
