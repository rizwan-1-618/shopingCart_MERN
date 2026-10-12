import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";
import { TOKEN_COOKIE } from "../utils/generateToken.js";

const protect = async (req, res, next) => {
  const token = req.cookies?.[TOKEN_COOKIE];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);

    if (!customer || (decoded.tokenVersion ?? 0) !== (customer.tokenVersion ?? 0)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.user = customer;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export default protect;
