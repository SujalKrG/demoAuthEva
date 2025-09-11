import rateLimiter from "express-rate-limit";
export const searchLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: "too many search request, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
