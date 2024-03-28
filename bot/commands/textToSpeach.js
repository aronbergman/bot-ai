import { INITIAL_SESSION } from '../constants/index.js'

import { exec } from 'node:child_process'
import axios from 'axios'

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

    axios.post('http://154.56.63.128:7000/ajax/ajax', {
      text: msg.message_id,
      search: 'q',
      email: 'brgmn@icloud.com',
      telephone: '0679765152'
    })
      .then(function(response) {
        console.log(response)
      })
      .catch(function(error) {
        console.log(error)
      })
  })
}
