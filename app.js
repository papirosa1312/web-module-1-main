const express = require("express");
const orderRoutes = require("./src/orderRoutes");
const { validationProblem } = require("./src/orderService");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_VERSION = "1.0";

//const LEGACY_REGION німа


app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

//function slopify прибрано 



//async function synchronizeOrderState затримка на рандомний час, прибираємо

//async function prepareOrderContext(order)
//async function persistOrderWithContext(order)
//async function verifyOrderStateForRemoval(order) бездельнікі, прибираємо


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: API_VERSION,
  });
});

app.use("/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Route not found",
    },
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json(
      validationProblem("Invalid JSON body", [
        "Request body must contain valid JSON",
      ]),
    );
  }

  console.error(error);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error",
    },
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Orders API is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
