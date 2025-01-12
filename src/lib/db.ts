import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // 環境変数に設定
  ssl: {
    rejectUnauthorized: false, // Docker環境やNeonの場合に必要
  },
});

export default pool;
