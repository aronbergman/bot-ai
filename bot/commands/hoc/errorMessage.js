import { autoRemoveMessage } from './autoRemoveMessage.js'

export const errorMessage = async (bot, error, chatID, options) => {
  const message = `⚡️\n${error.message}\nc${chatID}u${bot?.context?.from.id}m${bot?.context?.message_id}`

  await autoRemoveMessage(message, bot, chatID, options, 10000);
}