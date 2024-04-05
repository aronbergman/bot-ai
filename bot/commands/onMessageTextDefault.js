import { modeChatGPT } from './modes/chatGPT.js'
import { infoMessageWithChatGPT } from './hoc/infoWithChatGPT.js'

export const onMessageTextDefault = async (bot, msg, match, sudoUser) => {
  if (msg.text.match(/^\/+/ig))
    return
  // TODO: Рефакторинг для минимизации обращения к бд.
  const { id: chatID } = msg.chat
  const msgId = msg.message_id

  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }

  try {
    await modeChatGPT(bot, msg)
    await infoMessageWithChatGPT(bot, chatID, options)
  } catch (error) {
    if (error instanceof Error) {
      return await bot.sendMessage(
        chatID,
        error.message,
        options
      )
    }
  }
}