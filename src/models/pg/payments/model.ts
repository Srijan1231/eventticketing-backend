import { connectPGSQl } from "../../../config/dbConnect";

const pool = connectPGSQl();

const createPaymentTable = `

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending' -- Could be 'pending', 'completed', 'failed'
    CONSTRAINT unique_payment UNIQUE (booking_id,user_id ) 

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
  amount: number;
  payment_method: string;
  payment_status: string;
}
const createPayment = async ({
  booking_id,
  user_id,
  amount,
  payment_method,
  payment_status,
}: ICreatePayment) => {
  const query = `INSERT INTO payments (booking_id,user_id,amount,payment_method,payment_status)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING * `;
  const values = [booking_id, user_id, amount, payment_method, payment_status];
};
