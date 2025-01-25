import PG from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const uri = {
  connectionString: process.env.PG_URI,
  ssl: {
    rejectUnauthorized: false
  }
}

const pool = new PG.Pool(uri)

export default pool
