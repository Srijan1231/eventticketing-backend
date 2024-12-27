import { ICreateUser } from "./src/models/pg/user/model.js";

declare global {
  namespace Express {
    interface Request {
      userInfo?: ICreateUser; // Adjust `User` to match your user type/interface
    }
  }
}
