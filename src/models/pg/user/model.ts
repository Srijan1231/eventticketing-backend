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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

`;

const createUserTableFunction = async () => {
  const checkTableExistence = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'users'
    );
  `;

  try {
    const result = await pool.query(checkTableExistence);
    const tableExists = result.rows[0].exists;
    if (!tableExists) {
      await pool.query(createUserTable);
      console.log("User Table created successfully");
    }
    console.log("User table exists already in DB");
  } catch (error) {
    console.error("Error creating User Table ", error);
  }
};
export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  type?: string;
  address: string;
}
const createUser = async ({
  name,
  email,
  password,
  type,
  address,
}: ICreateUser) => {
  const query = `
    INSERT INTO users (name, email, password,type,address)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `;
  const values = [name, email, password, type || "User", address];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.log("Database error:", error);
  }
};
interface IFindUserByEmail {
  email: string;
}
const findUserByEmail = async ({ email }: IFindUserByEmail) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1
    `;
  try {
    const result = await pool.query(query, [email]);

    return result.rows[0];
  } catch (error) {
    console.log("Database error:", error);
  }
};
interface IFindUserByID {
  id: string;
}
const findUserByID = async (id: IFindUserByID) => {
  const query = `
    SELECT * FROM users
    WHERE id = $1
    `;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.log("Database error:", error);
  }
};

const findOneUser = async (filter: Record<string, any>) => {
  const keys = Object.keys(filter);
  const values = Object.values(filter);

  const conditions = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(" AND ");

  const query = ` SELECT * FROM users WHERE ${conditions} LIMIT 1`;

  try {
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.log("Database query error:", error);
  }
};
interface IUpdateUser {
  name?: string;
  email?: string;
  address?: string;
  type?: string;
  password?: string;
  refreshToken?: string;
}

const updateUserForEmailJWT = async (
  email: string,
  { refreshToken }: IUpdateUser
) => {
  const query = `
    UPDATE users
    SET refreshToken=$1,updated_at=CURRENT_TIMESTAMP
    WHERE email = $2
    RETURNING *
    `;
  const values = [refreshToken, email];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.log("Database error:", error);
  }
};
const updateUserByID = async (id: string, updates: IUpdateUser) => {
  // Filter keys to exclude undefined fields
  const keys = Object.keys(updates).filter(
    (key) => updates[key as keyof IUpdateUser] !== undefined
  ) as (keyof IUpdateUser)[];

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
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.log("Error updating user:", error);
  }
};

const deleteUserByID = async (id: string) => {
  const query = `
      DELETE FROM users
      WHERE id = $1;
    `;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.log("Database error:", error);
  }
};

export {
  createUser,
  findUserByEmail,
  findUserByID,
  deleteUserByID,
  updateUserForEmailJWT,
  createUserTableFunction,
  findOneUser,
  updateUserByID,
};
