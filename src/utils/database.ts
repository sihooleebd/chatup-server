import dbConfig from '../config/db';
import * as mysql from 'mysql2/promise';

const dbSetting = {
  host: dbConfig.host,
  user: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: 200,
};

// export default class Database {
//   static async getConnection(): Promise<mysql.Connection> {
//     return await mysql.createConnection({});
//   }
// }

type DatabaseObj = {
  getConnectionPool: () => Promise<mysql.Pool>;
};

// export default function Database(): DatabaseObj {
//   console.log('Database() 실행됨');

//   let connectionPool: mysql.Pool | null = null;

//   const initiate = async () => {
//     console.log('Database() initate 실행됨');

//     return await mysql.createPool(dbSetting);
//   };

//   return {
//     getConnectionPool: async () => {
//       console.log('Database() getConnectionPool 실행됨');

//       if (!connectionPool) {
//         console.log('Database() getConnectionPool 없어서 initiate 실행 예정');

//         connectionPool = await initiate();
//         return connectionPool;
//       } else {
//         console.log('Database() getConnectionPool 있어서 바로 전달 예정');

//         return connectionPool;
//       }
//     },
//   };
// }

// nodejs cached module을 활용한 singleton
// class Database {
//   connectionPool: mysql.Pool | null = null;

//   constructor() {
//     console.log('Database() 실행됨');
//   }

//   initiate = async () => {
//     console.log('Database() initate 실행됨');

//     return await mysql.createPool(dbSetting);
//   };

//   getConnectionPool = async () => {
//     console.log('Database() getConnectionPool 실행됨');

//     if (!this.connectionPool) {
//       console.log('Database() getConnectionPool 없어서 initiate 실행 예정');

//       this.connectionPool = await this.initiate();
//       return this.connectionPool;
//     } else {
//       console.log('Database() getConnectionPool 있어서 바로 전달 예정');

//       return this.connectionPool;
//     }
//   };
// }

// export default new Database();

// static method/variable을 이용한 pool 얻기
class Database {
  static connectionPool: mysql.Pool | null = null;

  constructor() {
    console.log('Database() 실행됨');
  }

  static initiate: () => Promise<mysql.Pool> = async () => {
    console.log('Database() initate 실행됨');

    return await mysql.createPool(dbSetting);
  };

  static getConnectionPool: () => Promise<mysql.Pool> = async () => {
    console.log('Database() getConnectionPool 실행됨');

    if (!Database.connectionPool) {
      console.log('Database() getConnectionPool 없어서 initiate 실행 예정');

      Database.connectionPool = await Database.initiate();
      return Database.connectionPool;
    } else {
      console.log('Database() getConnectionPool 있어서 바로 전달 예정');

      return Database.connectionPool;
    }
  };
}

export default Database;

// database의 instance로 singleton 구현
// class Database {
//   private static instance: Database | null = null;

//   private static connectionPool: mysql.Pool | null = null;

//   private constructor() {
//     console.log('Database() 실행됨');
//   }

//   static getInstance: () => Database = () => {
//     if (!Database.instance) Database.instance = new Database();
//     return Database.instance;
//   };

//   initiate: () => Promise<mysql.Pool> = async () => {
//     console.log('Database() initate 실행됨');

//     return await mysql.createPool(dbSetting);
//   };

//   getConnectionPool: () => Promise<mysql.Pool> = async () => {
//     console.log('Database() getConnectionPool 실행됨');

//     if (!this.connectionPool) {
//       console.log('Database() getConnectionPool 없어서 initiate 실행 예정');

//       this.connectionPool = await this.initiate();
//       return this.connectionPool;
//     } else {
//       console.log('Database() getConnectionPool 있어서 바로 전달 예정');

//       return this.connectionPool;
//     }
//   };
// }

// export default Database;
