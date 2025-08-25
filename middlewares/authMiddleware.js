const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization?.split(" ")[1];
    const cookieToken = req.cookies?.token;

    if (!headerToken && !cookieToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = headerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //attach user info to req
    req.user = { id: decoded.id, email: decoded.email };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired", error });
    } else {
      return res.status(401).json({ message: "Unauthorized", error });
    }
  }
};

module.exports = authenticate;
