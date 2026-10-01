const { pool } = require("../config/db");

class ShopModel {
  static async create({
    owner_id,
    name,
    description = null,
    image_url = null,
    address,
    latitude,
    longitude,
    contact_number,
    opening_time,
    closing_time,
  }) {
    const [result] = await pool.execute(
      `INSERT INTO shops (
        owner_id,
        name,
        description,
        image_url,
        address,
        latitude,
        longitude,
        contact_number,
        opening_time,
        closing_time,
        is_opened,
        average_rating,
        status,
        rejection_reason,
        is_deleted,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, 0.0, 'PENDING', NULL, FALSE, NOW(), NOW())`,
      [
        owner_id,
        name,
        description,
        image_url,
        address,
        latitude,
        longitude,
        contact_number,
        opening_time,
        closing_time,
      ],
    );

    return result.insertId;
  }

  static async findByOwner(ownerId) {
    const [rows] = await pool.execute(
      `SELECT *
       FROM shops
       WHERE owner_id = ? AND is_deleted = FALSE
       ORDER BY created_at DESC`,
      [ownerId],
    );

    return rows;
  }

  static async findAllActive() {
    const [rows] = await pool.execute(
      `SELECT id, name, description, image_url, address, latitude, longitude,
              contact_number, opening_time, closing_time, is_opened,
              average_rating, status
       FROM shops
       WHERE status = 'ACTIVE' AND is_deleted = FALSE
       ORDER BY is_opened DESC, created_at DESC`,
    );

    return rows;
  }

  static async findActiveById(shopId) {
    const [rows] = await pool.execute(
      `SELECT id, name, description, image_url, address, latitude, longitude,
              contact_number, opening_time, closing_time, is_opened,
              average_rating, status
       FROM shops
       WHERE id = ? AND status = 'ACTIVE' AND is_deleted = FALSE
       LIMIT 1`,
      [shopId],
    );

    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT *
       FROM shops
       WHERE id = ? AND is_deleted = FALSE
       LIMIT 1`,
      [id],
    );

    return rows[0] || null;
  }

  static async update(id, updates) {
    const entries = Object.entries(updates || {});

    if (!entries.length) {
      return false;
    }

    const assignments = entries.map(([key]) => `${key} = ?`);
    const values = entries.map(([, value]) => value);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE shops
       SET ${assignments.join(", ")}, updated_at = NOW()
       WHERE id = ? AND is_deleted = FALSE`,
      values,
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      `UPDATE shops
       SET is_deleted = TRUE,
           updated_at = NOW()
       WHERE id = ? AND is_deleted = FALSE`,
      [id],
    );

    return result.affectedRows > 0;
  }

  static async findServices(shopId) {
    const [rows] = await pool.execute(
      `SELECT id, shop_id, name, price, duration_minutes
       FROM services
       WHERE shop_id = ?
       ORDER BY id DESC`,
      [shopId],
    );

    return rows;
  }

  static async createService({ shopId, name, price, durationMinutes }) {
    const [result] = await pool.execute(
      `INSERT INTO services (shop_id, name, price, duration_minutes)
       VALUES (?, ?, ?, ?)`,
      [shopId, name, price, durationMinutes],
    );

    return result.insertId;
  }

  static async deleteService(serviceId, shopId) {
    const [result] = await pool.execute(
      `DELETE FROM services
       WHERE id = ? AND shop_id = ?`,
      [serviceId, shopId],
    );

    return result.affectedRows > 0;
  }

  static async createQueueRequest({ customerId, shopId, serviceIds }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [serviceRows] = await connection.execute(
        `SELECT id, price
         FROM services
         WHERE shop_id = ? AND id IN (${serviceIds.map(() => '?').join(', ')})`,
        [shopId, ...serviceIds],
      );

      if (serviceRows.length !== serviceIds.length) {
        throw new Error("One or more selected services are not available at this shop.");
      }

      const [requestResult] = await connection.execute(
        `INSERT INTO queue_requests (customer_id, shop_id, status, requested_at, expires_at)
         VALUES (?, ?, 'REQUESTED', NOW(), NULL)`,
        [customerId, shopId],
      );

      for (const service of serviceRows) {
        await connection.execute(
          `INSERT INTO queue_request_services (queue_request_id, service_id, price_at_booking)
           VALUES (?, ?, ?)`,
          [requestResult.insertId, service.id, service.price],
        );
      }

      await connection.commit();
      return requestResult.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAllPending() {
    const [rows] = await pool.execute(
      `SELECT s.*, u.name AS owner_name, u.email AS owner_email
       FROM shops s
       INNER JOIN users u ON u.id = s.owner_id
       WHERE s.status = 'PENDING' AND s.is_deleted = FALSE
       ORDER BY s.created_at DESC`,
    );

    return rows;
  }

  static async findAllForAdmin() {
    const [rows] = await pool.execute(
      `SELECT s.*, u.name AS owner_name, u.email AS owner_email
       FROM shops s
       INNER JOIN users u ON u.id = s.owner_id
       WHERE s.is_deleted = FALSE
       ORDER BY s.created_at DESC`,
    );
    return rows;
  }

  static async getAdminStats() {
    const [rows] = await pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM shops WHERE is_deleted = FALSE) AS total_shops,
         (SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER' AND is_deleted = FALSE) AS registered_customers,
         (SELECT COUNT(*) FROM users WHERE role = 'OWNER' AND is_active = TRUE AND is_deleted = FALSE) AS active_owners,
         (SELECT COUNT(*) FROM shops WHERE status = 'PENDING' AND is_deleted = FALSE) AS pending_approvals`,
    );

    return rows[0];
  }

  static async updateStatus(id, status, rejectionReason = null) {
    const [result] = await pool.execute(
      `UPDATE shops
       SET status = ?,
           rejection_reason = ?,
           is_opened = ?,
           updated_at = NOW()
       WHERE id = ? AND is_deleted = FALSE`,
      [status, rejectionReason, status === "ACTIVE", id],
    );

    return result.affectedRows > 0;
  }
}

module.exports = ShopModel;
