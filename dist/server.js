import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/error", (req, res) => {
    throw new Error("This is a test error");
});
app.get("/async-error", async (req, res) => {
    await Promise.reject(new Error("This is a test async error"));
});
app.use(errorHandler);
app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
});
//# sourceMappingURL=server.js.map