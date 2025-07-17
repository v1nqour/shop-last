"use client";

import { animate, useInView, useIsomorphicLayoutEffect, Easing } from "framer-motion";
import { useRef } from "react";

// Define a custom type for the animation options
interface CustomAnimationOptions {
  duration?: number;
  ease?: Easing; // Import and use Easing from framer-motion
  onUpdate?: (latest: number) => void;
}

type AnimatedCounterProps = {
  from: number;
  to: number;
  animationOptions?: CustomAnimationOptions;
  className?: string;
};

const defaultAnimationOptions: CustomAnimationOptions = {
  duration: 6,
  ease: "easeOut", // Valid easing string
};

const AnimatedCounter = ({
  from,
  to,
  animationOptions,
  className,
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;

    if (!element) return;
    if (!inView) return;

    // Handle edge cases
    if (from === to) {
      element.textContent = String(to);
      return;
    }

    // Set initial value
    element.textContent = String(from);

    // If reduced motion is enabled in system's preferences
    if (window.matchMedia("(prefers-reduced-motion)").matches) {
      element.textContent = String(to);
      return;
    }

    const controls = animate(from, to, {
      ...defaultAnimationOptions,
      ...animationOptions,
      onUpdate(value) {
        element.textContent = Number(value.toFixed(0)).toLocaleString();
      },
    });

    // Cancel on unmount
    return () => {
      controls.stop();
    };
  }, [ref, inView, from, to, animationOptions]);

  return <span ref={ref} aria-live="polite" className={className} />;
};

export default AnimatedCounter;