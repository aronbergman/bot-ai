export const INITIAL_SESSION = {
  messages: []
}

export const TYPE_RESPONSE_MJ = {
  PHOTO: 'PHOTO',
  DOCUMENT: 'DOCUMENT'
}

export const COMMAND_GPT = '✏️ Новый диалог GPT'
export const COMMAND_MIDJOURNEY = '🏞 Midjourney'
export const COMMAND_ACCOUNT = '🔐 My account'
export const COMMAND_HELP = '🔍 I need help'
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

✍️<b>Напишите текст</b>`

export const MY_ACCOUNT = `
Текущий режим: 🤌🏻Lite version

Вам доступно:
😄10 запросов в день для GPT-3.5 (далее очередь в живом порядке)
😄2 запроса в день для Midjourney 
😄3 конвертирования файла в день

📎PaperClip PRO📎 350р/мес

😎100 запросов  GPT-4 
😎40 запросов Midjourney
😎20 запросов Dalle - 3
😎Конвертирование файла
😎Сжатие файла 
😎Голос в текст
`

export const TARIFS = [
  { text: '📆 1 день за 89,00 ₽', callback_data: 'DAYS_1_89' },
  { text: '📆 7 дней за 299,00 ₽', callback_data: 'DAYS_7_299' },
  { text: '📆 30 дней за 350,00 ₽', callback_data: 'DAYS_30_350' },
  { text: '📆 90 дней за 1499,00 ₽', callback_data: 'DAYS_90_1499' },
  { text: '📆 20 запросов за 99,00 ₽', callback_data: 'REQUESTS_20_99' },
  { text: '📆 50 запросов за 179,00 ₽', callback_data: 'REQUESTS_50_179' },
  { text: '📆 100 запросов за 350,00 ₽', callback_data: 'REQUESTS_100_350' },
]

export const MODS_CHAT = [
  { text: 'Chat GPT', callback_data: 'MODE_CHATGPT' },
  { text: 'Программист', callback_data: 'MODE_DEVELOPER' },
  { text: 'Психолог', callback_data: 'MODE_PSYCHOLOGIST' },
  { text: 'Мотиватор', callback_data: 'MODE_MOTIVATOR' },
  { text: 'Гопник', callback_data: 'MODE_MASTER' },
]