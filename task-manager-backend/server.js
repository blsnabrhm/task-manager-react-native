// server.js - Simple Node.js/Express Backend with Authentication
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database file path
const DB_FILE = path.join(__dirname, 'db.json');

// Helper functions to read and write to JSON file
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return {
      users: [],
      tasks: [],
      nextTaskId: 1,
      nextUserId: 1
    };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Authentication Routes

// POST /api/auth/login - User login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  const db = readDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  console.log(`User ${user.name} logged in successfully`);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    }
  });
});

// POST /api/auth/register - User registration
app.post('/api/auth/register', (req, res) => {
  const { username, password, name, email } = req.body;
  
  if (!username || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Username, password, and name are required'
    });
  }

  const db = readDB();
  
  // Check if username already exists
  const existingUser = db.users.find(u => u.username === username);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Username already exists'
    });
  }

  // Create new user
  const newUser = {
    id: db.nextUserId,
    username,
    password,
    name,
    email: email || '',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.nextUserId++;
  
  if (writeDB(db)) {
    console.log(`New user ${name} registered successfully`);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to register user'
    });
  }
});

// Task Routes (Updated for user-specific tasks)

// GET /api/tasks - Get tasks for specific user
app.get('/api/tasks', (req, res) => {
  const userId = req.query.userId;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  console.log(`GET /api/tasks - Fetching tasks for user ${userId}`);
  const db = readDB();
  const userTasks = db.tasks.filter(task => task.userId === parseInt(userId));
  
  res.json({
    success: true,
    data: userTasks,
    count: userTasks.length
  });
});

// GET /api/tasks/:id - Get specific task for user
app.get('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const userId = req.query.userId;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const db = readDB();
  const task = db.tasks.find(t => t.id === taskId && t.userId === parseInt(userId));
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found or access denied'
    });
  }
  
  console.log(`GET /api/tasks/${taskId} - Task found for user ${userId}`);
  res.json({
    success: true,
    data: task
  });
});

// POST /api/tasks - Create new task for user
app.post('/api/tasks', (req, res) => {
  const { title, userId, dueDate } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Task title is required'
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const db = readDB();
  
  // Verify user exists
  const user = db.users.find(u => u.id === parseInt(userId));
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const newTask = {
    id: db.nextTaskId,
    title: title.trim(),
    completed: false,
    userId: parseInt(userId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: dueDate || null
  };

  db.tasks.push(newTask);
  db.nextTaskId++;

  if (writeDB(db)) {
    console.log(`POST /api/tasks - New task created for user ${userId}: ${title}`);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
});

// PUT /api/tasks/:id - Update task for user
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, completed, userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const db = readDB();
  const taskIndex = db.tasks.findIndex(t => t.id === taskId && t.userId === parseInt(userId));
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found or access denied'
    });
  }

  // Update task
  if (title !== undefined) db.tasks[taskIndex].title = title.trim();
  if (completed !== undefined) db.tasks[taskIndex].completed = completed;
  db.tasks[taskIndex].updatedAt = new Date().toISOString();

  if (writeDB(db)) {
    console.log(`PUT /api/tasks/${taskId} - Task updated for user ${userId}`);
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: db.tasks[taskIndex]
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
});

// DELETE /api/tasks/:id - Delete task for user
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const db = readDB();
  const taskIndex = db.tasks.findIndex(t => t.id === taskId && t.userId === parseInt(userId));
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found or access denied'
    });
  }

  const deletedTask = db.tasks.splice(taskIndex, 1)[0];

  if (writeDB(db)) {
    console.log(`DELETE /api/tasks/${taskId} - Task deleted for user ${userId}`);
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
});

// Notes Routes

// GET /api/notes - Get notes for specific user
app.get('/api/notes', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  console.log(`GET /api/notes - Fetching notes for user ${userId}`);
  
  const db = readDB();
  const userNotes = db.notes.filter(note => note.userId === parseInt(userId));
  
  res.json({
    success: true,
    data: userNotes,
    count: userNotes.length
  });
});

// POST /api/notes - Create new note
app.post('/api/notes', (req, res) => {
  const { title, body, userId } = req.body;
  
  if (!title || !body || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Title, body, and userId are required'
    });
  }

  const db = readDB();
  
  const newNote = {
    id: db.nextNoteId,
    title,
    body,
    userId: parseInt(userId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.notes.push(newNote);
  db.nextNoteId++;

  if (writeDB(db)) {
    console.log(`POST /api/notes - Note created for user ${userId}`);
    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: newNote
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
});

// PUT /api/notes/:id - Update note
app.put('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const { title, body, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const db = readDB();
  const noteIndex = db.notes.findIndex(note => note.id === noteId && note.userId === parseInt(userId));
  
  if (noteIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  // Update note fields
  if (title !== undefined) db.notes[noteIndex].title = title;
  if (body !== undefined) db.notes[noteIndex].body = body;
  db.notes[noteIndex].updatedAt = new Date().toISOString();

  if (writeDB(db)) {
    console.log(`PUT /api/notes/${noteId} - Note updated for user ${userId}`);
    res.json({
      success: true,
      message: 'Note updated successfully',
      data: db.notes[noteIndex]
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
});

// DELETE /api/notes/:id - Delete note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const db = readDB();
  const noteIndex = db.notes.findIndex(note => note.id === noteId && note.userId === parseInt(userId));
  
  if (noteIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  const deletedNote = db.notes.splice(noteIndex, 1)[0];

  if (writeDB(db)) {
    console.log(`DELETE /api/notes/${noteId} - Note deleted for user ${userId}`);
    res.json({
      success: true,
      message: 'Note deleted successfully',
      data: deletedNote
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for connection checking
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Task Manager Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/register');
  console.log('- GET /api/tasks?userId=:id');
  console.log('- POST /api/tasks');
  console.log('- PUT /api/tasks/:id');
  console.log('- DELETE /api/tasks/:id?userId=:id');
  console.log('- GET /api/notes?userId=:id');
  console.log('- POST /api/notes');
  console.log('- PUT /api/notes/:id');
  console.log('- DELETE /api/notes/:id?userId=:id');
});

// Export for testing
module.exports = app;