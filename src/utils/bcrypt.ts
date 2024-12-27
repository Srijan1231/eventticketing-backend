import bcrypt, { hashSync } from "bcryptjs";
const salt = 10;

export const hashPassword = (plainPassword: string) => {
  return bcrypt.hashSync(plainPassword, 10);
};
export const comparePassword = (
  plainPassword: string,
  hashPassword: string
) => {
  return bcrypt.compareSync(plainPassword, hashPassword);
};
