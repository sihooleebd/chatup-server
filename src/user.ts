import e, { response } from 'express';
import dbConfig from './config/db';
import MyResponse from './my-response';
import * as mysql from 'mysql2/promise';
import crypto from 'crypto';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import Base64 from './utils/base64';
import Auth from './utils/auth';
import Db from './utils/db';
import fs from 'fs';
import Database from './utils/database';

export default class User {
  encryptPassword(rawPassword: string): string {
    const salt = 'iaksdjfnlqiueyrpuoipkrmazilkjuehnaysag,ejkfhjjk';
    const encPw = crypto
      .createHash('sha256')
      .update(rawPassword + salt)
      .digest('base64');

    return Base64.makeBase64StrUrlSafe(encPw).replace('=', '');
  }

  async update (id: number, nickname: string, profileImageFileName?: string): Promise<MyResponse> {
    console.log('profileImg', profileImageFileName);
    const ret: MyResponse = { isSuccess: false, message: 'undefined'};

    const queryStr = profileImageFileName
    ? `UPDATE user SET profile_img=?, nickname=? WHERE id=?`
    : `UPDATE user SET nickname=? WHERE id=?`;
    const values = [];

    if(profileImageFileName) {
      values.push(profileImageFileName);
    }
    values.push(nickname);
    values.push(id);
    const connection = await Database.getConnectionPool();

    try {
      const result = await connection.query(queryStr, values);
      if(profileImageFileName) {
        fs.rename(`../storage/temp/${profileImageFileName}`,`../storage/profile/${profileImageFileName}`, function(err) {
          if(err) {
            console.log(err);
          }
        } )
      }
      


      
      
      return { isSuccess: true };
    } catch (e) {
      if(e.code === 'ER_DUP_ENTRY') {
        return { isSuccess: false, message: 'This nickname already exists!' };  
      }
      console.log("error",e);
      return { isSuccess: false, message: 'UNKNOWN ERROR' };
    }
  }

  async create(
    email: string,
    nickname: string,
    password: string,
  ): Promise<MyResponse> {
    const ret: MyResponse = { isSuccess: false, message: 'undefined'};

    const queryStr = `INSERT INTO user set email=?, nickname=?, password=?, joined_at=?`;
    const connection = await Database.getConnectionPool();
    const now = new Date();

    try {
      const result = await connection.query(queryStr, [
        email,
        nickname,
        this.encryptPassword(password),
        now,
      ]);
      console.log(result);
      return { isSuccess: true };
    } catch (e) {
      console.log(e);
      switch (e.code) {
        case 'ER_DUP_ENTRY':
          if (e.message.indexOf("'user.email'") >= 0) {
            return {
              isSuccess: false,
              message: 'This email is already registered!',
            };
          } else if (e.message.indexOf("'user.nickname'") >= 0) {
            return {
              isSuccess: false,
              message: 'This nickname is already registered!',
            };
          } else {
            return { isSuccess: false, message: 'UNKNOWN ERROR' };
          }
          break;
        default:
          return { isSuccess: false, message: 'UNKNOWN ERROR' };
      }
    }
  }

  async auth(email: string, password: string): Promise<MyResponse> {
    const ret: MyResponse = { isSuccess: false, message: 'undefined' };

    const queryStr = `SELECT id from user WHERE email=? AND password=?`;

    const connection = await Database.getConnectionPool();
    let jsonStr: string;

    try {
      const [rows, fields]: [Array<RowDataPacket>, Array<FieldPacket>] =
        await connection.query(queryStr, [
          email,
          this.encryptPassword(password),
        ]);

      if (rows.length == 0) {
        return { isSuccess: false, message: 'Unknown User' };
      }

      return {
        isSuccess: true,
        message: Auth.getAccessToken(email, rows[0].id),
      };
    } catch (e) {
      console.log(e);
      return { isSuccess: false, message: 'Unknown User' };
    }
  }

  async getProfile(currentUserId: number, targetUserId: number): Promise<MyResponse> {
    const ret: MyResponse = { isSuccess: false, message: 'undefined' };

    const queryStr = `SELECT nickname, email, profile_img from user WHERE id=?`;

    const connection = await Database.getConnectionPool();

    try {
      const [rows, fields]: [Array<RowDataPacket>, Array<FieldPacket>] =
        await connection.query(queryStr, [
          targetUserId
        ]);

      if (rows.length == 0) {
        return { isSuccess: false, message: 'Unknown User' };
      }

      return {
        isSuccess: true,
        object: {
          id: targetUserId,
          email: (targetUserId === currentUserId)? rows[0].email : undefined,
          profileImg: rows[0].profile_img,
          nickname: rows[0].nickname,
        }
      };
    } catch (e) {
      console.log(e);
      return { isSuccess: false, message: 'Unknown User' };
    }
  }
}
