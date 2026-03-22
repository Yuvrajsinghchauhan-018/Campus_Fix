const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const startCronJobs = require('./utils/cronJobs');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.set('socketio', io);

// io.on('connection', (socket) => {
//   console.log('New client connected', socket.id);
//   socket.on('disconnect', () => {
//     console.log('Client disconnected', socket.id);
//   });
// });

startCronJobs(io);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Expose Static Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('CampusFix API is running...');
});

// Routes will be added here
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/users', require('./routes/users'));
app.use('/api/maintainers', require('./routes/maintainers'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/announcements', require('./routes/announcements'));

// Error handler will be added here
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - READY`);
});

