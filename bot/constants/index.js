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
export const COMMAND_ARCHIVING = 'File archiving'
export const COMMAND_FILE_CONVERTOR = 'File convertor'
export const COMMAND_DALL_E = '🎨️ DALL-E'
export const COMMAND_MIDJOURNEY = '🏞 Midjourney'
export const COMMAND_ACCOUNT = '🔐 Мой аккаунт'
export const COMMAND_QUIZ = '🎰 Викторина'
export const COMMAND_HELP = '🔍 Помощь'

export const TARIFS = [
  { text: '📆 1 день за 89,00 ₽', callback_data: 'DAYS_1_89' },
  { text: '📆 7 дней за 299,00 ₽', callback_data: 'DAYS_7_299' },
  { text: '📆 30 дней за 350,00 ₽', callback_data: 'DAYS_30_350' },
  { text: '📆 90 дней за 1499,00 ₽', callback_data: 'DAYS_90_1499' },
  { text: '📆 20 запросов за 99,00 ₽', callback_data: 'REQUESTS_20_99' },
  { text: '📆 50 запросов за 179,00 ₽', callback_data: 'REQUESTS_50_179' },
  { text: '📆 100 запросов за 350,00 ₽', callback_data: 'REQUESTS_100_350' }
]

export const VOICES = [
  { text: 'Alloy', callback_data: 'alloy' },
  { text: 'Echo', callback_data: 'echo' },
  { text: 'Fable', callback_data: 'fable' },
  { text: 'Onyx', callback_data: 'onyx' },
  { text: 'Nova', callback_data: 'nova' },
  { text: 'Shimmer', callback_data: 'shimmer' },
]

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

export const WON_A_MONTH_SUBSCRIPTION = (link = '#') => `Поздравляем, ты выиграл подписку на месяц! 
Поделись нашим ботом с 2 друзьями по твоей реферальной ссылке: ${link} и ни в чем себе не отказывай 🤖`