const ShopService = require("../services/shop.service");

class ShopController {
  static async createShop(req, res, next) {
    try {
      const result = await ShopService.createShop({
        ownerId: req.user.id,
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.image_url || req.body.imageUrl,
        address: req.body.address,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        contactNumber: req.body.contact_number || req.body.contactNumber,
        openingTime: req.body.opening_time || req.body.openingTime,
        closingTime: req.body.closing_time || req.body.closingTime,
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        shop: result.shop,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateShop(req, res, next) {
    try {
      const result = await ShopService.updateShop({
        ownerId: req.user.id,
        shopId: req.params.id,
        updates: {
          name: req.body.name,
          description: req.body.description,
          image_url: req.body.image_url || req.body.imageUrl,
          address: req.body.address,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          contact_number: req.body.contact_number || req.body.contactNumber,
          opening_time: req.body.opening_time || req.body.openingTime,
          closing_time: req.body.closing_time || req.body.closingTime,
          is_opened: req.body.is_opened,
        },
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        shop: result.shop,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteShop(req, res, next) {
    try {
      const result = await ShopService.deleteShop({
        ownerId: req.user.id,
        shopId: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getShopServices(req, res, next) {
    try {
      const result = await ShopService.listShopServices({
        ownerId: req.user.id,
        shopId: req.params.id,
      });

      return res.status(200).json({ success: true, services: result.services });
    } catch (error) {
      next(error);
    }
  }

  static async createShopService(req, res, next) {
    try {
      const result = await ShopService.addShopService({
        ownerId: req.user.id,
        shopId: req.params.id,
        name: req.body.name,
        price: req.body.price,
        durationMinutes: req.body.duration_minutes || req.body.durationMinutes,
      });

      return res.status(201).json({ success: true, message: result.message, service: result.service });
    } catch (error) {
      next(error);
    }
  }

  static async deleteShopService(req, res, next) {
    try {
      const result = await ShopService.removeShopService({
        ownerId: req.user.id,
        shopId: req.params.id,
        serviceId: req.params.serviceId,
      });

      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async getMyShops(req, res, next) {
    try {
      const result = await ShopService.listOwnerShops(req.user.id);
      return res.status(200).json({
        success: true,
        shops: result.shops,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActiveShops(req, res, next) {
    try {
      const result = await ShopService.listActiveShops();
      return res.status(200).json({
        success: true,
        shops: result.shops,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActiveShopDetails(req, res, next) {
    try {
      const result = await ShopService.getActiveShopDetails(req.params.id);
      return res.status(200).json({
        success: true,
        shop: result.shop,
        services: result.services,
      });
    } catch (error) {
      next(error);
    }
  }

  static async joinShopQueue(req, res, next) {
    try {
      const result = await ShopService.joinShopQueue({
        customerId: req.user.id,
        shopId: req.params.id,
        serviceIds: req.body.service_ids || req.body.serviceIds,
      });

      return res.status(201).json({
        success: true,
        message: result.message,
        queue_request_id: result.queueRequestId,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingRequests(req, res, next) {
    try {
      const result = await ShopService.listPendingShopRequests();
      return res.status(200).json({
        success: true,
        shops: result.shops,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminStats(req, res, next) {
    try {
      const stats = await ShopService.getAdminStats();
      return res.status(200).json({
        success: true,
        stats: {
          total_shops: Number(stats.total_shops || 0),
          registered_customers: Number(stats.registered_customers || 0),
          active_owners: Number(stats.active_owners || 0),
          pending_approvals: Number(stats.pending_approvals || 0),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async reviewShopRequest(req, res, next) {
    try {
      const result = await ShopService.reviewShopRequest(
        req.params.id,
        req.body.action,
        req.body.rejection_reason || req.body.rejectionReason,
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        status: result.status,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ShopController;
