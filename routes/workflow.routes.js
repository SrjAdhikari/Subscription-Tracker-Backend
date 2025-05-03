// Import Express Router to define modular route handlers
import { Router} from 'express';

// Import controller function for handling workflow logic
import { sendReminders } from '../controllers/workflow.controller.js'


//* ================================================
//* 🔐 WORKFLOW ROUTER - HANDLES WORKFLOW ENDPOINTS
//* ✅ BASE ROUTE : /api/v1/workflows
//* ================================================

// Create a new instance of the Express Router
const workflowRouter = Router();


// ✅ Send subscription reminders
workflowRouter.post("/subscription/reminder", sendReminders);

export default workflowRouter;