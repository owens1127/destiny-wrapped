export function formatHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);

  if (hours < 1) {
    return `${Math.floor(seconds / 60)} minutes`;
  }

  return `${hours} hours`;
}
