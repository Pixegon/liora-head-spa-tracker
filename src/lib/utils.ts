export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function calcProgress(secondsRemaining: number, totalSeconds: number): number {
  if (totalSeconds === 0) return 0;
  return secondsRemaining / totalSeconds;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}
