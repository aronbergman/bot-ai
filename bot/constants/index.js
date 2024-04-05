export const INITIAL_SESSION = {
  messages: []
}

export const TYPE_RESPONSE_MJ = {
  PHOTO: 'PHOTO',
  DOCUMENT: 'DOCUMENT'
}

export const COMMAND_GPT = 'Новый диалог GPT'
export const COMMAND_MIDJOURNEY = 'Midjourney'
export const COMMAND_ACCOUNT = 'My account'
export const COMMAND_HELP = 'I need help'
export const COMMAND_START = `
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
`

export const TARIFS = [
  { text: '📆 1 день за 79,00 ₽', callback_data: 'DAYS_1_79' },
  { text: '📆 7 дней за 299,00 ₽', callback_data: 'DAYS_7_299' },
  { text: '📆 30 дней за 699,00 ₽', callback_data: 'DAYS_30_699' },
  { text: '📆 90 дней за 1699,00 ₽', callback_data: 'DAYS_90_1699' },
  { text: '📆 20 запросов за 99,00 ₽', callback_data: 'REQUESTS_20_99' },
  { text: '📆 50 запросов за 189,00 ₽', callback_data: 'REQUESTS_50_189' },
  { text: '📆 100 запросов за 349,00 ₽', callback_data: 'REQUESTS_100_349' },
]