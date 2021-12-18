import MyResponse from './my-response';
import Db from './utils/db';
import { FieldPacket, OkPacket, RowDataPacket } from 'mysql2/promise';
import HTMLHelper from './utils/html';
import { MAX_FEED_LEN } from './config/spec';
import Database from './utils/database';

const GENERAL_ROOM_ID = 1;

export default class Room {

  readonly userId: number;


  constructor(id: number) {
    this.userId = id;
  }

  async getRoomList(): Promise<MyResponse> {

    const queryStr = `SELECT r.id, r.owner_id, r.created_at, r.name, u.nickname FROM room r, user u WHERE r.owner_id = u.id AND r.id!=${GENERAL_ROOM_ID} ORDER BY r.id DESC`;

    const connection = await Database.getConnectionPool();

    try {
      const [rows, fields]: [Array<RowDataPacket>, Array<FieldPacket>] =
      await connection.query(queryStr);
      const tmp = rows.map(r => {
        return {
        id : r.id,
        owner: r.nickname,
        ownerId: r.owner_id,
        createdAt: r.created_at,
        name: HTMLHelper.escape(r.name),
        };
      });
    
      console.log(tmp);
      return {
        isSuccess: true,
        objects: tmp,
      }
    } catch (e) {
      console.log(e);
      return {
        isSuccess: false,
        message: e.message
      }
    }
  }

  async createRoom(roomName: string) {
    console.log('createRoom');
    const ret: MyResponse = { isSuccess: false, message: 'undefined' };
    const queryStr = `INSERT INTO room set name=?, owner_id=?, created_at=?`;
    const connection = await Database.getConnectionPool();
    const now = new Date();

    try {
      const [okPacket, fields]: [OkPacket, Array<FieldPacket>] = await connection.query(queryStr, [roomName, this.userId, now]);
      console.log('result');
      return { isSuccess: true, message: '' , object: {roomId: okPacket.insertId}};
    } catch (e) {
      console.log(e);
      if(e.code === 'ER_DUP_ENTRY') {
        return { isSuccess: false, message: 'This room name is already registered! Please try a new name. '};
      }
      return { isSuccess: false, message: 'UNKNOWN ERROR' };
    }
  }
}
 