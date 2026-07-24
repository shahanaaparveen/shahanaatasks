import { create } from 'zustand';
import axios from 'axios';

const STORAGE_KEY = 'stackday-tasks';
const STREAK_STORAGE_KEY = 'stackday-streak';
const SNAPSHOT_KEY = 'stackday-tasks-snapshot';

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const readStoredTasks = () => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const writeStoredTasks = (tasks) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const readStoredStreak = () => {
  if (typeof window === 'undefined') return { streakCount: 0, lastCompletedDate: null, dailyHistory: {} };
  try {
    const saved = window.localStorage.getItem(STREAK_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    if (!parsed) return { streakCount: 0, lastCompletedDate: null, dailyHistory: {} };

    const todayKey = getTodayKey();
    const filteredHistory = Object.entries(parsed.dailyHistory || {}).reduce((acc, [date, value]) => {
      if (date < todayKey) acc[date] = value;
      return acc;
    }, {});

    return {
      streakCount: parsed.streakCount ?? 0,
      lastCompletedDate: parsed.lastCompletedDate ?? null,
      dailyHistory: filteredHistory,
    };
  } catch {
    return { streakCount: 0, lastCompletedDate: null, dailyHistory: {} };
  }
};

const writeStoredStreak = (streakState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakState));
};

const readStoredSnapshot = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(SNAPSHOT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const writeStoredSnapshot = (snapshot) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
};

const clearStoredSnapshot = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SNAPSHOT_KEY);
};

const useTaskStore = create((set, get) => ({
  tasks: readStoredTasks(),
  loading: false,
  error: '',
  streakCount: readStoredStreak().streakCount,
  lastCompletedDate: readStoredStreak().lastCompletedDate,
  dailyHistory: readStoredStreak().dailyHistory || {},

  processPendingSnapshot: () => {
    const snapshot = readStoredSnapshot();
    const todayKey = getTodayKey();
    if (!snapshot || snapshot.date === todayKey) return;

    const { dailyHistory, streakCount, lastCompletedDate } = get();
    const status = get().computeDayStatus(snapshot.tasks);
    if (!status) {
      clearStoredSnapshot();
      return;
    }

    const isConsecutiveDay = (previousDateKey, currentDateKey) => {
      if (!previousDateKey) return false;
      const [py, pm, pd] = previousDateKey.split('-').map(Number);
      const [cy, cm, cd] = currentDateKey.split('-').map(Number);
      const previousDate = new Date(py, pm - 1, pd);
      const currentDate = new Date(cy, cm - 1, cd);
      const diffDays = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24));
      return diffDays === 1;
    };

    const nextHistory = { ...dailyHistory, [snapshot.date]: status };
    const nextStreakCount = lastCompletedDate && isConsecutiveDay(lastCompletedDate, snapshot.date)
      ? streakCount + 1
      : 1;
    const nextLastCompletedDate = snapshot.date;

    set({ dailyHistory: nextHistory, streakCount: nextStreakCount, lastCompletedDate: nextLastCompletedDate });
    writeStoredStreak({ streakCount: nextStreakCount, lastCompletedDate: nextLastCompletedDate, dailyHistory: nextHistory });
    clearStoredSnapshot();
  },

  fetchToday: async () => {
    set({ loading: true, error: '' });
    get().processPendingSnapshot();
    try {
      const { data } = await axios.get('/tasks/today');
      const nextTasks = Array.isArray(data) ? data : [];
      set({ tasks: nextTasks, loading: false });
      writeStoredTasks(nextTasks);
      get().writeTaskSnapshot(nextTasks);
    } catch {
      const fallback = readStoredTasks();
      set({
        tasks: fallback,
        loading: false,
        error: 'Using saved tasks locally while the server is unavailable.',
      });
    }
  },

  syncStreakFromTaskProgress: () => {
    // Streak updates are now handled at end-of-day via pending snapshot processing.
  },

  computeDayStatus: (tasks) => {
    const total = tasks.length;
    if (!total) return null;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const ratio = completed / total;
    if (completed === total) return 'green';
    if (ratio >= 0.6) return 'yellow';
    return 'red';
  },

  writeTaskSnapshot: (tasks) => {
    const todayKey = getTodayKey();
    writeStoredSnapshot({ date: todayKey, tasks });
  },

  updateDailyHistory: (tasks) => {
    const todayKey = getTodayKey();
    const status = get().computeDayStatus(tasks);
    if (!status) return;
    const { dailyHistory, streakCount, lastCompletedDate } = get();
    const nextHistory = { ...dailyHistory, [todayKey]: status };
    set({ dailyHistory: nextHistory });
    writeStoredStreak({ streakCount, lastCompletedDate, dailyHistory: nextHistory });
  },

  addTask: async (taskName, emoji) => {
    const { tasks } = get();
    const order = tasks.length;
    const localTask = {
      _id: `local-${Date.now()}`,
      taskName,
      emoji,
      order,
      status: 'pending',
      createdDate: new Date().toISOString().slice(0, 10),
    };

    const nextTasks = [...tasks, localTask];
    set({ tasks: nextTasks });
    writeStoredTasks(nextTasks);

    try {
      const { data } = await axios.post('/tasks', { taskName, emoji, order });
      const persistedTasks = nextTasks.map((task) => (task._id === localTask._id ? data : task));
      set({ tasks: persistedTasks });
      writeStoredTasks(persistedTasks);
    } catch {
      set({ error: 'Task saved locally. Start the backend to sync it.' });
    }
  },

  deleteTask: async (id) => {
    const nextTasks = get().tasks.filter((task) => task._id !== id);
    set({ tasks: nextTasks });
    writeStoredTasks(nextTasks);
    get().writeTaskSnapshot(nextTasks);

    try {
      if (!String(id).startsWith('local-')) {
        await axios.delete(`/tasks/${id}`);
      }
    } catch {
      set({ error: 'Unable to remove the task from the server right now.' });
    }
  },

  reorderTasks: async (newTasks) => {
    const normalized = newTasks.map((task, index) => ({ ...task, order: index }));
    set({ tasks: normalized });
    writeStoredTasks(normalized);
    get().writeTaskSnapshot(normalized);

    try {
      await Promise.all(
        normalized
          .filter((task) => !String(task._id).startsWith('local-'))
          .map((task) => axios.patch(`/tasks/${task._id}`, { order: task.order }))
      );
    } catch {
      set({ error: 'Reorder saved locally. Start the backend to sync it.' });
    }
  },

  completeTop: async () => {
    const { tasks } = get();
    const pending = tasks.filter((task) => task.status === 'pending');
    if (!pending.length) return;

    const top = pending[0];
    const previousTasks = tasks;
    const nextTasks = tasks.map((task) =>
      task._id === top._id ? { ...task, status: 'completed' } : task
    );
    set({ tasks: nextTasks });
    writeStoredTasks(nextTasks);
    get().writeTaskSnapshot(nextTasks);

    try {
      if (!String(top._id).startsWith('local-')) {
        await axios.patch(`/tasks/${top._id}`, { status: 'completed' });
      }
    } catch {
      set({ error: 'Task marked locally. Start the backend to sync it.' });
    }
  },
}));

export default useTaskStore;
