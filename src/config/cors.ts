const whiteList = ['http://localhost:1234','https://chatup.mcjunon.com'];

const corsConfig = {
  origin: whiteList,
  credentials: true,
};

export default corsConfig;