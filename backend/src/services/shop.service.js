const ShopModel = require("../models/shop.model");

class ShopService {
  static async createShop({ ownerId, name, description, imageUrl, address, latitude, longitude, contactNumber, openingTime, closingTime }) {
    const trimmedName = String(name || "").trim();
    const trimmedAddress = String(address || "").trim();
    const trimmedContact = String(contactNumber || "").trim();
    const trimmedOpening = String(openingTime || "").trim();
    const trimmedClosing = String(closingTime || "").trim();
    const trimmedImageUrl = imageUrl ? String(imageUrl).trim() : null;

    if (!trimmedName) {
      throw new Error("Shop name is required.");
    }

    if (!trimmedAddress) {
      throw new Error("Shop address is required.");
    }

    if (!trimmedContact) {
      throw new Error("Contact number is required.");
    }

    if (!trimmedOpening || !trimmedClosing) {
      throw new Error("Opening and closing times are required.");
    }

    if (trimmedImageUrl && !(/^https?:\/\//i.test(trimmedImageUrl) || trimmedImageUrl.startsWith("data:image/"))) {
      throw new Error("Please upload a valid image file or URL.");
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
      throw new Error("Valid shop coordinates are required.");
    }

    const shopId = await ShopModel.create({
      owner_id: ownerId,
      name: trimmedName,
      description: description ? String(description).trim() : null,
      image_url: trimmedImageUrl,
      address: trimmedAddress,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      contact_number: trimmedContact,
      opening_time: trimmedOpening,
      closing_time: trimmedClosing,
    });

    const shop = await ShopModel.findById(shopId);

    return {
      shop,
      message: "Shop submitted successfully. It is now waiting for admin approval.",
    };
  }

  static async updateShop({ ownerId, shopId, updates = {} }) {
    const shop = await ShopModel.findById(shopId);

    if (!shop) {
      throw new Error("Shop not found.");
    }

    if (shop.owner_id !== ownerId) {
      throw new Error("You are not allowed to update this shop.");
    }

    const nextFields = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );

    if (nextFields.name !== undefined) {
      nextFields.name = String(nextFields.name).trim();
      if (!nextFields.name) throw new Error("Shop name is required.");
    }

    if (nextFields.address !== undefined) {
      nextFields.address = String(nextFields.address).trim();
      if (!nextFields.address) throw new Error("Shop address is required.");
    }

    if (nextFields.contact_number !== undefined) {
      nextFields.contact_number = String(nextFields.contact_number).trim();
      if (!nextFields.contact_number) throw new Error("Contact number is required.");
    }

    if (nextFields.image_url !== undefined) {
      const imageValue = String(nextFields.image_url || "").trim();
      nextFields.image_url = imageValue && ((/^https?:\/\//i.test(imageValue)) || imageValue.startsWith("data:image/")) ? imageValue : null;
    }

    if (nextFields.latitude !== undefined) {
      nextFields.latitude = Number(nextFields.latitude);
      if (Number.isNaN(nextFields.latitude)) throw new Error("Valid latitude is required.");
    }

    if (nextFields.longitude !== undefined) {
      nextFields.longitude = Number(nextFields.longitude);
      if (Number.isNaN(nextFields.longitude)) throw new Error("Valid longitude is required.");
    }

    if (nextFields.is_opened !== undefined) {
      nextFields.is_opened = Boolean(nextFields.is_opened);
    }

    const updated = await ShopModel.update(shopId, nextFields);

    if (!updated) {
      throw new Error("Unable to update shop details.");
    }

    const updatedShop = await ShopModel.findById(shopId);

    return {
      shop: updatedShop,
      message: "Shop updated successfully.",
    };
  }

  static async deleteShop({ ownerId, shopId }) {
    const shop = await ShopModel.findById(shopId);

    if (!shop) {
      throw new Error("Shop not found.");
    }

    if (shop.owner_id !== ownerId) {
      throw new Error("You are not allowed to delete this shop.");
    }

    const deleted = await ShopModel.delete(shopId);

    if (!deleted) {
      throw new Error("Unable to delete this shop.");
    }

    return { message: "Shop deleted successfully." };
  }

  static async listShopServices({ ownerId, shopId }) {
    await this.assertOwnerShop(ownerId, shopId);
    return { services: await ShopModel.findServices(shopId) };
  }

  static async addShopService({ ownerId, shopId, name, price, durationMinutes }) {
    await this.assertOwnerShop(ownerId, shopId);

    const trimmedName = String(name || "").trim();
    const parsedPrice = Number(price);
    const parsedDuration = Number(durationMinutes);

    if (!trimmedName) throw new Error("Service name is required.");
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) throw new Error("Valid service price is required.");
    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) throw new Error("Valid service duration is required.");

    const serviceId = await ShopModel.createService({
      shopId,
      name: trimmedName,
      price: parsedPrice,
      durationMinutes: parsedDuration,
    });

    return {
      service: (await ShopModel.findServices(shopId)).find((service) => service.id === serviceId),
      message: "Service added successfully.",
    };
  }

  static async removeShopService({ ownerId, shopId, serviceId }) {
    await this.assertOwnerShop(ownerId, shopId);
    const deleted = await ShopModel.deleteService(serviceId, shopId);

    if (!deleted) throw new Error("Service not found.");

    return { message: "Service deleted successfully." };
  }

  static async assertOwnerShop(ownerId, shopId) {
    const shop = await ShopModel.findById(shopId);

    if (!shop) throw new Error("Shop not found.");
    if (shop.owner_id !== ownerId) throw new Error("You are not allowed to manage this shop.");

    return shop;
  }

  static async listOwnerShops(ownerId) {
    const shops = await ShopModel.findByOwner(ownerId);
    return { shops };
  }

  static async listActiveShops() {
    const shops = await ShopModel.findAllActive();
    return { shops };
  }

  static async getActiveShopDetails(shopId) {
    const shop = await ShopModel.findActiveById(shopId);

    if (!shop) {
      throw new Error("Shop not found.");
    }

    return {
      shop,
      services: await ShopModel.findServices(shopId),
    };
  }

  static async joinShopQueue({ customerId, shopId, serviceIds = [] }) {
    const shop = await ShopModel.findActiveById(shopId);

    if (!shop) throw new Error("Shop not found.");
    if (!Boolean(shop.is_opened)) throw new Error("This shop is currently closed.");

    const normalizedServiceIds = [...new Set(serviceIds.map((serviceId) => Number(serviceId)).filter(Number.isInteger))];

    if (!normalizedServiceIds.length) throw new Error("Select at least one service.");

    const queueRequestId = await ShopModel.createQueueRequest({
      customerId,
      shopId,
      serviceIds: normalizedServiceIds,
    });

    return {
      queueRequestId,
      message: "You joined the queue successfully.",
    };
  }

  static async listPendingShopRequests() {
    const shops = await ShopModel.findAllPending();
    return { shops };
  }

  static async listAdminShops() {
    const shops = await ShopModel.findAllForAdmin();
    return { shops };
  }

  static async getAdminStats() {
    return ShopModel.getAdminStats();
  }

  static async reviewShopRequest(shopId, action, rejectionReason = null) {
    const allowedStatuses = ["ACTIVE", "REJECTED"];
    const normalizedAction = String(action || "").trim().toUpperCase();

    if (!allowedStatuses.includes(normalizedAction)) {
      throw new Error("Invalid shop request action.");
    }

    const shop = await ShopModel.findById(shopId);
    if (!shop) {
      throw new Error("Shop request not found.");
    }

    if (shop.status !== "PENDING") {
      throw new Error("This shop request has already been reviewed.");
    }

    if (normalizedAction === "REJECTED" && !String(rejectionReason || "").trim()) {
      throw new Error("A rejection reason is required.");
    }

    const status = normalizedAction === "ACTIVE" ? "ACTIVE" : "REJECTED";
    const updated = await ShopModel.updateStatus(
      shopId,
      status,
      normalizedAction === "REJECTED" ? String(rejectionReason).trim() : null,
    );

    if (!updated) {
      throw new Error("Unable to update shop request.");
    }

    return {
      message: normalizedAction === "ACTIVE"
        ? "Shop request approved successfully."
        : "Shop request rejected successfully.",
      status,
    };
  }
}

module.exports = ShopService;
