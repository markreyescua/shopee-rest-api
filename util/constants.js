module.exports = {
  MONGODB_URI: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.fbwmq.mongodb.net/${process.env.MONGODB_CLUSTER}?retryWrites=true&w=majority`,
  SERVER_PORT: process.env.SERVER_PORT,
};
