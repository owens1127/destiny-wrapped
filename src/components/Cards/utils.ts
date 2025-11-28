export function formatHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);

  if (hours < 1) {
    return `${Math.floor(seconds / 60)} minutes`;
  }

  return `${hours} hours`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
