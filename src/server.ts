import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { errorHandler } from "./middleware/errorHandler.js";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { auth } from "./lib/auth.js";
import { swaggerSpec, swaggerUi } from "./lib/swagger.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 🔥 Mount better-auth

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.post("/api/auth/resend-verification", async (req, res) => {
  const { email } = req.body;
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // if (!session.user.emailVerified) {
    //   return res.status(400).json({
    //     message: "Email already verified",
    //   });
    // }

    await auth.api.sendVerificationEmail({
      headers: req.headers,
      body: {
        email,
        callbackURL: "/",
      },
    });

    return res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "Failed to resend verification email",
    });
  }
});

app.all("/api/auth/{*any}", toNodeHandler(auth));
// 🔥 Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Optional test route
app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/protected", async (req, res) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json({
    message: "Authenticated",
    user: session.user,
  });
});

app.get("/check", async (req, res) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return res.status(401).json({ status: "Auth not working" });
  }

  return res.json({
    status: "BetterAuth working",
    user: session.user,
  });
});
// ✅ Error handler should be last middleware
app.use(errorHandler);

// ✅ Listen ONLY ONCE
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
