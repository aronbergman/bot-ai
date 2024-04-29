import { Converter } from '../../utils/converter.js'
import { errorMessage } from '../hoc/errorMessage.js'
import { formats } from '../../constants/formatsConterter.js'

export const keyboardConverter = async (bot, msg, t) => {
  let accountMessage = await bot.sendMessage(
    msg.chat.id,
    '💱'
  ).catch(err => console.log(err))

  try {
    const timeout = setTimeout((chatId, message_id, t) => {
      bot.editMessageText(
        t('desc_converter'),
        {
          chat_id: chatId,
          message_id: message_id,
          parse_mode: 'HTML'
        }).catch(() => {
        return true
      })
      clearTimeout(timeout)
    }, 1500, msg.chat.id, accountMessage?.message_id, t)
  } catch (e) {
    await bot.deleteMessage(msg.chat.id, accountMessage.message_id)
    return errorMessage(bot, e.message, msg, 'keybourd/converter')
  }
}