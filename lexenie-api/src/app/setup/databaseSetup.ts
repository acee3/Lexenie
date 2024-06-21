import mysql, { PoolOptions, RowDataPacket } from "mysql2";
import { Pool } from "mysql2/promise";
import { SetupError, UnknownError, QueryError } from "../lib/errors.js";
import dotenv from 'dotenv';
dotenv.config();

export default class Database {
  private static promisePool: Pool;
  public CONVERSATION_TABLE_NAME: string;
  public MESSAGE_TABLE_NAME: string;
  public USER_TABLE_NAME: string;
  public BOT_USER_ID: string;

  constructor() {
    const access: PoolOptions = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
      idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };

    try {
      const pool = mysql.createPool(access);
      Database.promisePool = pool.promise();
    } catch {
      throw new SetupError("Could not connect to database");
    }
    
    // const [rows, fields] = await this.promisePool.query('SELECT 1');
    // console.log(rows);
    // console.log(fields);

    if (process.env.CONVERSATION_TABLE_NAME == undefined || process.env.MESSAGE_TABLE_NAME == undefined || process.env.USER_TABLE_NAME == undefined || process.env.BOT_USER_ID == undefined)
      throw new SetupError("Missing environment variables");

    this.CONVERSATION_TABLE_NAME = process.env.CONVERSATION_TABLE_NAME;
    this.MESSAGE_TABLE_NAME = process.env.MESSAGE_TABLE_NAME;
    this.USER_TABLE_NAME = process.env.USER_TABLE_NAME;
    
    this.BOT_USER_ID = process.env.BOT_USER_ID;
  }
  
  async query<T extends RowDataPacket>(sql: string, args: string[]): Promise<T[]> {
    try {
      const [rows, _] = await Database.promisePool.query<T[]>(sql, args);
      return rows;
    } catch (error) {
      if (!(error instanceof Error)) throw new UnknownError();
      throw new QueryError(error.message);
    }
  }
}
