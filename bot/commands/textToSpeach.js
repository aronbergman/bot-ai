import { INITIAL_SESSION } from '../constants/index.js'

import { exec} from 'node:child_process';

export const textToSpeach = bot => {
  bot.onText(/\/tts/, async msg => {
    // const { id: chatId } = msg.chat
    // const msgId = msg.message_id
    // const { id } = msg.from
    // const options = {
    //   parse_mode: 'HTML',
    //   reply_to_message_id: msgId
    // }
    // msg['ctx'] = INITIAL_SESSION
    // try {
    //   await bot.sendMessage(
    //     chatId,
    //     `Hi, ${id}.`,
    //     options
    //   )
    // } catch (error) {
    //   await bot.sendMessage(chatId, `${error.message}`, options)
    // }

    exec('tts --text "Salut! Je m\'appelle Aron Bergman, J\'habite a paris" --model_name "tts_models/fr/css10/vits"', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return
      }
      console.log(`stdout: ${stdout}`)
      console.error(`stderr: ${stderr}`)
    })
  })
}
