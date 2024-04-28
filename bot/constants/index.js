export const INITIAL_SESSION = {
  messages: []
}

export const TYPE_RESPONSE_MJ = {
  PHOTO: 'PHOTO',
  DOCUMENT: 'DOCUMENT'
}
// TODO: сделать акцент для удобства людей с ограниченными возможностями. TTS STT
export const COMMAND_GPT = '🤖 ChatGPT'
export const COMMAND_TEXT_TO_SPEECH_EN = 'Text to Speech'
export const COMMAND_TEXT_TO_SPEECH_RU = 'Текст в речь'
export const COMMAND_TEXT_TO_SPEECH_FR = 'Texte à voix'
export const COMMAND_FILE_CONVERTOR_EN = 'File convertor'
export const COMMAND_FILE_CONVERTOR_FR = 'Convertisseur de fichiers'
export const COMMAND_FILE_CONVERTOR_RU = 'Конвертр файлов'
export const COMMAND_DALL_E = '🎨️ DALL-E'
export const COMMAND_MIDJOURNEY = '🏞 Midjourney'
export const COMMAND_ACCOUNT_RU = '🔐 Мой аккаунт'
export const COMMAND_ACCOUNT_EN = '🔐 My account'
export const COMMAND_ACCOUNT_FR = '🔐 Mon compte'
export const COMMAND_QUIZ_RU = '🎰 Викторина'
export const COMMAND_QUIZ_EN = '🎰 Quiz'
export const COMMAND_QUIZ_FR = '🎰 Jeu-Concours'
export const COMMAND_HELP_RU = '🔍 Помощь'
export const COMMAND_HELP_EN = '🔍 Support'
export const COMMAND_HELP_FR = '🔍 l\'Aide'

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