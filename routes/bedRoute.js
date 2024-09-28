import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import { availableBeds } from "../controller/bedController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { availableBedsSchema } from "../validation/bedValidation.js";

const router = express.Router();

router.post('/get-beds', authMiddleware, validate(availableBedsSchema), availableBeds)


export default router;