const emojis = ['🐾', '🤖', '💡', '🚀', '⌛️', '👾', '👻', '👽', '🦊']
const emojiChat = ['🤖', '👽', '🦊', '🐯', '🦁', '🐧']

export const spinnerOn = async (bot, chat_id, type) => {
  const coll = type === "CHAT" ? emojiChat : emojis;
  const message = await bot.sendMessage(
    chat_id,
    coll[Math.floor(Math.random() * coll.length)]
  )
  const timeout = setInterval(() => {
    bot.editMessageText(
      coll[Math.floor(Math.random() * coll.length)],
      {
        message_id: message.message_id,
        chat_id
      }
    ).then(() => {
      clearInterval(timeout)
    }).catch(() => {
      clearInterval(timeout)
      console.log('!*')
    })
  }, 5000)
  return message.message_id
}

export const spinnerOff = async (bot, chat_id, message_id) => {
  console.log('message', message_id)
  return bot.deleteMessage(
    chat_id,
    message_id
  )
}