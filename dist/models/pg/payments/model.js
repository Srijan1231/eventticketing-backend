var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const createPaymentTableFunction = () => __awaiter(void 0, void 0, void 0, function* () {
    const checkTableExistence = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payments'
      );
    `;
    try {
        const result = yield pool.query(checkTableExistence);
        const tableExists = result.rows[0].exists;
        if (!tableExists) {
            yield pool.query(createPaymentTable);
            console.log("Payment Table created successfully");
        }
        console.log("Payment table exists already in DB");
    }
    catch (error) {
        console.error("Error creating Event Table ", error);
    }
});
const createPayment = (_a) => __awaiter(void 0, [_a], void 0, function* ({ booking_id, user_id, event_id, amount, payment_method, payment_status, }) {
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
        const result = yield pool.query(query, values);
        return result.rows[0];
    }
    catch (error) {
        console.log("Failed to create payments");
    }
});
const findPaymentsByFilter = (filter) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield pool.query(query, values);
        return result.rows || null;
    }
    catch (error) {
        console.log(`Error finding payments ${keys}:`, error);
    }
});
const updatePayments = (id, payment_status) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `UPDATE payments 
  SET payment_status =$1  ,updated_timestamp = CURRENT_TIMESTAMP
  WHERE id= $2
  RETURNING *
  `;
    const values = [payment_status, id];
    try {
        const result = yield pool.query(query, values);
        return result.rows[0];
    }
    catch (error) {
        console.log("Error updating payments");
    }
});
const deletePaymentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `DELETE FROM payments
  WHERE id = $1`;
    try {
        const result = yield pool.query(query, [id]);
        return result.rows[0];
    }
    catch (error) {
        console.log("Payments couldn't be deleted");
    }
});
export { findPaymentsByFilter, createPayment, createPaymentTableFunction, updatePayments, deletePaymentById, };
