export const autoRemoveMessage = async (content, bot, chatId, options, duration = 5000) => {
  const message = await bot.sendMessage(chatId, `🚀 \n\n${content}`, options)
  const durationTemplate = '・'

  for (let i = 0; duration / 1000 >= i; i++) {
    const timeout = setTimeout((bot, chatId, message, durationTemplate, duration) => {
      bot.editMessageText(
        `🚀 ${durationTemplate.repeat(duration / 1000 - i)}\n\n${content}`,
        {
          chat_id: chatId,
          message_id: message.message_id,
          parse_mode: 'HTML'
        }
      )
      clearTimeout(timeout)
    }, i * 1000, bot, chatId, message, durationTemplate, duration)
  }

  const remove = setTimeout((bot, chatId, message) => {
    clearTimeout(remove)
   return bot.deleteMessage(chatId, message.message_id)
  }, duration, bot, chatId, message)
}