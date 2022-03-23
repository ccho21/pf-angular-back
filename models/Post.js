const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    text: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,

    },
    avatar: {
        type: String
    },
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user',
            }
        }
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user',
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true,
        
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                defualt: Date.now
            }
        }
    ],
    date: {
        type: Date,
        defualt: Date.now
    }
});

module.exports = mongoose.model('post', PostSchema);