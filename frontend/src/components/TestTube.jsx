import { motion, AnimatePresence } from 'framer-motion';
import useTaskStore from '../store/taskStore';

const themeMap = {
  default: {
    cap: 'w-[94px] h-4 rounded-t-lg border-2 border-b-0 border-white/25 bg-white/10',
    tube: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))',
    glow: 'rgba(139,92,246,0.2)',
    pill: 'bg-white/5',
    active: 'bg-violet-500/30 ring-2 ring-violet-400/60',
  },
  science: {
    cap: 'w-[94px] h-4 rounded-t-lg border-2 border-b-0 border-cyan-400/40 bg-cyan-400/20',
    tube: 'linear-gradient(180deg, rgba(34,211,238,0.22), rgba(6,182,212,0.06))',
    glow: 'rgba(34,211,238,0.24)',
    pill: 'bg-cyan-500/10',
    active: 'bg-cyan-500/30 ring-2 ring-cyan-400/60',
  },
  space: {
    cap: 'w-[94px] h-4 rounded-t-lg border-2 border-b-0 border-slate-200/40 bg-slate-100/15',
    tube: 'linear-gradient(180deg, rgba(248,250,252,0.16), rgba(15,23,42,0.06))',
    glow: 'rgba(248,250,252,0.18)',
    pill: 'bg-slate-200/10',
    active: 'bg-slate-100/30 ring-2 ring-slate-200/60',
  },
  bamboo: {
    cap: 'w-[94px] h-4 rounded-t-lg border-2 border-b-0 border-emerald-700/40 bg-emerald-700/20',
    tube: 'linear-gradient(180deg, rgba(16,185,129,0.2), rgba(5,150,105,0.08))',
    glow: 'rgba(16,185,129,0.22)',
    pill: 'bg-emerald-500/10',
    active: 'bg-emerald-500/30 ring-2 ring-emerald-400/60',
  },
  rocket: {
    cap: 'w-[94px] h-4 rounded-t-lg border-2 border-b-0 border-orange-400/40 bg-orange-500/20',
    tube: 'linear-gradient(180deg, rgba(249,115,22,0.22), rgba(234,88,12,0.08))',
    glow: 'rgba(249,115,22,0.24)',
    pill: 'bg-orange-500/10',
    active: 'bg-orange-500/30 ring-2 ring-orange-400/60',
  },
  potion: {
    cap: 'w-[94px] h-4 rounded-t-lg border-2 border-b-0 border-fuchsia-400/40 bg-fuchsia-500/20',
    tube: 'linear-gradient(180deg, rgba(236,72,153,0.22), rgba(192,132,252,0.08))',
    glow: 'rgba(236,72,153,0.24)',
    pill: 'bg-fuchsia-500/10',
    active: 'bg-fuchsia-500/30 ring-2 ring-fuchsia-400/60',
  },
  dna: {
    cap: 'w-[94px] h-4 rounded-t-lg border-2 border-b-0 border-rose-400/40 bg-rose-500/20',
    tube: 'linear-gradient(180deg, rgba(244,114,182,0.2), rgba(251,113,133,0.08))',
    glow: 'rgba(244,114,182,0.22)',
    pill: 'bg-rose-500/10',
    active: 'bg-rose-500/30 ring-2 ring-rose-400/60',
  },
};

export default function TestTube({ stackEmojis = [], theme = 'default' }) {
  const tubeHeight = Math.max(260, Math.min(720, stackEmojis.length * 54 + 140));
  const completeTop = useTaskStore((s) => s.completeTop);
  const tasks = useTaskStore((s) => s.tasks);
  const palette = themeMap[theme] || themeMap.default;

  const handleSwipeComplete = (taskId) => {
    const task = tasks.find((entry) => entry._id === taskId);
    if (!task) return;
    if (task.status === 'pending') {
      void completeTop();
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div className={palette.cap} />
      <div className="tube-outer" style={{ minHeight: `${tubeHeight}px`, width: '90px', background: palette.tube, boxShadow: `inset 4px 0 12px rgba(255,255,255,0.05), 0 0 40px ${palette.glow}` }}>
        <div className="tube-shine" />
        <div className="tube-stack flex flex-col-reverse items-center justify-start pt-2 pb-4 gap-1 min-h-full">
          <AnimatePresence mode="popLayout">
            {stackEmojis.map((item, i) => (
              <motion.div
                key={item._id}
                layout
                drag="x"
                dragConstraints={{ left: -60, right: 60 }}
                whileDrag={{ scale: 1.08, cursor: 'grabbing' }}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 50) {
                    handleSwipeComplete(item._id);
                  }
                }}
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, x: -60 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`task-pill text-3xl flex items-center justify-center w-14 h-14 rounded-full cursor-grab ${i === 0 ? palette.active : palette.pill}`}
              >
                {item.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
