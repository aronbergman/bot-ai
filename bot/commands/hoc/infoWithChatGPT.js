import { autoRemoveMessage } from './autoRemoveMessage.js'

export const infoMessageWithChatGPT = async (bot, chatID, options) => {
  const message = `📬 Для смены темы разговора или режима нажмите кнопку ниже. Это поможет быстро и легко начать обсуждение другой темы.`
  const optionsWithQuery = {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Начать новый диалог', callback_data: 'create_new_chat' }],
        [{ text: 'Сменить режим общения', callback_data: 'change_chat_mode' }]
      ]
    }

  }
  await autoRemoveMessage(message, bot, chatID, optionsWithQuery, 10000)
}