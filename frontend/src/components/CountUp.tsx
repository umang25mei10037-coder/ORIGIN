import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function CountUp({ end, duration = 1.5, prefix = '', suffix = '', decimals = 0, className = '' }: CountUpProps) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end * Math.pow(10, decimals)) / Math.pow(10, decimals));
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    
    startRef.current = null;
    rafRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration, decimals]);

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{decimals > 0 ? count.toFixed(decimals) : count}{suffix}
    </motion.span>
  );
}
