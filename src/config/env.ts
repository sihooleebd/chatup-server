import path from 'path';
import dotenv from 'dotenv';
const envFilePath = `${path.resolve()}/.env/${process.env.NODE_ENV}.env`;

dotenv.config({ path: envFilePath });

console.log('envFilePath', envFilePath);
console.log('env', process.env);

export function getEnv(name:string, type: 'string'|'number'|'boolean') {
  const val = process.env[name];
  if(val===undefined) return null;
  
  if(type==='string') return val;
  if(type==='number') return parseInt(val);
  return (val==='true');
}