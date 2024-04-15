import { getStringOrDist } from './getStringOrDist.js'

export const calculationOfWonTokens = (emoji, value) => {
  const emojiString = getStringOrDist(emoji)
  const winMachine = [1, 11, 22, 33, 44, 55, 64]

  // TODO: если человек выйграл подписку нужно так-же создать платеж?

// Emoji on which the dice throw animation is based.
// Currently, must be one of “🎲”, “🎯”, “🏀”, “⚽”, “🎳”, or “🎰”.
// Dice can have values 1-6 for “🎲”, “🎯” and “🎳”,
// values 1-5 for “🏀” and “⚽”,
// and values 1-64 for “🎰”.
// Defaults to “🎲”

  switch (emojiString) {
    case 'BASKET':
    case 'FOOT':
      if (value > 2)
        return 1
      else if (value <= 2)
        return 0
    case 'CUBE':
      return value
    case 'BOWLING':
    case 'DARTS':
      if (value === 1)
        return 0
      else
        return value
    case 'MACHINE':
      // if (winMachine.find((i) => i === value) === -1)
      if (winMachine.find((i) => i === value) !== -1) // Для тестирования выйгрыша
        return 1
      else
        return 0
    default:
      return 0
  }
}