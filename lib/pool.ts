import { Pool } from 'pg';
import dotenv from 'dotenv';

//load environment variables from .env file
dotenv.config();
const pool = new Pool({
  host: process.env.NEXT_PUBLIC_POSTGRES_HOST || 'localhost',
  user: process.env.NEXT_PUBLIC_POSTGRES_USERNAME || 'postgres',
  database: process.env.NEXT_PUBLIC_POSTGRES_DATABASE || 'cs355',
  password: process.env.NEXT_PUBLIC_POSTGRES_PASSWORD || '2175',
  port: parseInt(process.env.NEXT_PUBLIC_POSTGRES_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;