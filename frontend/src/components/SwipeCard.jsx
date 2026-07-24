import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export default function SwipeCard({ task, onComplete }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-120, 0, 120], [0, 1, 0]);
  const rotate = useTransform(x, [-120, 120], [-12, 12]);
  const leftLabel = useTransform(x, [-80, 0], [1, 0]);
  const rightLabel = useTransform(x, [0, 80], [0, 1]);

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.x) > 80) {
      animate(x, info.offset.x > 0 ? 300 : -300, { duration: 0.3 }).then(onComplete);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
    }
  };

  if (!task) {
    return <div className="empty-state">No active task right now. Add one to get started.</div>;
  }

  return (
    <div className="relative flex items-center justify-center h-36">
      <motion.div style={{ opacity: leftLabel }} className="absolute left-0 text-green-400 font-bold text-sm pointer-events-none">
        ✓ Done
      </motion.div>
      <motion.div style={{ opacity: rightLabel }} className="absolute right-0 text-green-400 font-bold text-sm pointer-events-none">
        Done ✓
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        style={{ x, rotate, opacity }}
        onDragEnd={handleDragEnd}
        className="glass px-8 py-6 flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing w-64 touch-none"
      >
        <span className="text-5xl">{task.emoji}</span>
        <span className="text-base font-medium text-white/90 text-center">{task.taskName}</span>
        <span className="text-xs text-white/40 mt-1">← swipe to complete →</span>
      </motion.div>
    </div>
  );
}
