import {
  COMMAND_ACCOUNT,
  COMMAND_GPT,
  COMMAND_HELP,
  COMMAND_MIDJOURNEY, COMMAND_QUIZ,
  COMMAND_START,
  INITIAL_SESSION
} from '../constants/index.js'
import { db } from '../db/index.js'

export const startBot = bot => {
  bot.onText(/\/start|\/echo/, async msg => {
    const { id: chatId } = msg.chat
    const msgId = msg.message_id
    const { id } = msg.from
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId,
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [
          [
            { text: COMMAND_GPT },
            { text: COMMAND_MIDJOURNEY }
          ],
          [
            { text: COMMAND_ACCOUNT },
            { text: COMMAND_HELP }
          ]
        ]
      }
    }
    msg['ctx'] = INITIAL_SESSION
    try {
      await bot.sendMessage(
        chatId,
        COMMAND_START,
        options
      )

    // TODO:  Вынести в отдельную функцию
     await db.subscriber.findOne({
        where: {
          chat_id: chatId,
          user_id: msg.from.id
        }
      }).then(res => {
        if (res) {
          db.subscriber.update(
            {
              user_id: msg.from.id,
              first_name: msg.from.first_name,
              last_name: msg.from.last_name,
              username: msg.from.username,
              language_code: msg.from.language_code
            },
            { where: { chat_id: chatId } }
          )
        } else {
          db.subscriber.create({
            chat_id: chatId,
            user_id: msg.from.id,
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            username: msg.from.username,
            language_code: msg.from.language_code,
          })
        }
      })
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
