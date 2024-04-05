export const keyboardHelp = async (bot, msg) => {
  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }

  try {
    return bot.sendMessage(
      chatId,
      `Help ...`,
      options
    )
  } catch (error) {
    await bot.sendMessage(chatId, `${error.message}`, options)
  }
}
