import pool from "@/lib/pool";
import bcrypt from "bcrypt";

type SignupUser = {
  name: string;
  email: string;
  password: string;
}

export type LoginUser = {
  email: string;
  password: string;
}

async function CheckTableExists() {
  const result = await pool.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'users'
        ) AS exists;
      `);

  const tableExists = result.rows[0]?.exists;

  if (!tableExists) {
    await pool.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
  }
}

async function CheckEmail(email: string): Promise<string> {
  const result = await pool.query(
    `SELECT 1 FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );
  return result.rows.length > 0 ? "User Already Exists" : "User Not Found";
}

async function SaveCredentials(credentials: SignupUser): Promise<string> {
  await CheckTableExists();

    const res = await CheckEmail(credentials.email);
    if (res === "User Already Exists") {
      return "User Already Exists";
    }

    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)`,
      [
        credentials.name,
        credentials.email,
        hashedPassword,
      ]
    );

    return "User Created";

}

async function CheckCredentials(credentials: LoginUser): Promise<string> {
  await CheckTableExists();

  const result = await pool.query(
    `SELECT password FROM users WHERE email = $1 LIMIT 1`,
    [credentials.email]
  );

  if (result.rows.length === 0) {
    return "User Not Found";
  }

  const hashedPassword = result.rows[0].password;
  const isPasswordCorrect = await bcrypt.compare(credentials.password, hashedPassword);

  return isPasswordCorrect ? "Login Successful" : "Incorrect Password";
}

export { CheckTableExists,CheckEmail, SaveCredentials, CheckCredentials };