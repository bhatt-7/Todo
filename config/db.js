const mongoose = require('mongoose')

exports.db = async () => await mongoose.connect('mongodb+srv://ayushbhatt11001100:bhatt123@chatty.ebyztps.mongodb.net/Todo');