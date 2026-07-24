import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true, trim: true },
  emoji: { type: String, default: '📌' },
  order: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'skipped'], default: 'pending' },
  createdDate: { type: String, required: true },
});

export default mongoose.model('Task', taskSchema);
