"use client";
import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DestinyWrappedCardProps {
  className?: string;
  children: React.ReactNode;
}

export function DestinyWrappedCard({
  className,
  children,
}: DestinyWrappedCardProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          className,
          "overflow-hidden shadow-lg shadow-gray-700/50 dark:shadow-lg dark:shadow-gray-600/50"
        )}
      >
        {children}
      </Card>
    </motion.div>
  );
}
