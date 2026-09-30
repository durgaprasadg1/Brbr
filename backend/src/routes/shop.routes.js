const express = require("express");
const ShopController = require("../controllers/shop.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("OWNER"),
  ShopController.createShop,
);

router.get(
  "/me",
  authenticate,
  authorizeRoles("OWNER"),
  ShopController.getMyShops,
);

router.get(
  "/public",
  ShopController.getActiveShops,
);

router.get(
  "/public/:id",
  ShopController.getActiveShopDetails,
);

router.post(
  "/:id/queue",
  authenticate,
  authorizeRoles("CUSTOMER"),
  ShopController.joinShopQueue,
);

router.get(
  "/:id/services",
  authenticate,
  authorizeRoles("OWNER"),
  ShopController.getShopServices,
);

router.post(
  "/:id/services",
  authenticate,
  authorizeRoles("OWNER"),
  ShopController.createShopService,
);

router.delete(
  "/:id/services/:serviceId",
  authenticate,
  authorizeRoles("OWNER"),
  ShopController.deleteShopService,
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("OWNER"),
  ShopController.updateShop,
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("OWNER"),
  ShopController.deleteShop,
);

router.get(
  "/admin/requests",
  authenticate,
  authorizeRoles("ADMIN"),
  ShopController.getPendingRequests,
);

router.get(
  "/admin/stats",
  authenticate,
  authorizeRoles("ADMIN"),
  ShopController.getAdminStats,
);

router.patch(
  "/admin/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  ShopController.reviewShopRequest,
);

module.exports = router;
