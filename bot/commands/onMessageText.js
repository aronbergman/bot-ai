import { modeChatGPT } from './modes/chatGPT.js'
import { modeMidjourney } from './modes/midjourney.js'
import { sequelize } from '../db/index.js'

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
      sequelize.modeuser.findOne({
        where: {
          chat_id: chatID
        }
      }).then(async (res) => {
        const { mode } = res.dataValues
        console.log('mode', mode)
        if (mode.match(/\/text|\/chat/)) {
          console.log('CHAT')
          await modeChatGPT(bot, msg)
        } else if (mode.match(/\/midjourney|\/image/)) {
          console.log('IMAGE')
          await modeMidjourney(bot, sudoUser, msg, match)
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