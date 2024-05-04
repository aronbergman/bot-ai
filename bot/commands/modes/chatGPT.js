import { INITIAL_SESSION } from '../../constants/index.js'
import { OpenAI } from '../../utils/openAi.js'
import { spinnerOff, spinnerOn } from '../../utils/spinner.js'
import { errorMessage } from '../hoc/errorMessage.js'
import { modesChatGPT } from '../../constants/modes.js'
import { db } from '../../db/index.js'
import { exceptionForHistoryLogging } from '../../utils/exceptionForHistoryLogging.js'
import { createFullName } from '../../utils/createFullName.js'
import { calculationOfNumberOfTokens } from '../../utils/checkTokens.js'
import { ct } from '../../utils/createTranslate.js'
import { Sequelize } from 'sequelize'

export const modeChatGPT = async (bot, msg, qweryOptions) => {
  const t = await ct(msg)
  let res
  let modeGPT
  let newMessage
  const { id: userId } = msg.from
  const { id: chatID } = msg.chat
  const msgId = msg.message_id
  const options = {
    reply_to_message_id: msgId,
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

    res = await spinnerOn(bot, chatID, null, 'chatGPT')
    let message = await bot.sendMessage(chatID, '...').catch(() => {
      console.log('🔺 37')
      return true
    })

    const openAi = new OpenAI()

    let x = modesChatGPT.find(mode => mode.code === modeGPT)

    if (modeGPT === 'assistant') {
      newMessage = msg.text ?? msg.sticker?.emoji
      msg.ctx = INITIAL_SESSION
    } else if (msg.text) {
      newMessage = await t(x?.prompt_start)
      newMessage = newMessage + '\n\n' + msg.text
    } else {
      newMessage = msg.sticker.emoji
    }

    await msg?.ctx.messages.push({
      role: openAi.roles.User,
      content: newMessage
    })

    const response = await openAi.chat(msg?.ctx.messages, bot, message, chatID, x.parse_mode)

    const textSum = (response + newMessage)
    const tokenCounts = await calculationOfNumberOfTokens(textSum)

    await db.subscriber.update(
      { tokens: Sequelize.literal(`tokens - ${tokenCounts.length}`) },
      { where: { user_id: chatID } }
    )

    if (!response) {
      throw new Error('Something went wrong please try again.')
    }

    msg?.ctx.messages.push({
      role: openAi.roles.Assistant,
      content: response
    })

    await spinnerOff(bot, chatID, res)

    db.history.update({
      chat_id: msg.chat.id,
      nickname: msg.chat.username,
      fullname: createFullName(msg.from),
      response: exceptionForHistoryLogging(msg.from.id, response)
    }, { where: { message_id: msg.message_id } }).catch()

    await bot.editMessageText(
      response ? response : '..:',
      {
        ...options,
        message_id: message.message_id,
        chat_id: chatID,
        parse_mode: x['parse_mode']
      }
    ).catch(() => {
      console.log('🔺 89')
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