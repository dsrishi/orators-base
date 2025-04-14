// function to calculate the duration
export function estimatedDuration(words: number, wordsPerMinute: number) {
  const duration = Math.floor(words / wordsPerMinute);
  const seconds = Math.floor((words % wordsPerMinute) * 60 / wordsPerMinute);
  if (duration > 0) {
    return `${duration} min ${seconds} sec`;
  } else {
    return `${seconds} sec`;
  }
}
