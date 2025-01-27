// const dbConfig = {
//   username: "benjamin",
//   password: "mysqlpw0807",
//   database: "my_blog_service",
//   host: "127.0.0.1",
// };

import { getEnv } from "./env";



// export default dbConfig;


const dbConfig = {
  username: getEnv('USERNAME','string'),
  password: getEnv('PASSWORD','string'),
  database: getEnv('DATABASE','string'),
  host: getEnv('HOST','string'),
};



export default dbConfig;