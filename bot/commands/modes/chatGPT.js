import { INITIAL_SESSION } from '../../constants/index.js'
import { OpenAI } from '../../utils/openAi.js'
import { spinnerOff, spinnerOn } from '../../utils/spinner.js'
import { errorMessage } from '../hoc/errorMessage.js'
import { modesChatGPT } from '../../constants/modes.js'
import { db } from '../../db/index.js'

export const modeChatGPT = async (bot, msg, qweryOptions) => {
  let res
  let modeGPT
  let newMessage
  const { id: userId } = msg.from
  const { id: chatID } = msg.chat
  const msgId = msg.message_id
  const options = {
    reply_to_message_id: msgId,
    parse_mode: 'HTML',
    ...qweryOptions
  }

  try {
    db.subscriber.findOne({
      where: {
        chat_id: chatID,
        user_id: msg.from.id
      }
    }).then(async response => {
      modeGPT = response.dataValues.modeGPT
    })

    // TODO: Запоминать контекст беседы пользователя или всегда начинать новый чат
    msg.ctx ??= INITIAL_SESSION

    res = await spinnerOn(bot, chatID, 'CHAT')
    let message = await bot.sendMessage(chatID, '...').catch(() => {
      console.log('!!!')
      return true
    })

    const openAi = new OpenAI()

    let x = modesChatGPT.find(mode => mode.code === modeGPT)


    if (modeGPT === 'assistant') {
      newMessage = msg.text
      msg.ctx = INITIAL_SESSION
    } else {
      newMessage = x?.prompt_start
      newMessage = newMessage + '\n\n' + msg.text
    }

    await msg?.ctx.messages.push({
      role: openAi.roles.User,
      content: newMessage
    })

    const response = await openAi.chat(msg?.ctx.messages, bot, message, chatID)

    if (!response) {
      throw new Error('Something went wrong please try again.')
    }

    msg?.ctx.messages.push({
      role: openAi.roles.Assistant,
      content: response
    })

    await spinnerOff(bot, chatID, res)

    db.history.create({
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      nickname: msg.chat.username,
      fullname: `${msg.from.first_name} ${msg.from.last_name}`,
      response: msg.text
    }).catch(() => {
      db.history.create({
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        nickname: msg.chat.username,
        fullname: `${msg.from.first_name} ${msg.from.last_name}`,
        response: 'Ответ слишком длинный'
      })
    })

    await bot.editMessageText(
      response,
      {
        message_id: message.message_id,
        chat_id: chatID,
        parse_mode: x['parse_mode'],
        ...options
      }
    ).catch(() => {
      console.log('!!!!')
      return true
    })

    return {
      text: response,
      message_id: message.message_id
    }
  } catch
    (error) {
    if (error instanceof Error) {
      await spinnerOff(bot, chatID, res)
      return errorMessage(bot, error, chatID)
    }
  }
}