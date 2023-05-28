const Event = require('../models/event');
const { check, validationResult } = require('express-validator');

exports.createEvent = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
        });
    }
    const data = req.body;
    data.createdBy = req.admin._id;

    try {
        const event = new Event(data);
        await event.save();
        return res.status(200).json({
            message: 'Event created successfully',
            event
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: 'Error creating event'
        });
    }
}

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        return res.status(200).json({
            events
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: 'Error fetching events'
        });
    }
}

