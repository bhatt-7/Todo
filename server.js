// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const todoRoutes = require('./routes/todoRoutes');
const userRoutes = require('./routes/userRoutes');
const { db } = require('./config/db');
const app = express();
const PORT = 3000;
const path = require('path');
// Connect to MongoDB
db();

app.use(cookieParser());
app.use(express.static(path.join(__dirname + '/public')));
// Middleware


app.get('/', (req, res) => {
    res.sendFile('/index.html');
})

app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(express.json());

// Use the todo routes
app.use('/api/todos', todoRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, (req, res) => {
    console.log(`Server is running at ${PORT}`);
});

console.log("logging")