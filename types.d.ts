import { ICreateUser } from "./src/models/pg/model.js";

declare global {
  namespace Express {
    interface Request {
      userInfo?: ICreateUser; // Adjust `User` to match your user type/interface
    }
  }
}
