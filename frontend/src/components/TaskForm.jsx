import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Plus } from 'lucide-react';
import useTaskStore from '../store/taskStore';

export default function TaskForm() {
  const [taskName, setTaskName] = useState('');
  const [emoji, setEmoji] = useState('📌');
  const [showPicker, setShowPicker] = useState(false);
  const addTask = useTaskStore((s) => s.addTask);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    await addTask(taskName.trim(), emoji);
    setTaskName('');
    setEmoji('📌');
    setShowPicker(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        {/* Emoji trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker((p) => !p)}
            className="text-2xl w-12 h-12 glass flex items-center justify-center rounded-xl hover:scale-105 transition-transform"
          >
            {emoji}
          </button>
          {showPicker && (
            <div className="absolute z-50 top-14 left-0">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(e) => { setEmoji(e.emoji); setShowPicker(false); }}
                height={350}
                width={300}
              />
            </div>
          )}
        </div>

        {/* Task name input */}
        <input
          className="glass-input flex-1 px-4 py-3 text-sm"
          placeholder="Enter task name..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />

        {/* Add button */}
        <button
          type="submit"
          className="w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-lg"
        >
          <Plus size={20} />
        </button>
      </div>
    </form>
  );
}
