import { autoRemoveMessage } from './autoRemoveMessage.js'

// TODO: Если у пользователя ошибка с таймаутом ChatGPT то создать очередь запросов создав 2 действия.
//  Отправить предупреждение о очереди.
//  Запустить таску на очередь

export const errorMessage = async (bot, error, chatID, options) => {
  const message = `⚡️\n${error.message}`

  await autoRemoveMessage(message, bot, chatID, options, 10000)
}