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
const createBookingTable = `

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS bookings(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ticket_type VARCHAR(50),
    total_ticket INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    CONSTRAINT unique_event UNIQUE (user_id, event_id) 

);
`;
const createBookingTableFunction = () => __awaiter(void 0, void 0, void 0, function* () {
    const checkTableExistence = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'bookings'
      );
    `;
    try {
        const result = yield pool.query(checkTableExistence);
        const tableExists = result.rows[0].exists;
        if (!tableExists) {
            yield pool.query(createBookingTable);
            console.log("Event Table created successfully");
        }
        console.log("Booking table exists already in DB");
    }
    catch (error) {
        console.error("Error creating Event Table ", error);
    }
});
const createBooking = (_a) => __awaiter(void 0, [_a], void 0, function* ({ user_id, event_id, ticket_type, }) {
    const query = ` INSERT INTO bookings(user_id,event_id,ticket_type)
    VALUES($1,$2,$3)  
    RETURNING * ;
  `;
    const values = [user_id, event_id, ticket_type];
    try {
        const result = yield pool.query(query, values);
        return result.rows[0];
    }
    catch (error) {
        console.log("Error creating booking:", error);
    }
});
const findBooking = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    if (keys.length === 0) {
        throw new Error("Filter object cannot be empty.");
    }
    const condition = keys
        .map((key, index) => values[index] === null ? `${key} IS NULL` : `${key} = $${index + 1}`)
        .join(" AND ");
    const query = `SELECT * FROM bookings WHERE ${condition};`;
    try {
        const result = yield pool.query(query, values);
        return result.rows;
    }
    catch (error) {
        console.error("Error retrieving bookings details with given parameters:", error);
        throw error; // Rethrow error for higher-level handling
    }
});
const updateBookingByID = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(updates).filter((key) => updates[key] !== undefined);
    const values = keys.map((key) => updates[key]);
    const setClause = keys.map((key, index) => `${key}=$${index + 1}`).join(", ");
    const query = `
    UPDATE bookings
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;
    values.push(id);
    try {
        const result = yield pool.query(query, values);
        return result.rows[0];
    }
    catch (error) {
        console.log("Error updating booking:", error);
    }
});
const deleteBookingByID = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `DELETE FROM users
    WHERE id = $1;
    `;
    try {
        const result = yield pool.query(query, [id]);
        return result.rows[0];
    }
    catch (error) {
        console.log("Error deleting booking:", error);
    }
});
export { createBookingTableFunction, createBooking, findBooking, updateBookingByID, deleteBookingByID, };
