import { useState, useEffect } from 'react'
import { calculateScore } from '../utils/calculateScore'

export const useProductivityScore = (hours, mood) => {
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (hours && mood) {
      setScore(calculateScore(hours, mood))
    } else {
      setScore(0)
    }
  }, [hours, mood])

  return score
}
