import bcrypt from "bcryptjs";
const salt = 10;
export const hashPassword = (plainPassword) => {
    return bcrypt.hashSync(plainPassword, 10);
};
export const comparePassword = (plainPassword, hashPassword) => {
    return bcrypt.compareSync(plainPassword, hashPassword);
};
