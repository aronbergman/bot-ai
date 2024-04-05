import { INITIAL_SESSION } from '../constants/index.js'

export const startBot = bot => {
  bot.onText(/\/start|\/echo/, async msg => {
    const { id: chatId } = msg.chat
    const msgId = msg.message_id
    const { id } = msg.from
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId
    }
    msg['ctx'] = INITIAL_SESSION
    try {


      await bot.sendMessage(
        chatId,
        `
Привет! Твой идеальный чат-бот GPT готов к работе!

Теперь можно использовать множество полезных инструментов для работы и учебы в одном месте 😎

Напиши свой вопрос и я на него отвечу! ✅

<b>Что я умею?</b> 

🤖 GPT-3.5, 4 (встроенные режимы общения)
🏞 Midjourney (генерация картин любого стиля по запросу)
🔥Dalle - 3 
PDF🔛WORD (смена форматов файла)
🗣Голосовые сообщения в текст 
💪🏼File compressor
📠Scanner (image to PDF)
🎥Автоматические субтитры 

🤝 Реферальная программа
🆘 Оперативная <b>поддержка</b> 24/7

<b>Без рекламы</b>
<b>Бесплатный пробный период</b>
<b>Без VPN</b>
Оплата: <b>RUB/EUR/USD/CRYPTO</b>

Более подробную информацию по использованию <b>ChatGPT</b>, <b>Midjourney</b> и остальных функций ты найдешь в разделе «<b>My account</b>»! 👻
`,
        options
      )
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
