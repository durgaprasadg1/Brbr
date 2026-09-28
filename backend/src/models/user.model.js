const { pool } = require("../config/db");

class UserModel {
  /**
   * Find a user by their email address
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, role, is_verified, is_active, is_deleted, created_at, updated_at
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find a user by primary key ID
   * @param {number|string} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, role, is_verified, is_active, is_deleted, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find a user by phone number
   * @param {string} phone
   * @returns {Promise<object|null>}
   */
  static async findByPhone(phone) {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, role, is_verified, is_active, is_deleted, created_at, updated_at
       FROM users
       WHERE phone = ?
       LIMIT 1`,
      [phone]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create a new user record
   * @param {object} params
   * @param {string} params.name
   * @param {string} params.email
   * @param {string|null} [params.phone]
   * @param {string} [params.role]
   * @returns {Promise<number>} insertId
   */
  static async create({ name, email, phone = null, role = "CUSTOMER" }) {
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, role, is_verified, is_active, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, FALSE, TRUE, FALSE, NOW(), NOW())`,
      [name, email, phone, role]
    );
    return result.insertId;
  }

  /**
   * Mark user as verified by email
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  static async verifyUser(email) {
    const [result] = await pool.execute(
      `UPDATE users
       SET is_verified = TRUE,
           updated_at = NOW()
       WHERE email = ?`,
      [email]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update user details
   * @param {number|string} id
   * @param {object} fields
   * @returns {Promise<boolean>}
   */
  static async update(id, fields = {}) {
    const allowedFields = ["name", "phone", "role", "is_active", "is_deleted"];
    const updates = [];
    const values = [];

    for (const [key, val] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(val);
      }
    }

    if (updates.length === 0) return false;

    updates.push("updated_at = NOW()");
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }
}

module.exports = UserModel;
