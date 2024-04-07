const miniGames = ['🎲', '🎯', '🏀', '⚽', '🎳', '🎰']
const emojis = ['🐾', '🤖', '💡', '🚀', '⌛️']

export const spinnerOn = async (bot, chat_id) => {
  const message = await bot.sendMessage(
    chat_id,
    emojis[Math.floor(Math.random() * emojis.length)]
  )
  return message.message_id
}

// TODO: Разработка функционала игры для приобретения бонусов (Максим разработает план игры)
export const diceOn = (bot, chat_id) => bot.sendDice(chat_id, {
  emoji: miniGames[Math.floor(Math.random() * miniGames.length)]
})

export const spinnerOff = async (bot, chat_id, message_id) => {
  console.log('message', message_id)
  return bot.deleteMessage(
    chat_id,
    message_id
  )
}