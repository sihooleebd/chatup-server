import http from 'http';
import { Server, Socket } from 'socket.io';
import corsConfig from './config/cors';
import MyResponse from './my-response';
import Database from './utils/database';
import Db from './utils/db';
import HTMLHelper from './utils/html';

export default class ChatServer {
  httpServer: http.Server;
  socketIoServer: Server;

  constructor() {
    this.httpServer = http.createServer();
    this.socketIoServer = new Server(this.httpServer, {
      cors: corsConfig
    });
    this.addServerEventHandler();
  }

  addSocketEventHandler(socket: Socket): void {
    socket.on('joinRoom', (roomId: number, userId: number) => {
      console.log('userId,',userId);
      socket.join(roomId.toString());
      socket.data.roomId = roomId;
      socket.data.connectedUserId = userId;

      console.log('joined ', roomId);
    })

    socket.on('chatMessage', (message: string) => {
      console.log(message);
      console.log(socket.data);


      const { roomId, connectedUserId} = socket.data;


      this.writeMessageToDb(roomId, connectedUserId, message).then( (result) => {
        // socket.to(roomId.toString())
        socket.emit('chatMessage', {
          message,
          sender: socket.data.connectedUserId,
          
        });

      });
    });

  }


  async writeMessageToDb(roomId: number, senderId: number, content: string): Promise<MyResponse> {
    const ret: MyResponse = { isSuccess: false, message: 'undefined' };
    const queryStr = `INSERT INTO chat_msg set room_id=?, sender_id=?, sent_at=?, content=?`;
    const connection = await Database.getConnectionPool();
    const now = new Date();

    try {
      const result = await connection.query(queryStr, [roomId, senderId, now, HTMLHelper.escape(content)]);
      console.log('result');
      console.log(result);
      return { isSuccess: true, message: '' };
    } catch (e) {
      console.log(e);
      return { isSuccess: false, message: 'UNKNOWN ERROR' };
    }
  }

  addServerEventHandler(): void {

    this.socketIoServer.on('connection', (socket) => {
      console.log('connect client by socket.io');

    this.addSocketEventHandler(socket);

    });


  }

  run(): void {
    const port = 8082;
    this.httpServer.listen(port);
  }
}