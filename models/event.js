const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlength: 64,
        trim: true
    },
    description: {
        type: String,
    },
    version: {
        type: String,
        required: true,
        maxlength: 64,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
