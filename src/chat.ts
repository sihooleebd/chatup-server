import { FieldPacket, OkPacket, RowDataPacket } from "mysql2/promise";
import { MAX_FEED_LEN } from "./config/spec";
import MyResponse from "./my-response";
import Database from "./utils/database";
import Db from "./utils/db";
import HTMLHelper from "./utils/html";

export default class Chat {

  async getRoom(roomId?: number, id?: number, counterpartUserId?: number): Promise <MyResponse>  {
    try {
      console.log(`roomId=${roomId}, id=${id}, counter=${counterpartUserId}`)
      const userFirstId = Math.min(id, counterpartUserId);
      const userSecondId = Math.max(id, counterpartUserId);
      let query='';
      const values=[];
      if(roomId) {
        query =  `SELECT id FROM chat_room WHERE id=?`;
        values.push(roomId);
      } else if(id && counterpartUserId){
        query =  `SELECT id FROM chat_room WHERE user_first_id = ? AND user_second_id=?`;
        values.push(userFirstId);
        values.push(userSecondId);
      } else {
        return{isSuccess: false, message: 'INVALID_PARAMS'};  
      }
      const ret: MyResponse = {isSuccess: false, message: 'Unknown Error'};
      
    
      const connection = await Database.getConnectionPool();
    
      const [rows, fields]: [ Array<RowDataPacket>, Array<FieldPacket>] = await connection.query(query, values);
  
      if(rows.length > 0) {
        console.log(rows[0]);
        return {
          isSuccess: true,
          object: {
            roomId: rows[0].id,
          },
        };
      }
    } catch(e) {
      console.error(e);
      return{isSuccess: false, message: 'Unknown Error'};
    }
    return {isSuccess: false, message: 'NO_ROOM_FOUND'}
  }

  async createRoom(id: number, counterpartUserId: number): Promise <MyResponse>  {
    const userFirstId = Math.min(id, counterpartUserId);
    const userSecondId = Math.max(id, counterpartUserId);
    const connection = await Database.getConnectionPool();
    const ret: MyResponse = {isSuccess: false, message: 'Unknown Error'};
    const queryCreate = `INSERT INTO chat_room set user_first_id=?, user_second_id=?, created_at=?`;

    const now = new Date();

    try {
      const [okPacket, fields]: [OkPacket, Array<FieldPacket>] = await connection.query<OkPacket>(queryCreate, [userFirstId, userSecondId, now]);
      console.log(okPacket);
      const roomId = okPacket.insertId;
      return {isSuccess: true, object: {
        roomId: roomId,
        }
      }
    } catch(e) {
      console.error(e);
      return ret;
    }

  }

  async getOrCreateRoom(id: number, counterpartUserId: number): Promise<MyResponse> {
    const roomResponse = await this.getRoom(undefined, id, counterpartUserId);
    console.log('roomRes', roomResponse);
    if(roomResponse.isSuccess) {
      return roomResponse;
    }

    return await this.createRoom(id, counterpartUserId);
  }

  async getMessageList(roomId: number) : Promise<MyResponse>{
    console.log('roomId:',roomId);
    const roomResponse = await this.getRoom(roomId);
    if(!roomResponse.isSuccess) {
      return {isSuccess: false, message: 'NO_ROOM_FOUND'}
    }


    const queryStr = `SELECT id, sender_id, sent_at, content FROM chat_msg WHERE room_id=? ORDER BY id DESC LIMIT 30`;

    const connection = await Database.getConnectionPool();

    try {
      const [rows, fields]: [Array<RowDataPacket>, Array<FieldPacket>] =
      await connection.query(queryStr, [roomId]);
      const tmp = rows.map(r => {
        const escapedContent = HTMLHelper.escape(r.content);
        return {
        id : r.id,
        senderId: r.sender_id,
        sentAt: r.sent_at,
        content: escapedContent,
        };
      });
      // console.log(tmp);
      return {
        isSuccess: true,
        objects: tmp
      }
    } catch (e) {
      console.log(e);
      return {
        isSuccess: false,
        message: e.message,
      }
    }


  }

}