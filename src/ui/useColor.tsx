"use client";

import { createContext, useCallback, useContext, useState } from "react";

// 2025 Theme - Dimmed color palette with Destiny 2 aesthetic
const colorPalette = [
  "from-purple-800 via-pink-800 to-rose-700", // Dimmed purple-pink gradient
  "from-cyan-600 via-blue-700 to-indigo-800", // Dimmed blue gradient
  "from-emerald-600 via-teal-700 to-cyan-800", // Dimmed teal gradient
  "from-orange-700 via-red-700 to-pink-800", // Dimmed orange-red gradient
  "from-violet-700 via-purple-800 to-fuchsia-800", // Dimmed purple gradient
  "from-yellow-600 via-orange-700 to-red-700", // Dimmed sunset gradient
  "from-blue-600 via-indigo-700 to-purple-800", // Dimmed blue-purple gradient
  "from-green-600 via-emerald-700 to-teal-800", // Dimmed green gradient
];

const ColorContext = createContext<
  ((index: number) => (typeof colorPalette)[number]) | null
>(null);

export const useColor = (index: number) => {
  const ctx = useContext(ColorContext);
  if (!ctx) {
    throw new Error("useColor must be used within a ColorProvider");
  }
  return ctx(index);
};

export const ColorContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [seed] = useState(() =>
    Math.floor(Math.random() * colorPalette.length)
  );

  const getColor = useCallback(
    (idx: number) => colorPalette[(idx + seed) % colorPalette.length],
    [seed]
  );

  return (
    <ColorContext.Provider value={getColor}>{children}</ColorContext.Provider>
  );
};
