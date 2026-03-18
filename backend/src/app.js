const express = require("express");

const { documentsRouter } = require("./routes/documents");
const { companiesRouter } = require("./routes/companies");
const { errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  app.use(express.json({ limit: "10mb" }));

  app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Backend is running" });
  });

  const api = express.Router();
  api.get("/health", (req, res) => res.json({ status: "OK" }));
  api.use("/documents", documentsRouter);
  api.use("/companies", companiesRouter);

  app.use("/api/v1", api);

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };

