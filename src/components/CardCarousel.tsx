"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/ui/utils";

interface CardCarouselProps {
  children: React.ReactNode[];
  className?: string;
}

const SWIPE_THRESHOLD = 50;

export function CardCarousel({ children, className }: CardCarouselProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const validChildren = React.Children.toArray(children).filter(Boolean);
  const totalCards = validChildren.length;

  // Parse card index from URL (1-based) and convert to 0-based internal index
  const getCardIndexFromUrl = useCallback(() => {
    const cardParam = searchParams.get("card");
    if (cardParam) {
      const parsed = parseInt(cardParam, 10);
      // URL uses 1-based indices, convert to 0-based for internal use
      if (!isNaN(parsed) && parsed >= 1 && parsed <= totalCards) {
        return parsed - 1;
      }
    }
    return 0;
  }, [searchParams, totalCards]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isUpdatingUrlRef = useRef(false);

  // Read card index from URL parameter on load
  useEffect(() => {
    if (!isInitialized && totalCards > 0) {
      const urlIndex = getCardIndexFromUrl();
      setCurrentIndex(urlIndex);
      setIsInitialized(true);
    }
  }, [getCardIndexFromUrl, totalCards, isInitialized]);

  // Update URL when currentIndex changes (from user action)
  // Convert 0-based internal index to 1-based URL index
  const updateUrl = useCallback(
    (index: number) => {
      isUpdatingUrlRef.current = true;
      const params = new URLSearchParams(searchParams.toString());
      // Convert 0-based to 1-based for URL
      const urlIndex = index + 1;
      if (urlIndex === 1) {
        // First card (index 0) doesn't need card param
        params.delete("card");
      } else {
        params.set("card", urlIndex.toString());
      }
      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
      // Reset flag after URL update completes
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 50);
    },
    [searchParams, router]
  );

  // Sync with URL changes (browser back/forward) - but not when we're updating it ourselves
  useEffect(() => {
    if (!isInitialized || isUpdatingUrlRef.current) return;

    const urlIndex = getCardIndexFromUrl();
    if (urlIndex !== currentIndex) {
      setCurrentIndex(urlIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalCards) return;
      const newDirection = index > currentIndex ? 1 : -1;
      setDirection(newDirection);
      setCurrentIndex(index);
      // Update URL asynchronously to not block animation
      requestAnimationFrame(() => {
        updateUrl(index);
      });
    },
    [currentIndex, totalCards, updateUrl]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % totalCards);
  }, [currentIndex, totalCards, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + totalCards) % totalCards);
  }, [currentIndex, totalCards, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
        if (offset > 0 || velocity > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
      }
    },
    [nextSlide, prevSlide]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-lg min-h-[768px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial={isInitialized ? "enter" : false}
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 800, damping: 40, mass: 0.5 },
              opacity: { duration: 0.1 },
              scale: { duration: 0.1 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full"
            style={{ touchAction: "pan-x" }}
          >
            {validChildren[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicators with Navigation Arrows */}
      {totalCards > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {/* Navigation - Previous */}
          <button
            onClick={prevSlide}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous card"
            disabled={isDragging}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {validChildren.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/40 w-2 hover:bg-white/60"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation - Next */}
          <button
            onClick={nextSlide}
            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next card"
            disabled={isDragging}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Card Counter */}
      {totalCards > 1 && (
        <div className="text-center mt-4 text-sm text-white/60">
          {currentIndex + 1} / {totalCards}
        </div>
      )}
    </div>
  );
}
