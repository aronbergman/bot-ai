import { db } from '../db/index.js'
import { modeMidjourney } from '../commands/modes/midjourney.js'
import { onMessageTextDefault } from '../commands/onMessageTextDefault.js'

export const isModeMidjourney = async (bot, msg, match, sudoUser) => {
  console.log("msg", msg)
  await db.subscriber.findOne({
    where: { chat_id: msg.chat.id, user_id: msg.from.id }
  }).then(res => {
    if (res.mode == 'MIDJOURNEY') {
      db.subscriber.update(
        { mode: 'GPT' },
        { where: { chat_id: msg.chat.id } }
      ).then((res) => {
        console.log("res", res)
        return modeMidjourney(bot, sudoUser, msg, match)
      })
    } else {
      return onMessageTextDefault(bot, msg, match, sudoUser)
    }
  }).catch(() => true)
}