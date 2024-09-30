const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    todo: {
        type: String,
        required: true
    },
    checked: {
        type: Boolean, default: false
    },
    isDeleted: {
        type: Boolean, default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true  
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Todo', todoSchema);
