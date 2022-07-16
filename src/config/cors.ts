const whiteList = ['http://localhost:1234','https://chatup.benjaminlee.kr'];

const corsConfig = {
  origin: whiteList,
  credentials: true,
};

export default corsConfig;