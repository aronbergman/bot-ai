import { Midjourney } from 'freezer-midjourney-api'
import { saveAndSendPhoto } from '../../utils/saveAndSendPhoto.js'
import { sudoChecker } from '../../utils/sudoChecker.js'
import { sequelize } from '../../db/index.js'

export const modeMidjourney = async (bot, sudoUser, msg, match) => {
  let userMessageId
  let prompt
  let client
  userMessageId = msg.message_id
  prompt = msg.text.replace(match[0], '').trim()
  const { id: userId, username, first_name: firstname } = msg.from
  const { id: chatID } = msg.chat
  const options = {
    reply_to_message_id: userMessageId
  }
  if (
    !(await sudoChecker(
      userId,
      username || firstname,
      sudoUser,
      bot,
      chatID,
      options
    ))
  ) {
    return
  }
  if (prompt.length === 0) {
    return bot.sendMessage(chatID, 'Prompt can\'t be empty', options)
  }
  const waiting = await bot.sendMessage(
    chatID,
    `✏️ Midjourney: ${prompt} 🚀`,
    options
  )
return // !!
  try {
    const { SERVER_ID, CHANNEL_ID, SALAI_TOKEN } = process.env
    client = new Midjourney({
      ServerId: SERVER_ID,
      ChannelId: CHANNEL_ID,
      SalaiToken: SALAI_TOKEN,
      Debug: true,
      Ws: true
    })
    await client.init()
    bot.Imagine = await client.Imagine(prompt, (uri, progress) => {
      console.log(`Loading: ${uri}, progress: ${progress}`)
      bot.editMessageText(
        `✏️ Midjourney: ${prompt} 🚀 ${progress}`,
        {
          ...options,
          message_id: waiting.message_id
        }
      )
    })

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            { text: 'U1', callback_data: 'U1' },
            { text: 'U2', callback_data: 'U2' },
            { text: 'U3', callback_data: 'U3' },
            { text: 'U4', callback_data: 'U4' }
          ],
          [
            { text: 'V1', callback_data: 'V1' },
            { text: 'V2', callback_data: 'V2' },
            { text: 'V3', callback_data: 'V3' },
            { text: 'V4', callback_data: 'V4' }
          ]
        ]
      })
    }
    const imgUrl = bot.Imagine.uri
    const imgDir = './Imagines'
    const filePath = `${imgDir}/${userMessageId}.png`
    await bot.deleteMessage(chatID, waiting.message_id)
    await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, bot, options)
  } catch (error) {
    await bot.sendMessage(chatID, `${error}`)
  }
}
