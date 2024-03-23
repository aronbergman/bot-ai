export const spinnerOn = async (bot, chat_id) => {
   const message = await bot.sendAnimation(
      chat_id,
      'https://media1.tenor.com/m/YZFMVHPC020AAAAd/cat-waiting.gif',
      { parse_mode: 'HTML' }
    )
    return message.message_id;
}

export const spinnerOff = async (bot, chat_id, message_id) => {
   await bot.deleteMessage(
        chat_id,
        message_id
      )
}