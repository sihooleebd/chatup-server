import express, { json, response } from 'express';
import cors from 'cors';
import User from './user';
import MyResponse from './my-response';
import cookieParser, { signedCookie } from 'cookie-parser';
import Auth from './utils/auth';
import Post from './post';
import Comment from './comment';
import Room from './room';
import multer from 'multer';
import fs from 'fs';
import Chat from './chat';
import ChatServer from './chat-server';
import corsConfig from './config/cors';

const app = express();
const port = 8081;

const upload = multer({dest:'../storage/temp/'});

app.use(cookieParser());
app.use(express.json());

app.use(
  cors(corsConfig),
);

app.use('/file', express.static('../storage'));


app.post('/api/signUp', (req, res) => {
  const user = new User();
  const email = req.body.email || '';
  const nickname = req.body.nickname || '';
  const password = req.body.pw || '';
  console.log(req.body);

  user
    .create(email, nickname, password)
    .then(function (myResponse: MyResponse) {
      res.send(myResponse);
    });
});
app.post('/api/signIn', (req, res) => {
  const user = new User();
  const email = req.body.email || '';
  const password = req.body.pw || '';
  console.log(req.body);

  user.auth(email, password).then(function (myResponse: MyResponse) {
    console.log("myResponse", myResponse);
    res.cookie('accessToken', myResponse.message, { httpOnly: true });
    res.send(myResponse);
  });
});
// app.post('/api/newPost', (req, res) => {
app.get('/', (r, re) => {
  re.send('dont get directly!');
  console.log('sombody tried to access directly');
});

app.get('/api/posts', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if (code !== 200) {
    res.status(code).send();
  } else {
    const post = new Post(id);
    const roomIdStr = req.query.roomId as string;
    
    if(roomIdStr!=='' && isNaN(parseInt(roomIdStr))) {
      res.status(404).send();
      return;      
    }

    const roomId = parseInt(roomIdStr) || 1;

    if(roomId < 1) {
      res.status(404).send();
      return;      
    }
    post.getPostList(roomId).then(function (myResponse: MyResponse) {
      console.log(myResponse);
      res.send(myResponse);
    });
  }
});

app.post('/api/posts', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if (code !== 200) {
    res.status(code).send();
  } else {
    const post = new Post(id);
    const title = req.body.title || '';
    const content = req.body.content || '';
    const roomId = req.body.roomId;

    post.createPost(title, content, roomId).then(function (myResponse: MyResponse) {
      res.send(myResponse);
    });
  }
});


app.get('/api/posts/:postId', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if (code !== 200) {
    res.status(code).send();
  } else {
    const post = new Post(id);
    const postId = parseInt(req.params.postId);
    if(!postId) {
      res.status(404).send();
      return;
    }
    post.getPost(postId).then(function (myResponse: MyResponse) {
      res.send(myResponse);
    });
  }
});

app.post('/api/posts/:postId/comments', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if (code !== 200) {
    res.status(code).send();
  } else {
    const comment = new Comment(id);
    const content = req.body.content;
    const postId = parseInt(req.params.postId);
    if(!postId) {
      res.status(404).send();
      return;
    }
    comment.createComment(postId, content).then(function (myResponse: MyResponse) {
      res.send(myResponse);
    });
  }
});

app.get('/api/posts/:postId/comments', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if (code !== 200) {
    res.status(code).send();
  } else {
    const comment = new Comment(id);
    const postId = parseInt(req.params.postId);
    comment.getCommentList(postId).then(function (myResponse: MyResponse) {
      res.send(myResponse);
    });
  }
});

app.get('/api/rooms', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if (code !== 200) {
    res.status(code).send();
  } else {
    const room = new Room(id);
    room.getRoomList().then(function (myResponse: MyResponse) {
      res.send(myResponse);
    });
  }
});

app.post('/api/rooms', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if (code !== 200) {
    res.status(code).send();
  } else {
    const room = new Room(id);
    room.createRoom(req.body.roomName).then(function (myResponse: MyResponse) {
      res.send(myResponse);
    });
  }
});


app.get('/api/users/:userId', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if (code !== 200) {
    res.status(code).send();
  } else {
    const user = new User();
    const targetUserId = (req.params.userId === 'me') ? id : parseInt(req.params.userId);
    if(!targetUserId) {
      res.status(404).send();
      return;
    }
    user.getProfile(id, targetUserId).then(function (myResponse: MyResponse) {
      if(myResponse.isSuccess) {
        res.send(myResponse);
      } else {
        res.status(404).send();
      }
    });
  }
});

app.post('/api/users/me/profileImage', upload.single('photo'), function(req, res) {
  const file = req.file;
  console.log("file", file);
  console.log(file.path, 'to', file.path + '.png');
  fs.rename(file.path, file.path + '.png', function(err) {
    if(err) {
      console.log('ERROR : ' + err);
    }
  })
  console.log("file2",file);

  res.send({ isSuccess: true, object: {profileImgFileName:file.filename + '.png' } });

})

app.put('/api/users/me', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if (code !== 200) {
    res.status(code).send();
  } else {
    const user = new User();

    console.log("body",req.body);
    
    user
      .update(id, req.body.nickname, req.body.profileImg)
      .then(function (myResponse: MyResponse) {
        res.send(myResponse);
      });
  }
});

app.get('/api/chatRooms/:roomId/messages', (req, res) => {
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if(code!==200) {
    res.status(code).send();
  }

  if(isNaN(parseInt(req.params.roomId))) {
    res.status(404).send();
  }

  const roomId: number = parseInt(req.params.roomId);
  const chat = new Chat();
    chat.getMessageList(roomId).then(function (myResponse: MyResponse) {
      if(!myResponse.isSuccess && myResponse.message === 'NO_ROOM_FOUND') {
        res.status(404).send();
      } else {
        res.send(myResponse);
      }
    });

})

app.get('/api/chatRooms', (req, res) => {
  console.log('a');
  const [id, code] = Auth.authenticate(req.cookies.accessToken);
  if(code!==200) {
    res.status(code).send();
  } else{
    const counterpartUserIdStr = req.query.counterpartUserId as string;
    if(counterpartUserIdStr==='' || isNaN(parseInt(counterpartUserIdStr))) {
      res.status(404).send();
      return;
    }


    if(parseInt(counterpartUserIdStr)===id) {
      res.status(403).send();
      return;
    }


    const chat = new Chat();
    const counterpartUserId: number = parseInt(counterpartUserIdStr);

    chat.getOrCreateRoom(id, counterpartUserId).then(function(myResponse: MyResponse) {
      if(myResponse.isSuccess) {
        res.send({
          ...myResponse,
          object: undefined,
          objects: [myResponse.object]
        });
      } else {
        res.status(404).send();
      }
    })


  }
})

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

//socket.io chatting code
const chatServer = new ChatServer();
chatServer.run();