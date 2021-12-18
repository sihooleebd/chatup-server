import MyResponse from './my-response';
import Db from './utils/db';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import HTMLHelper from './utils/html';
import { MAX_FEED_LEN } from './config/spec';
import Database from './utils/database';

export default class Comment {

  readonly userId: number;


  constructor(id: number) {
    this.userId = id;
  }


  async createComment(postId: number, content: string): Promise<MyResponse> {
    const ret: MyResponse = { isSuccess: false, message: 'undefined' };
    const queryStr = `INSERT INTO comment set post_id=?, content=?, written_at=?, writer_id=?`;
    const connection = await Database.getConnectionPool();
    const now = new Date();

    try {
      const result = await connection.query(queryStr, [postId, content, now, this.userId]);
      console.log('result');
      console.log(result);
      return { isSuccess: true, message: '' };
    } catch (e) {
      console.log(e);
      return { isSuccess: false, message: 'UNKNOWN ERROR' };
    }
  }

  async getCommentList(postId: number): Promise<MyResponse> {

    const queryStr = `SELECT c.id, c.writer_id, c.written_at, c.content, u.nickname, u.profile_img
    FROM comment c, user u
    WHERE c.writer_id = u.id AND c.post_id = ?
    ORDER BY id DESC`;

    const connection = await Database.getConnectionPool();

    try {
      const [rows, fields]: [Array<RowDataPacket>, Array<FieldPacket>] =
      await connection.query(queryStr, [postId]);

      return {
        isSuccess: true,
        objects: rows.map((r) => ({
        id : r.id, // commentId
        writerNickname: r.nickname,
        writerId: r.writer_id,
        writtenAt: r.written_at,
        content: HTMLHelper.escape(r.content),
        profileImg: r.profile_img
        }))
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