export const INITIAL_SESSION = {
  messages: []
}

export const TYPE_RESPONSE_MJ = {
  PHOTO: 'PHOTO',
  DOCUMENT: 'DOCUMENT'
}
// TODO: сделать акцент для удобства людей с ограниченными возможностями. TTS STT
export const COMMAND_GPT = '🤖 ChatGPT'
export const COMMAND_TEXT_TO_SPEECH = 'Text to Voice'
export const COMMAND_SPEECH_TO_TEXT = 'Voice to Text'
export const COMMAND_FILE_CONVERTOR = 'File convertor'
export const COMMAND_DALL_E = '🎨️ DALL-E'
export const COMMAND_MIDJOURNEY = '🏞 Midjourney'
export const COMMAND_ACCOUNT = '🔐 Мой аккаунт'
export const COMMAND_QUIZ = '🎰 Викторина'
export const COMMAND_HELP = '🔍 Помощь'
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
export const START_MIDJOURNEY = `
🖼Инструкция Midjourney 

 1. В этом режиме нужно детально описать свой запрос картинки
 
 2. После генерации появляются две линии кнопок: 📸 для выбора фотографии / ♻️ для генерации похожей фотографии 

<b>Важно</b> 

🤝Искусственный интеллект не обладает способностью создавать надписи на изображениях (пока что)

🤝Запросы эротического содержания не поддерживаются нейросетью

🤝Для обработки вашего изображения, пожалуйста, отправте его в чат

Ваш режим 🆓 (LITE)
Запрос будет обработан в рамках бесплатной очереди (время ожидания от 5 минут до суток)

✍️<b>Напишите текст на английском языке 🤴🇬🇧</b>`

export const START_DALLE = `
🎨 Инструкция Dall-E 

В этом режиме нужно детально описать свой запрос картинки
 <b>Важно</b> 
🤝Запросы эротического содержания не поддерживаются нейросетью

Ваш режим 🆓 (LITE)
Запрос будет обработан в рамках бесплатной очереди (время ожидания от 5 минут до суток)

✍️<b>Напишите текст</b>`

export const TARIFS = [
  { text: '📆 1 день за 89,00 ₽', callback_data: 'DAYS_1_89' },
  { text: '📆 7 дней за 299,00 ₽', callback_data: 'DAYS_7_299' },
  { text: '📆 30 дней за 350,00 ₽', callback_data: 'DAYS_30_350' },
  { text: '📆 90 дней за 1499,00 ₽', callback_data: 'DAYS_90_1499' },
  { text: '📆 20 запросов за 99,00 ₽', callback_data: 'REQUESTS_20_99' },
  { text: '📆 50 запросов за 179,00 ₽', callback_data: 'REQUESTS_50_179' },
  { text: '📆 100 запросов за 350,00 ₽', callback_data: 'REQUESTS_100_350' }
]

export const QUIZ_RULES = `
Выиграй подписку в нашей эмодзи-викторине🔥

Раз в неделю у тебя будет возможность сыграть в случайную игру, где ты всегда сможешь выиграть:

🕵️‍♂️Запросы в ChatGPT4
🏄Запросы в Midjourney
(3 попытки)

ИЛИ

Подписку на месяц PaperClip у однорукого Джо 🎰
(5 попыток)

Желаем всем побольше вишенок 
🍒🍒🍒`

// ['🎲', '🎯', '🏀', '⚽', '🎳', '🎰']
export const QUIZS = [
  {
    emoji: '🎲',
    fin: (emoji, count) => `${emoji}\nНачисление токенов!! 🎁 <b>${count}</b>`,
    finSub: (emoji) => `${emoji}\nВыйграл подписку! 🎁 `,
    finNeg: (emoji) => `${emoji}🙄\nПечалька, повезёт в следуюзий раз!`,
    finTest: (count) => `${count}`,
  },
  { emoji: '🎯' },
  { emoji: '🏀' },
  { emoji: '⚽' },
  { emoji: '🎳' },
  { emoji: '🎰' }
]