import { INITIAL_SESSION } from '../../constants/index.js'
import { db } from '../../db/index.js'
import dotenv from 'dotenv'
dotenv.config({ path: '../../../.env' })

export const setQuizModeForSubs = (bot) => {
  // /quiz && me||username
  bot.onText(/^\/quiz+/ig, async msg => {
    const text = msg.text.split('&&')
    const { id: chatId } = msg.chat
    const options = {
      parse_mode: 'HTML',
    }
    msg['ctx'] = INITIAL_SESSION
    try {
       await db.subscriber.update({
              quiz_type_available: null,
              tags: null // опасность потерять все теги
            }, { where: { username: text[1] ?? msg.from.username } }).then(() => {
              bot.sendMessage(process.env.NOTIF_GROUP,`🎁 reset quiz for ${text[1] ?? msg.from.username} `)
              bot.sendMessage(msg.chat.id,`🎁 reset quiz for ${text[1] ?? msg.from.username} `)
       })
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
