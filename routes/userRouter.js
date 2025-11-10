import express from "express";
import { getAllUsers , getUserById} from "../controllers/userController.js";

const router = express.Router();

router.get("/user/get", getAllUsers);
router.get("/user/get/:id", getUserById);

export default router;
