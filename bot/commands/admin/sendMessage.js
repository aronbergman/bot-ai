import { INITIAL_SESSION } from '../../constants/index.js'
// TODO: сделать цикл и возможность отправки сообщений группам пользователей
export const sendMessage = bot => {
  bot.onText(/^\/msg+/ig, async msg => {
    const text = msg.text.split('//')
    console.log("text", text)
    const { id: chatId } = msg.chat
    const options = {
      parse_mode: 'HTML',
    }
    msg['ctx'] = INITIAL_SESSION
    try {
      await bot.sendMessage(
        text[1],
        `🤖\n${text[2]}`,
        options
      )
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
