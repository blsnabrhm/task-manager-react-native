// server.js - Simple Node.js/Express Backend
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
let tasks = [
  { id: 1, title: 'Learn React Native', completed: false, userId: 1 },
  { id: 2, title: 'Build a demo app', completed: false, userId: 1 },
  { id: 3, title: 'Show it to manager', completed: false, userId: 1 },
];

let nextId = 4;

// Routes

// GET /api/tasks - Get all tasks
app.get('/api/tasks', (req, res) => {
  console.log('GET /api/tasks - Fetching all tasks');
  res.json({
    success: true,
    data: tasks,
    count: tasks.length
  });
});

// GET /api/tasks/:id - Get specific task
app.get('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
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

  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    userId,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
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
  
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Update task
  if (title !== undefined) {
    tasks[taskIndex].title = title.trim();
  }
  if (completed !== undefined) {
    tasks[taskIndex].completed = completed;
  }
  
  tasks[taskIndex].updatedAt = new Date().toISOString();
  
  console.log(`PUT /api/tasks/${taskId} - Task updated:`, tasks[taskIndex]);
  
  res.json({
    success: true,
    data: tasks[taskIndex],
    message: 'Task updated successfully'
  });
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
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