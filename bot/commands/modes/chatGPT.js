import { INITIAL_SESSION } from '../../constants/index.js'
import { OpenAI } from '../../utils/openAi.js'
import { spinnerOff, spinnerOn } from '../../utils/spinner.js'

export const modeChatGPT = async (bot, msg) => {
  const { id: userId } = msg.from
  const { id: chatID } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }

  try {
    msg.ctx ??= INITIAL_SESSION

    let res
    res = await spinnerOn(bot, chatID)

    const openAi = new OpenAI()

    await msg?.ctx.messages.push({
      role: openAi.roles.User,
      content: msg.text
    })

    const response = await openAi.chat(msg?.ctx.messages)

    if (!response) {
      throw new Error('Something went wrong please try again.')
    }

    msg?.ctx.messages.push({
      role: openAi.roles.Assistant,
      content: response.content
    })

    await spinnerOff(bot, chatID, res)

    await bot.sendMessage(
      chatID,
      response.content,
      options
    )

  } catch (error) {
    if (error instanceof Error) {
      return await bot.sendMessage(
        chatID,
        error.message,
        options
      )
    }
  }
}