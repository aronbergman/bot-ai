import { autoRemoveMessage } from '../hoc/autoRemoveMessage.js'
import { db } from '../../db/index.js'

export const keyboardMidjourney = async (bot, msg) => {
  const sendMidjourney = (bot, chatId, options) => {
    return autoRemoveMessage(`✏️ Выбран <b>Midjourney</b>`, bot, chatId, options, 5000)
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
      if (res?.mode.match(/\/midjourney/))
        return sendMidjourney(bot, chatId, options)
      else if (res?.mode) {
        db.subscriber.update(
          { mode: '/midjourney' },
          { where: { chat_id: chatId } }
        ).then(res => {
          bot.select_mode = '/midjourney'
          return sendMidjourney(bot, chatId, options)
        })
      } else {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          mode: '/midjourney'
        }).then(res => {
          bot.select_mode = '/midjourney'
          return sendMidjourney(bot, chatId, options)
        })
      }
    })
  } catch
    (error) {
    await bot.sendMessage(chatId, `${error.message}`, options)
  }
}