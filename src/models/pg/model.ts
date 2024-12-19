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

const createUserTableFunction = async () => {
  try {
    await pool.query(createUserTable);
    console.log("User Table created successfully");
  } catch (error) {
    console.error("Error creating User Table ", error);
  }
};
interface ICreateUser {
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
  const result = await pool.query(query, values);
  return result.rows[0];
};
interface IFindUserByEmail {
  email: string;
}
const findUserByEmail = async ({ email }: IFindUserByEmail) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1
    `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};
interface IFindUserByID {
  id: string;
}
const findUserByID = async (id: IFindUserByID) => {
  const query = `
    SELECT * FROM users
    WHERE id = $1
    `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};
interface IUpdateUser {
  name?: string;
  email?: string;
  address?: string;
  type?: string;
  password?: string;
}
const updateUser = async (
  id: string,
  { name, email, address, type, password }: IUpdateUser
) => {
  const query = `
    UPDATE users
    SET name = $1, email = $2, address=$3, type=$4,password=$5,updated_at=CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
    `;
  const values = [name, email, address, type, password, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};
interface IUpdateUserByEmailJWT {
  name?: string;

  address?: string;
  type?: string;
  password?: string;
  refreshToken?: string;
  accessToken?: string;
}
const updateUserByEmailJWT = async (
  email: string,
  { refreshToken, accessToken }: IUpdateUserByEmailJWT
) => {
  const query = `
    UPDATE users
    SET refreshToken=$1,accessToken=$2,updated_at=CURRENT_TIMESTAMP
    WHERE email = $3
    RETURNING *
    `;
  const values = [refreshToken, accessToken, email];
  const result = await pool.query(query, values);
  return result.rows[0];
};
/* const updateUser = async (id: string, updates: IUpdateUser) => {
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

  const result = await pool.query(query, values);
  return result.rows[0];
}; */
interface IDeleteUser {
  id: string;
}
const deleteUser = async (id: IDeleteUser) => {
  const query = `
      DELETE FROM users
      WHERE id = $1;
    `;
  const result = await pool.query(query, [id]);
  return result.rowCount;
};

export {
  createUser,
  findUserByEmail,
  findUserByID,
  updateUser,
  deleteUser,
  updateUserByEmailJWT,
  createUserTableFunction,
};
