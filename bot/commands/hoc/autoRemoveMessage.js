export const autoRemoveMessage = async (content, bot, chatId, options, duration = 5000) => {
  const message = await bot.sendMessage(chatId, content, options)

  setTimeout((bot, chatId, message) => {
    bot.deleteMessage(chatId, message.message_id)
  }, duration, bot, chatId, message)
}