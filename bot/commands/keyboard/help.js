export const keyboardHelp = async (bot, msg) => {
  let accountMessage
  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }

  try {
          accountMessage = await bot.sendMessage(
        chatId,
        '🔍',
        options
      )

      const timeout = setTimeout(() => {
        // TODO: Сделать подсчет колличества бесплатных запросов в сутки на бесплатном режиме
        accountMessage = bot.editMessageText(
          "Text for help",
          {
            message_id: accountMessage.message_id,
            chat_id: chatId,
            ...options
          }
        )
        clearTimeout(timeout)
      }, 1000)
  } catch (error) {
    await bot.sendMessage(chatId, `${error.message}`, options)
  }
}
