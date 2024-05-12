import { INITIAL_SESSION } from '../constants/index.js'
import { db } from '../db/index.js'
import dotenv from 'dotenv'
import { ct } from '../utils/createTranslate.js'
import { createStartKeyboardForReplyMarkup } from '../utils/createStartKeyboard.js'

dotenv.config()

export const startBot = bot => {
  bot.onText(/\/start|\/echo/, async msg => {
    const t = await ct(msg)
    const { id: chatId } = msg.chat
    const msgId = msg.message_id
    const { id } = msg.from
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId,
      reply_markup: createStartKeyboardForReplyMarkup(msg)
    }

    try {
      await bot.sendMessage(
        chatId,
        t('start'),
        options
      )

      // TODO:  Вынести в отдельную функцию
      await db.subscriber.findOne({
        where: {
          chat_id: chatId,
          user_id: msg.from.id
        }
      }).then(async res => {
        if (res) {
          await db.subscriber.update(
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
          await db.subscriber.create({
            chat_id: chatId,
            user_id: msg.from.id,
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            username: msg.from.username,
            language_code: msg.from.language_code
          })
        }
        const emoji = (msg.from.id === 6221051172) || (msg.from.id === 963869223) ? '🐾' : '➕';
        await bot.sendMessage(process.env.NOTIF_GROUP, `${emoji} ${msg.from.first_name} @${msg.from.username}`)
      })
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
