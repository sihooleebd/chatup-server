import http from 'http';
import { Server, Socket } from 'socket.io';
import corsConfig from './config/cors';
import MyResponse from './my-response';
import Database from './utils/database';
import HTMLHelper from './utils/html';
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

export default class ChatServer {
  httpServer: http.Server;
  socketIoServer: Server;

  constructor() {
    this.httpServer = http.createServer();
    this.socketIoServer = new Server(this.httpServer, {
      cors: corsConfig
    });




    
    const pubClient = createClient({ socket: {
      host: 'localhost',
      port: 6379
    }});
    const subClient = pubClient.duplicate();

    this.socketIoServer.adapter(createAdapter(pubClient, subClient))
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
      const clients = this.socketIoServer.sockets.adapter.rooms.get(roomId.toString());

      //to get the number of clients in this room
      const numClients = clients ? clients.size : 0;

      //to just emit the same event to all members of a room
      this.socketIoServer.to(roomId.toString()).emit('new event', 'Updates');
      for (const clientId of clients ) {
          console.log('clientId', clientId);
          //this is the socket of each client in the room.
          //const clientSocket = this.socketIoServer.sockets.sockets.get(clientId);
          //you can do whatever you need with this
          //clientSocket.leave('Other Room')
      }



      this.writeMessageToDb(roomId, connectedUserId, message).then( (result) => {
        // console.log('socket --> ', socket);
        socket.to(roomId.toString()).emit('chatMessage', {
        // socket.emit('chatMessage', {
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
      console.log('socket ',socket.data);
      this.addSocketEventHandler(socket);
    });


  }

  run(): void {
    const port = 8082;
    this.httpServer.listen(port);
  }
}