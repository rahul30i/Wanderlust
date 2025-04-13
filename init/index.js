const mongoose = require('mongoose');
const Listing = require('../models/listing');
const initData = require('./data');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to DB');

    await Listing.deleteMany({});
    console.log('Existing listings deleted');

    await Listing.insertMany(initData.data);
    console.log('Data was initialized');
  } catch (err) {
    console.error('Error during data seeding:', err);
  } finally {
    mongoose.connection.close();
  }
}

main();
