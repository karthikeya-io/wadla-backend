require('dotenv').config();
const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');


// connect to mongoDB
//DB Connection
exports.dbConnect = mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('db connected');
}).catch((err) => {
    console.log(err);
});

app.get('/', (req, res) => res.send('Hello World!'));


app.listen(port, () => console.log(`Server is running on port ${port}`));
