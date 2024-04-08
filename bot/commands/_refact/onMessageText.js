import { modeChatGPT } from '../modes/chatGPT.js'
import { modeMidjourney } from '../modes/midjourney.js'
import { db } from '../../db/index.js'

export const onMessageText = (bot, sudoUser) => {
  bot.on('text', async (msg, match) => {
    if (msg.text.match(/^\/+/ig))
      return
    // TODO: Рефакторинг для минимизации обращения к бд.
    const { id: userId } = msg.from
    const { id: chatID } = msg.chat
    const msgId = msg.message_id
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId
    }
    try {
      db.subscriber.findOne({
        where: {
          chat_id: chatID
        }
      }).then(async (res) => {
        if (!res?.dataValues)
          return
        const { mode } = res.dataValues
        console.log('mode', mode)
        if (mode.match(/\/gpt|\/chat/)) {
          console.log('CHAT')
          await modeChatGPT(bot, msg)
        } else if (mode.match(/\/midjourney|\/image/)) {
          console.log('IMAGE')

        }
      })
    } catch (error) {
      if (error instanceof Error) {
        return await bot.sendMessage(
          chatID,
          error.message,
          options
        )
      }
    }
  })
}