import { QueryArrayConfig } from "pg";
import { connectPGSQl } from "../../../config/dbConnect";

const pool = connectPGSQl();

const createPaymentTable = `

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id INT REFERENCES bookings(id) ,
    user_id INT REFERENCES users(id) ,
    event_id INT REFERENCES events(id) ,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending' -- Could be 'pending', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_payment UNIQUE (booking_id,user_id,event_id ) 

);
`;

const createPaymentTableFunction = async () => {
  const checkTableExistence = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payments'
      );
    `;

  try {
    const result = await pool.query(checkTableExistence);
    const tableExists = result.rows[0].exists;
    if (!tableExists) {
      await pool.query(createPaymentTable);
      console.log("Payment Table created successfully");
    }
    console.log("Payment table exists already in DB");
  } catch (error) {
    console.error("Error creating Event Table ", error);
  }
};
interface ICreatePayment {
  booking_id: string;
  user_id: string;
  event_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
}
const createPayment = async ({
  booking_id,
  user_id,
  event_id,
  amount,
  payment_method,
  payment_status,
}: ICreatePayment) => {
  const query = `INSERT INTO payments (booking_id,user_id,amount,payment_method,payment_status,event_id)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING * `;
  const values = [
    booking_id,
    user_id,
    amount,
    payment_method,
    payment_status,
    event_id,
  ];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.log("Failed to create payments");
  }
};
const findPaymentsByFilter = async (filter: Record<string, any>) => {
  // Handle empty filter case
  if (!filter || Object.keys(filter).length === 0) {
    throw new Error("Filter object must have at least one condition.");
  }
  const keys = Object.keys(filter);
  const values = Object.values(filter);

  const conditions = keys
    .map((key, index) => `${key} =$${index + 1}`)
    .join(" AND ");

  const query = ` SELECT * FROM payments WHERE ${conditions} `;

  try {
    const result = await pool.query(query, values);
    return result.rows || null;
  } catch (error) {
    console.log(`Error finding payments ${keys}:`, error);
  }
};

const updatePayments = async (id: string, payment_status: string) => {
  const query = `UPDATE payments 
  SET payment_status =$1  ,updated_timestamp = CURRENT_TIMESTAMP
  WHERE id= $2
  RETURNING *
  `;
  const values = [payment_status, id];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.log("Error updating payments");
  }
};
const deletePaymentById = async (id: string) => {
  const query = `DELETE FROM payments
  WHERE id = $1`;

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.log("Payments couldn't be deleted");
  }
};
export {
  findPaymentsByFilter,
  createPayment,
  createPaymentTableFunction,
  updatePayments,
  deletePaymentById,
};
