import dotenv from 'dotenv';

dotenv.config();

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
export const API_URL = 'http://localhost:3000';
export const APP_URL = 'http://localhost:5173';
