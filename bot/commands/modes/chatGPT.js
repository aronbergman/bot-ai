import { INITIAL_SESSION } from '../../constants/index.js'
import { OpenAI } from '../../utils/openAi.js'

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
    res = await bot.sendMessage(
      chatID,
      '...',
      options
    )

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

    await bot.editMessageText(
      response.content,
      {
        ...options,
        message_id: res.message_id
      }
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