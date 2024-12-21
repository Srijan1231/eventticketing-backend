var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { connectPGSQl } from "../../../config/dbConnect.js";
const pool = connectPGSQl();
const createUserTable = `
     
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) DEFAULT 'User',
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  address VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  refreshToken VARCHAR(255),
  accessToken VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

`;
const createUserTableFunction = () => __awaiter(void 0, void 0, void 0, function* () {
    const checkTableExistence = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'users'
    );
  `;
    try {
        const result = yield pool.query(checkTableExistence);
        const tableExists = result.rows[0].exists;
        if (!tableExists) {
            yield pool.query(createUserTable);
            console.log("User Table created successfully");
        }
        console.log("User table exists already in DB");
    }
    catch (error) {
        console.error("Error creating User Table ", error);
    }
});
const createUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, email, password, type, address, }) {
    const query = `
    INSERT INTO users (name, email, password,type,address)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `;
    const values = [name, email, password, type || "User", address];
    try {
        const result = yield pool.query(query, values);
        return result.rows[0];
    }
    catch (error) {
        console.log("Database error:", error);
    }
});
const findUserByEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email }) {
    const query = `
    SELECT * FROM users
    WHERE email = $1
    `;
    try {
        const result = yield pool.query(query, [email]);
        return result.rows[0];
    }
    catch (error) {
        console.log("Database error:", error);
    }
});
const findUserByID = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT * FROM users
    WHERE id = $1
    `;
    try {
        const result = yield pool.query(query, [id]);
        return result.rows[0];
    }
    catch (error) {
        console.log("Database error:", error);
    }
});
const findOneUser = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    const conditions = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(" AND ");
    const query = ` SELECT * FROM users WHERE ${conditions} LIMIT 1`;
    try {
        const result = yield pool.query(query, values);
        return result.rows[0] || null;
    }
    catch (error) {
        console.log("Database query error:", error);
    }
});
const updateUserForEmailJWT = (email_1, _a) => __awaiter(void 0, [email_1, _a], void 0, function* (email, { refreshToken, accessToken }) {
    const query = `
    UPDATE users
    SET refreshToken=$1,accessToken=$2,updated_at=CURRENT_TIMESTAMP
    WHERE email = $3
    RETURNING *
    `;
    const values = [refreshToken, accessToken, email];
    try {
        const result = yield pool.query(query, values);
        return result.rows[0];
    }
    catch (error) {
        console.log("Database error:", error);
    }
});
const updateUserByID = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    // Filter keys to exclude undefined fields
    const keys = Object.keys(updates).filter((key) => updates[key] !== undefined);
    const values = keys.map((key) => updates[key]);
    // Dynamically construct the SET clause
    const setClause = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
    // Add the `id` as the last parameter for the WHERE clause
    const query = `
    UPDATE users
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;
    values.push(id); // Append the `id` to the values array
    try {
        const result = yield pool.query(query, values);
        return result.rows[0];
    }
    catch (error) {
        console.log("Error updating user:", error);
    }
});
const deleteUserByID = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
      DELETE FROM users
      WHERE id = $1;
    `;
    try {
        const result = yield pool.query(query, [id]);
        return result.rows[0];
    }
    catch (error) {
        console.log("Database error:", error);
    }
});
export { createUser, findUserByEmail, findUserByID, deleteUserByID, updateUserForEmailJWT, createUserTableFunction, findOneUser, updateUserByID, };
