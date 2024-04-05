import { autoRemoveMessage } from '../hoc/autoRemoveMessage.js'
import { db } from '../../db/index.js'

export const keyboardChatGPT = async (bot, msg) => {
  const sendChatGPT = (bot, chatId, options) => {
    return autoRemoveMessage(`🤖 Выбран <b>ChatGPT</b> 3.5`, bot, chatId, options, 5000)
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
      if (res?.mode.match(/\/gpt/))
        return sendChatGPT(bot, chatId, options)
      else if (res?.mode) {
        db.subscriber.update(
          { mode: '/gpt' },
          { where: { chat_id: chatId } }
        ).then(res => {
          bot.select_mode = '/gpt'
          return sendChatGPT(bot, chatId, options)
        })
      } else {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          mode: '/gpt'
        }).then(res => {
          bot.select_mode = '/gpt'
          return sendChatGPT(bot, chatId, options)
        })
      }
    })
  } catch
    (error) {
    await bot.sendMessage(chatId, `${error.message}`, options)
  }
}