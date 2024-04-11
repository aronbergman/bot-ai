function createProgress(progress) {
  let res = []
  const done = '🟩'
  const empty = '⬜'

  function roundMe(progress) {
    const x = 10
    const res = Math.round(progress / x)
    return res * x
  }

  const createLine = (x) => {
    for (let i = 0; i < x; i++) {
      res.push(done)
    }
    for (let i = 0; i < 10 - x; i++) {
      res.push(empty)
    }
    return res
  }

  const lineArray = createLine(roundMe(progress) / 10)
  return `${lineArray.join('')} ${progress}%`
}

export const loaderOn = (progress, bot, chat_id, message_id) => {
  if (!message_id) {
    const msg = bot.sendMessage(
      chat_id,
      createProgress(progress)
    ).catch(() => {
      console.error('🔺 loaderOn sendMessage')
    })
    return msg
  } else {
    bot.editMessageText(
      createProgress(progress.replace('%', '')),
      {
        message_id,
        chat_id
      }
    ).catch(() => {
      console.error('🔺 loaderOn editMessageText', message_id, "-", chat_id)
    })
  }
}

// export const loaderOff = async (bot, chat_id, message_id) => {
//   await bot.deleteMessage(chat_id, message_id).catch(err => console.log(err.error))
// }