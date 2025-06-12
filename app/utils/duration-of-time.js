export default function durationOfTime(rawMinutes) {
  const minutes = Math.floor(rawMinutes % 60);
  const hours = Math.floor(((rawMinutes / 60) % 24));
  const days = Math.floor(rawMinutes / (24 * 60));

  const parts = [];

  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} mins${minutes > 1 ? 's' : ''}`);

  return parts.join(', ');
}

