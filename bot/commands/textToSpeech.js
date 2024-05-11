import fs from 'fs'
import { OpenAI } from '../utils/openAi.js'
import { spinnerOn } from '../utils/spinner.js'
import { calculationOfNumberOfTokens } from '../utils/checkTokens.js'
import { REQUEST_TYPES_COST } from '../constants/index.js'
import { db } from '../db/index.js'
import { Sequelize } from 'sequelize'

export const textToSpeech = async (bot, chatID, msg, prompt, voice) => {
  let spinner = await spinnerOn(bot, chatID, null, 'modeDalle')

  if (msg.text?.match(/^\/+/ig))
    return

  try {
    const openAi = new OpenAI()
    const ttsPathFile = await openAi.textToSpeech(prompt, msg, voice)
    const stream = fs.createReadStream(ttsPathFile)

    const tokenCounts = await calculationOfNumberOfTokens(prompt, REQUEST_TYPES_COST.TTS)

    await db.subscriber.update(
      { tokens: Sequelize.literal(`tokens - ${tokenCounts}`) },
      { where: { chat_id: chatID } }
    )

    await bot.sendAudio(chatID, stream, {
      reply_to_message_id: msg.message_id
    })
    await bot.deleteMessage(chatID, spinner).catch()
  } catch (e) {
    bot.deleteMessage(chatID, spinner).catch()
  }
}