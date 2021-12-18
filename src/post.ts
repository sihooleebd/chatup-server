import MyResponse from './my-response';
import Db from './utils/db';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import HTMLHelper from './utils/html';
import { MAX_FEED_LEN } from './config/spec';
import Database from './utils/database';

export default class Post {

  readonly userId: number;


  constructor(id: number) {
    this.userId = id;
  }


  async createPost(title: string, content: string, roomId: number): Promise<MyResponse> {
    const ret: MyResponse = { isSuccess: false, message: 'undefined' };
    const queryStr = `INSERT INTO post set title=?, content=?, written_at=?, writer_id=?, room_id=?`;
    const connection = await Database.getConnectionPool();
    const now = new Date();

    try {
      const result = await connection.query(queryStr, [title, content, now, this.userId, roomId]);
      console.log('result');
      console.log(result);
      return { isSuccess: true, message: '' };
    } catch (e) {
      console.log(e);
      return { isSuccess: false, message: 'UNKNOWN ERROR' };
    }
  }

  async getPostList(roomId: number): Promise<MyResponse> {

    const queryStr = `SELECT p.id, p.writer_id, p.written_at, p.title, p.content, p.room_id, u.profile_img, u.nickname FROM post p, user u WHERE p.writer_id = u.id AND p.room_id=? ORDER BY id DESC`;

    const connection = await Database.getConnectionPool();

    try {
      const [rows, fields]: [Array<RowDataPacket>, Array<FieldPacket>] =
      await connection.query(queryStr, [roomId]);
      const tmp = rows.map(r => {
        const content = r.content.length > MAX_FEED_LEN ? r.content.substr(0,MAX_FEED_LEN) + '...' : r.content;
        const escapedContent = HTMLHelper.escape(content);
        const escapedTitle = HTMLHelper.escape(r.title);
        return {
        id : r.id,
        writerNickname: r.nickname,
        writerId: r.writer_id,
        writtenAt: r.written_at,
        title: escapedTitle,
        content: escapedContent,
        profileImg: r.profile_img
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




  async getPost(postId: number): Promise<any> {

    const queryStr = `SELECT p.id, p.writer_id, p.written_at, p.title, p.content, u.nickname, u.profile_img 
    FROM post p, user u WHERE p.writer_id = u.id and p.id = ${postId}`;

    const connection = await Database.getConnectionPool();

    try {
      const [rows, fields]: [Array<RowDataPacket>, Array<FieldPacket>] =
      await connection.query(queryStr);
      const r = rows[0];
      return {

        isSuccess: true,
        object: {
          id : r.id,
          writerNickname: r.nickname,
          writerId: r.writer_id,
          writtenAt: r.written_at,
          title: HTMLHelper.escape(r.title),
          content: HTMLHelper.escape(r.content),
          profileImg: r.profile_img
        }
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }


}
 