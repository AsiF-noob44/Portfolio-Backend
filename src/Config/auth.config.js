import jwt from "jsonwebtoken";

const encodeToken = (email, id) => {
  console.log(email, id);
  const payload = { email, id };
  const key = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, key, { expiresIn });
};

const decodeToken = (token) => {
  try {
    const key = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, key);
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

const authConfigs = {
  encodeToken,
  decodeToken,
};
export default authConfigs;
