const whiteList = ['http://localhost:1234', 'http://192.168.50.171:1234', 'http://192.168.2.171:1234', 'http://192.168.200.130:1234'];

const corsConfig = {
  origin: whiteList,
  credentials: true,
};

export default corsConfig;