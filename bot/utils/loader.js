import axios from 'axios'
import fs from 'fs'
import { TYPE_RESPONSE_MJ } from '../constants/index.js'
import { spinnerOff } from './spinner.js'

export function createProgress(progress, type = 0) {
  let res = []
  const typeEmoji = [
    { done: '🟩', empty: '🟨' },
    { done: '🔝', empty: '🔜' }
  ]

  function roundMe(progress) {
    const x = 10
    const res = Math.round(progress / x)
    return res * x
  }

  const createLine = (x) => {
    for (let i = 0; i < x; i++) {
      res.push(typeEmoji[type].done)
    }
    for (let i = 0; i < 10 - x; i++) {
      res.push(typeEmoji[type].empty)
    }
    return res
  }

  const lineArray = createLine(roundMe(progress) / 10)
  return `${lineArray.join('')} ${progress}%`
}

export const loaderOn = async (progress, bot, chat_id, message_id, type) => {
  if (!message_id) {
    const msg = bot.sendMessage(
      chat_id,
      createProgress(progress, type)
    ).catch(() => {
      console.error('🔺 loaderOn sendMessage')
    })
    return msg
  } else {
    bot.editMessageText(
      createProgress(progress.replace('%', ''), type),
      {
        message_id,
        chat_id
      }
    ).catch(() => {
      console.error('🔺 loaderOn editMessageText', message_id, '-', chat_id)
    })
  }
}

// export const loaderOff = async (bot, chat_id, message_id) => {
//   await bot.deleteMessage(chat_id, message_id).catch(err => console.log(err.error))
// }