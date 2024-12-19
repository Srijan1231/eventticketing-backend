var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { connectPGSQl } from "../../config/dbConnect.js";
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
    try {
        yield pool.query(createUserTable);
        console.log("User Table created successfully");
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
    const result = yield pool.query(query, values);
    return result.rows[0];
});
const findUserByEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email }) {
    const query = `
    SELECT * FROM users
    WHERE email = $1
    `;
    const result = yield pool.query(query, [email]);
    return result.rows[0];
});
const findUserByID = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT * FROM users
    WHERE id = $1
    `;
    const result = yield pool.query(query, [id]);
    return result.rows[0];
});
const updateUser = (id_1, _a) => __awaiter(void 0, [id_1, _a], void 0, function* (id, { name, email, address, type, password }) {
    const query = `
    UPDATE users
    SET name = $1, email = $2, address=$3, type=$4,password=$5,updated_at=CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
    `;
    const values = [name, email, address, type, password, id];
    const result = yield pool.query(query, values);
    return result.rows[0];
});
const updateUserByEmailJWT = (email_1, _a) => __awaiter(void 0, [email_1, _a], void 0, function* (email, { refreshToken, accessToken }) {
    const query = `
    UPDATE users
    SET refreshToken=$1,accessToken=$2,updated_at=CURRENT_TIMESTAMP
    WHERE email = $3
    RETURNING *
    `;
    const values = [refreshToken, accessToken, email];
    const result = yield pool.query(query, values);
    return result.rows[0];
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
      DELETE FROM users
      WHERE id = $1;
    `;
    const result = yield pool.query(query, [id]);
    return result.rowCount;
});
export { createUser, findUserByEmail, findUserByID, updateUser, deleteUser, updateUserByEmailJWT, createUserTableFunction, };
