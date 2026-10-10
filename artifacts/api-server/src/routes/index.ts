import { Router, type IRouter } from "express";
import healthRouter from "./health";
import travelEnquiriesRouter from "./travel-enquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(travelEnquiriesRouter);

export default router;
