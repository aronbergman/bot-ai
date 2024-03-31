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
      sequelize.user.findOne({
        where: {
          chat_id: chatId
        }
      }).then(async (res) => {
        if (!res)
          return
        let mode
        switch (res?.dataValues.mode) {
          case '/image':
            mode = 'MidJourney'
            break;
          case '/chat':
            mode = 'ChatGPT'
            break;
          default:
            mode = '.'
        }
        return bot.sendMessage(
          chatId,
          `
Текущий режим: ${mode}

Доступные режимы в <i>lite</i> версии: \n<b>ChatGPT 3.5</b> \n<b>MidJourney</b> \n<b>Speech to Text</b> \n<b>PDF Converter</b>`,
          options
        )
      })
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
