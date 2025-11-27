export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// 2025 Season/Episode dates - Official release dates
// Episode: Revenant: October 15, 2024 - February 18, 2025 (continues into 2025)
// Heresy episode: February 4, 2025
// The Edge of Fate expansion: July 15, 2025 (Year of Prophecy begins)
// Renegades expansion: December 2, 2025
// Desert Perpetual raid: July 19, 2025
// Equilibrium dungeon: December 13, 2025
// Ash & Iron update: September 9, 2025
// Rite of the Nine event: May 6, 2025

const renegades = new Date("2025-12-02T17:00:00.000Z"); // Renegades expansion
const edgeOfFate = new Date("2025-07-15T17:00:00.000Z"); // The Edge of Fate expansion
const heresy = new Date("2025-02-04T17:00:00.000Z"); // Heresy episode

export const getSeason = (period: Date) => {
  if (period >= renegades) return "Renegades";
  if (period >= edgeOfFate) return "The Edge of Fate";
  if (period >= heresy) return "Heresy";
  // January 1 - February 4, 2025 is still Episode: Revenant (started Oct 2024)
  return "Episode: Revenant";
};

const msInYear = 365 * 24 * 3600_000;
const yearEnd = new Date("2025-12-31T23:59:59.999Z").getTime();
const yearStart = new Date("2025-01-01T00:00:00.000Z").getTime();

export const seasonWeights = {
  Renegades: (yearEnd - renegades.getTime()) / msInYear,
  "The Edge of Fate": (renegades.getTime() - edgeOfFate.getTime()) / msInYear,
  Heresy: (edgeOfFate.getTime() - heresy.getTime()) / msInYear,
  "Episode: Revenant": (heresy.getTime() - yearStart) / msInYear,
};

