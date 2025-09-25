// server.js - Simple Node.js/Express Backend
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
    // Return default data if file doesn't exist or is corrupted
    return {
      tasks: [],
      nextId: 1
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

// Routes

// GET /api/tasks - Get all tasks
app.get('/api/tasks', (req, res) => {
  console.log('GET /api/tasks - Fetching all tasks');
  const db = readDB();
  res.json({
    success: true,
    data: db.tasks,
    count: db.tasks.length
  });
});

// GET /api/tasks/:id - Get specific task
app.get('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const db = readDB();
  const task = db.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }
  
  console.log(`GET /api/tasks/${taskId} - Task found`);
  res.json({
    success: true,
    data: task
  });
});

// POST /api/tasks - Create new task
app.post('/api/tasks', (req, res) => {
  const { title, userId = 1 } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Task title is required'
    });
  }

  const db = readDB();
  const newTask = {
    id: db.nextId,
    title: title.trim(),
    completed: false,
    userId,
    createdAt: new Date().toISOString()
  };

  db.tasks.push(newTask);
  db.nextId++;
  
  if (!writeDB(db)) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save task'
    });
  }

  console.log('POST /api/tasks - New task created:', newTask);
  
  res.status(201).json({
    success: true,
    data: newTask,
    message: 'Task created successfully'
  });
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, completed } = req.body;
  
  const db = readDB();
  const taskIndex = db.tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Update task
  if (title !== undefined) {
    db.tasks[taskIndex].title = title.trim();
  }
  if (completed !== undefined) {
    db.tasks[taskIndex].completed = completed;
  }
  
  db.tasks[taskIndex].updatedAt = new Date().toISOString();
  
  if (!writeDB(db)) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
  
  console.log(`PUT /api/tasks/${taskId} - Task updated:`, db.tasks[taskIndex]);
  
  res.json({
    success: true,
    data: db.tasks[taskIndex],
    message: 'Task updated successfully'
  });
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const db = readDB();
  const taskIndex = db.tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const deletedTask = db.tasks.splice(taskIndex, 1)[0];
  
  if (!writeDB(db)) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
  
  console.log(`DELETE /api/tasks/${taskId} - Task deleted:`, deletedTask);
  
  res.json({
    success: true,
    data: deletedTask,
    message: 'Task deleted successfully'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   GET    /api/tasks`);
  console.log(`   POST   /api/tasks`);
  console.log(`   PUT    /api/tasks/:id`);
  console.log(`   DELETE /api/tasks/:id`);
  console.log(`   GET    /api/health`);
});

// Export for testing
module.exports = app;