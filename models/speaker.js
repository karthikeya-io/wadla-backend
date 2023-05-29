const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const speakerSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 64,
        trim: true
    },
    email: {
        type: String,
        maxlength: 128,
        trim: true
    },
    company: {
        type: String,
        maxlength: 128,
        trim: true
    },
    designation: {
        type: String,
        maxlength: 128,
        trim: true
    },
    field: {
        type: String,
        enum: ['Academia', 'Industry']
    },
    profilePicFileOrginalName: {
        type: String,
        maxlength: 128,
        trim: true
    },
    profilePicPublicUrl: {
        type: String,
        trim: true
    },
    websiteLink: {
        type: String,
        trim: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Speaker', speakerSchema);



