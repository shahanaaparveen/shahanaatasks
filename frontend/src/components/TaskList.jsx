import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Trash2, GripVertical } from 'lucide-react';
import useTaskStore from '../store/taskStore';

export default function TaskList() {
  const { tasks, deleteTask, reorderTasks } = useTaskStore();

  if (!tasks.length) {
    return <p className="empty-state">No tasks yet. Add your first task above.</p>;
  }

  return (
    <Reorder.Group axis="y" values={tasks} onReorder={reorderTasks} className="flex flex-col gap-2">
      <AnimatePresence>
        {tasks.map((task, i) => (
          <Reorder.Item key={task._id} value={task}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="glass flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} className="text-white/30 shrink-0" />
              <span className="text-xl">{task.emoji}</span>
              <span className="flex-1 text-sm text-white/90">{task.taskName}</span>
              <span className="text-xs text-white/30 mr-2">#{i + 1}</span>
              <button
                onClick={() => void deleteTask(task._id)}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
}
