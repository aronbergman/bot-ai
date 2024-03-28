import { sequelize } from '../db/index.js'

export const changeMode = bot => {
  bot.onText(/\/text|\/chat/, async msg => {
    const { id: chatId } = msg.chat
    const msgId = msg.message_id
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId
    }
    try {
      sequelize.modeuser.findOne({
        where: {
          chat_id: chatId,
          user_id: msg.from.id
        }
      }).then(res => {
        if (res?.mode.match(/\/text|\/chat/))
          return
        else if (res?.mode) {
          sequelize.modeuser.update(
            { mode: '/chat' },
            { where: { chat_id: chatId } }
          ).then(res => {
            bot.select_mode = '/chat'
            return bot.sendMessage(chatId, `🤖 <b>Выбран режим ChatGPT</b>\n\n<i>Все готово, жду ваше сообщение.</i>`, options)
          })
        } else {
          sequelize.modeuser.create({
            chat_id: chatId,
            user_id: msg.from.id,
            mode: '/chat'
          }).then(res => {
            bot.select_mode = '/chat'
            return bot.sendMessage(chatId, `🤖 <b>Выбран режим ChatGPT</b>\n\n<i>Все готово, жду ваше сообщение.</i>`, options)
          })
        }
      })

    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })

  bot.onText(/\/midjourney|\/image/, async msg => {
      const { id: chatId } = msg.chat
      const msgId = msg.message_id
      const options = {
        parse_mode: 'HTML',
        reply_to_message_id: msgId
      }
      try {
        sequelize.modeuser.findOne({
          where: {
            chat_id: chatId,
            user_id: msg.from.id
          }
        }).then(res => {
          if (res?.mode.match(/\/midjourney|\/image/))
            return
          else if (res?.mode) {
            sequelize.modeuser.update(
              { mode: '/image' },
              { where: { chat_id: chatId } }
            ).then(res => {
              bot.select_mode = '/image'
              return bot.sendMessage(chatId, `✏️ <b>Выбран режим Midjourney</b>\n\n<i>Какое изображение вы бы хотели сгенерировать?</i>`, options)
            })
          } else {
            sequelize.modeuser.create({
              chat_id: chatId,
              user_id: msg.from.id,
              mode: '/image'
            }).then(res => {
              bot.select_mode = '/image'
              return bot.sendMessage(chatId, `✏️ <b>Выбран режим Midjourney</b>\n\n<i>Какое изображение вы бы хотели сгенерировать?</i>`, options)
            })
          }
        })
      } catch
        (error) {
        await bot.sendMessage(chatId, `${error.message}`, options)
      }
    }
  )
}
