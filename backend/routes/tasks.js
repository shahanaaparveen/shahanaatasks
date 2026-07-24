import { Router } from 'express';
import Task from '../models/Task.js';

const router = Router();

const todayStr = () => new Date().toISOString().slice(0, 10);

// POST /tasks
router.post('/', async (req, res) => {
  try {
    const { taskName, emoji, order } = req.body;
    const task = await Task.create({ taskName, emoji, order, createdDate: todayStr() });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /tasks/today
router.get('/today', async (req, res) => {
  try {
    const tasks = await Task.find({ createdDate: todayStr() }).sort({ order: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tasks/:id
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
