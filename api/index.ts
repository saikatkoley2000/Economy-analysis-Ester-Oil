import express from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "node:http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup simple log middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      console.log(logLine);
    }
  });

  next();
});

const httpServer = createServer(app);

// Initialize routes synchronously or asynchronously
(async () => {
  await registerRoutes(httpServer, app);
})();

// Export default app for Vercel
export default app;
