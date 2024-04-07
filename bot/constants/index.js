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
export const START_MIDJOURNEY = `
🖼Инструкция Midjourney 

 1. После выбора режима Midjourney введите запрос с детальным описанием картинки
 2. После генерации появляются две линии кнопок: верхняя для выбора фотографии / нижняя для генерации похожей фотографии 

Примечание 

🤝Искусственный интеллект не обладает способностью создавать надписи на изображениях (пока что)

🤝Запросы эротического содержания не поддерживаются нейросетью

🤝Для обработки вашего изображения, пожалуйста, предоставьте ссылку на него. Загрузите изображение на веб-сайт и скопируйте ссылку на него. Затем отправьте эту ссылку вместе с вашим запросом. Подробные инструкции доступны по ссылке

Сейчас у вас режим 🆓
Поскольку вы не приобретали подписку , ваш запрос будет обработан в рамках бесплатной очереди. Время ожидания зависит от загруженности сервера. Если вам требуется больше двух генераций в день, приобретите подписку или запросы для ускорения работы бота.

✍️Ждем вашего запроса`

export const TARIFS = [
  { text: '📆 1 день за 79,00 ₽', callback_data: 'DAYS_1_79' },
  { text: '📆 7 дней за 299,00 ₽', callback_data: 'DAYS_7_299' },
  { text: '📆 30 дней за 699,00 ₽', callback_data: 'DAYS_30_699' },
  { text: '📆 90 дней за 1699,00 ₽', callback_data: 'DAYS_90_1699' },
  { text: '📆 20 запросов за 99,00 ₽', callback_data: 'REQUESTS_20_99' },
  { text: '📆 50 запросов за 189,00 ₽', callback_data: 'REQUESTS_50_189' },
  { text: '📆 100 запросов за 349,00 ₽', callback_data: 'REQUESTS_100_349' },
]

export const MODS_CHAT = [
  { text: 'Chat GPT', callback_data: 'MODE_CHATGPT' },
  { text: 'Программист', callback_data: 'MODE_DEVELOPER' },
  { text: 'Психолог', callback_data: 'MODE_PSYCHOLOGIST' },
  { text: 'Мотиватор', callback_data: 'MODE_MOTIVATOR' },
  { text: 'Гопник', callback_data: 'MODE_MASTER' },
]