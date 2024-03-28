import { INITIAL_SESSION } from '../constants/index.js'
import { sequelize } from '../db/index.js'

export const getInfo = bot => {
  bot.onText(/\/account|\/acc/, async msg => {
    const { id: chatId } = msg.chat
    const msgId = msg.message_id
    const { id } = msg.from
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId
    }
    msg['ctx'] = INITIAL_SESSION
    try {
      sequelize.modeuser.findOne({
        where: {
          chat_id: chatId
        }
      }).then(async (res) => {
        const { mode } = res.dataValues;
        return bot.sendMessage(
          chatId,
          `
Текущий режим: ${mode}

Доступные режимы /midjourney /chat (сделать кнопками под сообщением)`,
          options
        )
      })
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
