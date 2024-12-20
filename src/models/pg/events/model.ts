import { connectPGSQl } from "../../../config/dbConnect.js";

const pool = connectPGSQl();

const createEventTable = `

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 name VARCHAR(255) NOT NULL,
 event_date TIMESTAMP NOT NULL,
 location VARCHAR(255),
 capacity INT NOT NULL,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT unique_event UNIQUE (name, event_date, location) 

);


`;

const createEventTableFunction = async () => {
  const checkTableExistence = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'events'
      );
    `;

  try {
    const result = await pool.query(checkTableExistence);
    const tableExists = result.rows[0].exists;
    if (!tableExists) {
      await pool.query(createEventTable);
      console.log("Event Table created successfully");
    }
    console.log("Event table exists already in DB");
  } catch (error) {
    console.error("Error creating Event Table ", error);
  }
};
interface ICreateEvent {
  name: string;
  event_date: Date;
  location: string;
  capacity: number;
  user_id: string;
}
const createEvent = async ({
  name,
  event_date,
  location,
  capacity,
  user_id,
}: ICreateEvent) => {
  const query = `
    INSERT INTO events (name, event_date, location,capacity,user_id)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `;
  const values = [name, event_date, location, capacity, user_id];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.log("Error Creating events:", error);
  }
};

const findEventByID = async (id: string) => {
  const query = `
    SELECT * FROM events
    WHERE id = $1
    `;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.log("Error Finding Events by ID:", error);
  }
};
const findAllEvent = async () => {
  try {
    const result = await pool.query("SELECT * FROM events");
    return result.rows;
  } catch (error) {
    console.log("Error fetching events:", error);
  }
};
const findEventByFilter = async (filter: Record<string, any>) => {
  const keys = Object.keys(filter);
  const values = Object.values(filter);

  const conditions = keys
    .map((key, index) => `${key} =$${index + 1}`)
    .join(" AND ");

  const query = ` SELECT * FROM events WHERE ${conditions} `;

  try {
    const result = await pool.query(query, values);
    return result.rows || null;
  } catch (error) {
    console.log(`Error finding events ${keys}:`, error);
  }
};
interface IUpdateEvent {
  name: string;
  event_date: Date;
  location: string;
  capacity: number;
  user_id: string;
}
const updateEventByID = async (id: string, updates: IUpdateEvent) => {
  // Filter keys to exclude undefined fields
  const keys = Object.keys(updates).filter(
    (key) => updates[key as keyof IUpdateEvent] !== undefined
  ) as (keyof IUpdateEvent)[];
  const values = keys.map((key) => updates[key]);

  // Dynamically construct the SET clause
  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE events
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;
  values.push(id);
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.log("Error updating events:", error);
  }
};
interface IDeleteEvent {
  id: string;
}
const deleteEvent = async (id: IDeleteEvent) => {
  const query = `
        DELETE FROM events
        WHERE id = $1;
      `;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.log("Error deleting events:", error);
  }
};
export {
  createEventTableFunction,
  createEvent,
  findEventByID,
  findEventByFilter,
  updateEventByID,
  deleteEvent,
  findAllEvent,
};
