export const calculateScore = (hoursWorked, mood) => {
  const moodWeights = {
    great: 1.2,
    good: 1.0,
    okay: 0.8,
    struggling: 0.6
  }

  const weight = moodWeights[mood] || 1.0;
  const rawScore = hoursWorked * weight;
  
  // Round to 1 decimal place
  return Math.round(rawScore * 10) / 10;
}
