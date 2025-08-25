const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization?.split(" ")[1];
    const cookieToken = req.cookies?.accessToken;

    if (!headerToken && !cookieToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    const accessToken = headerToken || cookieToken;

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired", error });
      }
      return res.status(401).json({ message: "Unauthorized", error });
    }

    // ✅ Attach user info
    req.user = { id: decoded.id, email: decoded.email };

    // ✅ Auto-Rotate Token Logic
    const exp = decoded.exp * 1000; // ms
    const now = Date.now();

    // If less than 2 minutes left, issue a new access token
    if (exp - now < 30 * 1000) {
      const newAccessToken = jwt.sign(
        { id: decoded.id, email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: "1m" }
      );

      // 🍪 Replace old cookie
      res.cookie("token", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        // If you have "remember me", set a maxAge, else session-only
        maxAge: req.cookies?.refreshToken ? 15 * 60 * 1000 : undefined,
      });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", error });
  }
};

module.exports = authenticate;
