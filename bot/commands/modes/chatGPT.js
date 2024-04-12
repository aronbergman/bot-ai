import { INITIAL_SESSION } from '../../constants/index.js'
import { OpenAI } from '../../utils/openAi.js'
import { spinnerOff, spinnerOn } from '../../utils/spinner.js'
import { errorMessage } from '../hoc/errorMessage.js'

export const modeChatGPT = async (bot, msg, qweryOptions) => {
  let res
  let message
  const { id: userId } = msg.from
  const { id: chatID } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId,
    ...qweryOptions
  }

  try {
    msg.ctx ??= INITIAL_SESSION

    res = await spinnerOn(bot, chatID, "CHAT")
    let message = await bot.sendMessage(chatID, '...').catch(() => {
      console.log('!!!')
      return true
    })

    const openAi = new OpenAI()

    await msg?.ctx.messages.push({
      role: openAi.roles.User,
      content: msg.text
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

    await bot.editMessageText(
      response,
      {
        message_id: message.message_id,
        chat_id: chatID,
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

  } catch (error) {
    if (error instanceof Error) {
      await spinnerOff(bot, chatID, res)
      return errorMessage(bot, error, chatID, options)
    }
  }
}