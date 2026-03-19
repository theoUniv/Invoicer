const express = require("express");
const cors = require("cors");

const { documentsRouter } = require("./routes/documents");
const { companiesRouter } = require("./routes/companies");
const { authRouter } = require("./routes/auth");
const { filesRouter } = require("./routes/files");
const { errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();
  
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Backend is running" });
  });

  const api = express.Router();
  api.get("/health", (req, res) => res.json({ status: "OK" }));
  api.use("/auth", authRouter);
  api.use("/files", filesRouter);
  api.use("/documents", documentsRouter);
  api.use("/companies", companiesRouter);

  // Keep versioned API + add /api (requested routes)
  app.use("/api/v1", api);
  app.use("/api", api);

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };

