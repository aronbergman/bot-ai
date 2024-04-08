import { autoRemoveMessage } from '../hoc/autoRemoveMessage.js'
import { db } from '../../db/index.js'

export const keyboardChatGPT = async (bot, msg) => {
  const sendChatGPT = async (bot, chatId, options) => {

    let accountMessage = await bot.sendMessage(
      chatId,
      '🤖',
      options
    )

    const timeout = setTimeout((chatId, message_id) => {
      console.log("message_id", message_id)
      bot.deleteMessage(chatId, message_id)
      clearTimeout(timeout)
      return autoRemoveMessage(`🤖 Выбран <b>ChatGPT</b> 3.5`, bot, chatId, options, 5000)
    }, 1000, chatId, accountMessage.message_id)
  }

  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }
  try {
    db.subscriber.findOne({
      where: {
        chat_id: chatId,
        user_id: msg.from.id
      }
    }).then(res => {
      if (res?.mode.match(/\GPT/))
        return sendChatGPT(bot, chatId, options)
      else if (res?.mode) {
        db.subscriber.update(
          { mode: 'GPT' },
          { where: { chat_id: chatId } }
        ).then(res => {
          bot.select_mode = 'GPT'
          return sendChatGPT(bot, chatId, options)
        })
      } else {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          mode: 'GPT'
        }).then(res => {
          bot.select_mode = 'GPT'
          return sendChatGPT(bot, chatId, options)
        })
      }
    })
  } catch
    (error) {
    await bot.sendMessage(chatId, `${error.message}`, options)
  }
}