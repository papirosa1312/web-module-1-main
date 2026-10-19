const express = require("express");
const router = express.Router();

const orders = require("./orderStore");
const {
  DEFAULT_ORDER_STATUS,
  makeOrderId,
  calculateTotal,
  orderResponse,
  validationProblem,
  notFoundProblem,
  validateCreateOrder,
  normalizeItems,
} = require("./orderService");

// POST /orders
router.post("/", (req, res, next) => {
  try {
    const validationErrors = validateCreateOrder(req.body);

    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json(validationProblem("Invalid order", validationErrors));
    }

    const normalizedCustomerName = req.body.customerName.trim();
    const items = normalizeItems(req.body.items);
    const serverCalculatedTotal = calculateTotal(items);
    const status = DEFAULT_ORDER_STATUS;

    const newOrder = {
      id: makeOrderId(),
      customerName: normalizedCustomerName,
      items,
      total: serverCalculatedTotal,
      status,
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    const responseBody = orderResponse(newOrder);

    return res
      .status(201)
      .location(`/orders/${newOrder.id}`)
      .json(responseBody);
  } catch (error) {
    return next(error);
  }
});

// GET /orders
router.get("/", (req, res) => {
  const result = orders.map((order) => orderResponse(order));
  const responseBody = {
    orders: result,
    count: result.length,
  };

  res.status(200).json(responseBody);
});

// GET /orders/:id
router.get("/:id", (req, res, next) => {
  try {
    const requestedId = req.params.id;
    const matchingOrder = orders.find((order) => order.id === requestedId);

    if (!matchingOrder) {
      return res.status(404).json(notFoundProblem());
    }

    return res.status(200).json(orderResponse(matchingOrder));
  } catch (error) {
    return next(error);
  }
});

// DELETE /orders/:id
router.delete("/:id", (req, res, next) => {
  try {
    const orderId = req.params.id;
    const orderIndex = orders.findIndex((order) => order.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json(notFoundProblem());
    }

    orders.splice(orderIndex, 1);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;