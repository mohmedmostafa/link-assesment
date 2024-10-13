export default () => ({
    database: {
        mongoUri: process.env.MONGODB_URI,
        name: process.env.MONGO_DB_NAME,
        logging: process.env.MONGODB_ENHANCED_LOG,
    },
    redis:{
        url: process.env.REDIS_URL,
        username:process.env.REDIS_USERNAME,
        password:process.env.REDIS_PASSWORD,
    }
});