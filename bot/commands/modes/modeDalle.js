import dotenv from 'dotenv'
import { saveAndSendPhoto } from '../../utils/saveAndSendPhoto.js'
import { sudoChecker } from '../../utils/sudoChecker.js'
import { spinnerOn } from '../../utils/spinner.js'
import { REQUEST_TYPES_COST, TYPE_RESPONSE_MJ } from '../../constants/index.js'
import { loaderOn } from '../../utils/loader.js'
import { OpenAI } from '../../utils/openAi.js'
import { calculationOfNumberOfTokens } from '../../utils/checkTokens.js'
import { db } from '../../db/index.js'
import { Sequelize } from 'sequelize'

dotenv.config()

export const modeDalle = async (bot, sudoUser, msg, match) => {
  let userMessageId
  let prompt

  userMessageId = msg.message_id
  prompt = msg.text ? msg.text.replace(match[0], '').trim() : msg.sticker.emoji
  const { id: userId, username, first_name: firstname } = msg.from
  const { id: chatID } = msg.chat
  const options = {
    parse_mode: 'HTML',
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

  let spinner = await spinnerOn(bot, chatID, null, 'modeDalle')
  let waiting = await loaderOn(0, bot, chatID, null)

  try {

    const openAi = new OpenAI()

    const response = await openAi.image(prompt)

    const tokenCounts = await calculationOfNumberOfTokens(' ', REQUEST_TYPES_COST.DALLE)

    await db.subscriber.update(
      { tokens: Sequelize.literal(`tokens - ${tokenCounts}`) },
      { where: { chat_id: chatID } }
    )

    const imgUrl = response
    const imgDir = './dalle'
    const filePath = `${imgDir}/${userMessageId}.png`

    await loaderOn('42%', bot, chatID, waiting?.message_id)

    await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, bot, options, TYPE_RESPONSE_MJ.PHOTO, spinner,
      waiting)
    await bot.deleteMessage(chatID, waiting.message_id).catch()
  } catch (error) {
    await bot.deleteMessage(chatID, spinner)
    await bot.deleteMessage(chatID, waiting.message_id)
    await bot.sendMessage(chatID, `${error}`)
  }
}

// 20 апреля 135/200