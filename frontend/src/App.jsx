import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import TestTube from './components/TestTube.jsx';
import useTaskStore from './store/taskStore';

const themeOptions = [
  { value: 'default', label: 'Classic' },
  { value: 'science', label: 'Science Tube' },
  { value: 'space', label: 'Space Capsule' },
  { value: 'bamboo', label: 'Bamboo Stick' },
  { value: 'rocket', label: 'Rocket Fuel Tank' },
  { value: 'potion', label: 'Potion Bottle' },
  { value: 'dna', label: 'DNA Tube' },
];

const getTodayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const { tasks, loading, fetchToday, streakCount, dailyHistory } = useTaskStore();
  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState('default');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [todayKey, setTodayKey] = useState(getTodayKey());

  useEffect(() => {
    void fetchToday();
  }, [fetchToday]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentKey = getTodayKey(now);
    if (currentKey !== todayKey) {
      setTodayKey(currentKey);
      void fetchToday();
    }
  }, [now, todayKey, fetchToday]);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'completed' && task.status !== 'skipped'),
    [tasks]
  );
  const showCelebration = visibleTasks.length === 0 && tasks.some((task) => task.status === 'completed' || task.status === 'skipped');

  const monthLabel = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekdaySymbols = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const calendarCells = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const cells = Array.from({ length: startOffset }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day);
    }
    return cells;
  }, [selectedMonth]);

  const getStatusForDay = (day) => {
    if (!day) return null;
    const year = selectedMonth.getFullYear();
    const month = `${selectedMonth.getMonth() + 1}`.padStart(2, '0');
    const date = `${day}`.padStart(2, '0');
    const dateKey = `${year}-${month}-${date}`;
    if (dateKey >= todayKey) return 'empty';
    return dailyHistory[dateKey] || 'empty';
  };

  const currentYear = now.getFullYear();
  const monthBounds = { min: new Date(currentYear, 0, 1), max: new Date(currentYear, 11, 1) };
  const goPrev = () => {
    const prev = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    if (prev >= monthBounds.min) setSelectedMonth(prev);
  };
  const goNext = () => {
    const next = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    if (next <= monthBounds.max) setSelectedMonth(next);
  };

  return (
    <div className="app-shell">
      <div className="app-card">
        <header className="app-header">
          <div>
            <p className="eyebrow">Today’s stack</p>
            <h1>Task Flow</h1>
            <p className="subtext">Add, drag, and swipe through your priorities.</p>
          </div>
          <div className="header-meta">
            <div className="status-pill">{loading ? 'Syncing…' : `${visibleTasks.length} active`}</div>
            <div className="status-pill">🔥 {streakCount} day{streakCount === 1 ? '' : 's'} streak</div>
            <button
              type="button"
              className="calendar-button"
              onClick={() => setShowCalendar(true)}
            >
              Tube Fill Calendar
            </button>
            <div className="clock-pill">
              <span>{now.toLocaleDateString()}</span>
              <span>{now.toLocaleTimeString()}</span>
            </div>
          </div>
        </header>

        <TaskForm />

        <section className="panel panel-tube">
          <div className="panel-title-row">
            <h2>Visual stack</h2>
            <div className="theme-picker" aria-label="Tube themes">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`theme-chip ${theme === option.value ? 'active' : ''}`}
                  onClick={() => setTheme(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="tube-panel">
            <TestTube stackEmojis={visibleTasks} theme={theme} />
          </div>
        </section>

        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="celebration-popup"
          >
            <div className="celebration-emoji">🎉</div>
            <h3>Tube Empty</h3>
            <p>Great Job!</p>
            <span>You completed today&apos;s mission.</span>
          </motion.div>
        )}

        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="calendar-popup"
          >
            <div className="calendar-popup-header">
              <div className="calendar-nav-group">
                <button type="button" className="calendar-nav" onClick={goPrev} disabled={selectedMonth <= monthBounds.min}>
                  ←
                </button>
                <h3>{monthLabel}</h3>
                <button type="button" className="calendar-nav" onClick={goNext} disabled={selectedMonth >= monthBounds.max}>
                  →
                </button>
              </div>
              <button type="button" className="calendar-close" onClick={() => setShowCalendar(false)}>
                ✕
              </button>
            </div>
            <p className="calendar-subtitle">Daily task flow history</p>
            <div className="calendar-weekdays">
              {weekdaySymbols.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarCells.map((day, index) => {
                const status = getStatusForDay(day);
                return (
                  <div key={`${day}-${index}`} className="calendar-day">
                    {day ? (
                      <>
                        <span className="date-number">{day}</span>
                        <div className={`day-circle ${status || 'empty'}`} />
                      </>
                    ) : (
                      <div className="calendar-placeholder" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="calendar-legend">
              <span><span className="legend-dot green" /> Completed all tasks</span>
              <span><span className="legend-dot yellow" /> Completed most tasks</span>
              <span><span className="legend-dot red" /> Completed very few tasks</span>
              <span><span className="legend-dot empty" /> No tasks / future day</span>
            </div>
          </motion.div>
        )}

        <section className="panel">
          <div className="panel-title-row">
            <h2>Today’s list</h2>
            <span className="mini-pill">Drag to reorder</span>
          </div>
          <TaskList />
        </section>
      </div>
    </div>
  );
}

export default App;
