const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs, gridfsBucket;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Initialize GridFS
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'images'
    });

    gfs = Grid(conn.connection.db, mongoose.mongo);
    gfs.collection('images');

    console.log('GridFS initialized successfully');

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const getGFS = () => {
  if (!gfs) {
    throw new Error('GridFS not initialized. Call connectDB first.');
  }
  return gfs;
};

const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error('GridFS Bucket not initialized. Call connectDB first.');
  }
  return gridfsBucket;
};

module.exports = { connectDB, getGFS, getGridFSBucket };
