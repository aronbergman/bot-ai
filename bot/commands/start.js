import {
  COMMAND_ACCOUNT,
  COMMAND_GPT,
  COMMAND_HELP,
  COMMAND_MIDJOURNEY,
  COMMAND_START,
  INITIAL_SESSION
} from '../constants/index.js'
import * as events from 'events'

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
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
