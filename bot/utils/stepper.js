export const stepperOn = async (bot, chat_id, stepNowIndex, prevMessage) => {
  const done = '✅'
  const wait = '⏩'

  const stepsArray1 = [
    'Импорт файла из Telegram',
    'Выгрузка файла на сервер',
    'Конвертация файла',
    'Выгрузка нового файла на сервер Telegram',
    'Загрузка файла на устройство',
  ]

  const steps = stepsArray1.map((step, index) => {
    return `${index <= stepNowIndex ? done : wait}  ${step}\n`
  })

  if (prevMessage) {
    return bot.editMessageText(steps.join(''),
      {
        chat_id,
        message_id: prevMessage.message_id
      }
    )
  } else {
    const answer = await bot.sendMessage(
      chat_id,
      steps.join('')
    )
    return new Promise(res => res(answer))
  }
}