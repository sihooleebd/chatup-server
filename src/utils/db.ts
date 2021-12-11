import dbConfig from "../config/db";
import * as mysql from 'mysql2/promise';

export default class Db {
  static async getConnection(): Promise<mysql.Connection> {
    return await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      charset : 'utf8mb4'
    });
  }
}