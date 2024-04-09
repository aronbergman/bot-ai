const emojis = ['🐾', '🤖', '💡', '🚀', '⌛️', '👾', '👻', '👽', '🦊']

export const spinnerOn = async (bot, chat_id) => {
  const message = await bot.sendMessage(
    chat_id,
    emojis[Math.floor(Math.random() * emojis.length)]
  )
  const timeout = setInterval(() => {
    bot.editMessageText(
      emojis[Math.floor(Math.random() * emojis.length)],
      {
        message_id: message.message_id,
        chat_id
      }
    ).catch(() => {
      // TODO: clearInterval(timeout)
    })
  }, 5000)
  return message.message_id
}

export const spinnerOff = async (bot, chat_id, message_id) => {
  console.log('message', message_id)
  return bot.deleteMessage(
    chat_id,
    message_id
  )
}