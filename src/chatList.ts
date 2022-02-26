import MyResponse from './my-response';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import Database from './utils/database';

export default class ChatList {

  readonly userId: number;


  constructor(id: number) {
    this.userId = id;
  }

  async getChatList(userId: number): Promise<MyResponse> {

    // const queryStr = `SELECT p.id, p.writer_id, p.written_at, p.title, p.content, p.room_id, u.profile_img, u.nickname FROM post p, user u WHERE p.writer_id = u.id AND p.room_id=? ORDER BY id DESC`;
    const queryStr = `SELECT c.id, c.user_first_id, c.user_second_id, u1.profile_img AS u1Profile, u1.nickname AS u1Nickname, u2.profile_img AS u2Profile, u2.nickname AS u2Nickname FROM chat_room c, user u1, user u2 WHERE (c.user_first_id=? OR c.user_second_id=?) AND c.user_first_id = u1.id AND c.user_second_id = u2.id  ORDER BY id DESC`;
    const connection = await Database.getConnectionPool();

    try {
      const [rows, fields]: [Array<RowDataPacket>, Array<FieldPacket>] =
      await connection.query(queryStr, [userId, userId]);
      const tmp = rows.map(r => {
        return {
        id : r.id,
        userFirstId: r.user_first_id,
        userSecondId: r.user_second_id,
        userFirstNickname: r.u1Nickname,
        userSecondNickname: r.u2Nickname,
        userFirstProfileImage: r.u1Profile,
        userSecondProfileImage: r.u2Profile
        };
      });
      console.log(tmp);
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
 