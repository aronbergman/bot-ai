import fs from 'fs'
import { OpenAI } from '../utils/openAi.js'
import { spinnerOn } from '../utils/spinner.js'

export const textToSpeech = async (bot, chatID, msg, prompt, voice) => {
  let spinner = await spinnerOn(bot, chatID, null, 'modeDalle')

  if (msg.text?.match(/^\/+/ig))
    return

  try {
    const openAi = new OpenAI()
    const ttsPathFile = await openAi.textToSpeech(prompt, msg, voice)
    const stream = fs.createReadStream(ttsPathFile)

    await bot.sendAudio(chatID, stream, {
      reply_to_message_id: msg.message_id
    })
    await bot.deleteMessage(chatID, spinner).catch()
  } catch (e) {
    bot.deleteMessage(chatID, spinner).catch()
  }
}