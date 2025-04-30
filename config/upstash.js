// Import the WorkflowClient class from Upstash Workflow SDK
import { Client as WorkflowClient } from '@upstash/workflow';

// Import required configuration from environment variables
import { QSTASH_TOKEN, QSTASH_URL } from './env.js';

// Create and export a configured instance of the Upstash WorkflowClient
export const workflowClient = new WorkflowClient({
    // Base URL for the QStash API endpoint
    baseUrl: QSTASH_URL,
    
    // Authentication token for QStash API
    token: QSTASH_TOKEN,
});