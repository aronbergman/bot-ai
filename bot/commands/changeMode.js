import { sequelize } from '../db/index.js'

export const changeMode = bot => {
  const sendChatGPT = async (bot, chatId, options) => {
    await bot.sendMessage(chatId, `🤖 <b>Выбран режим ChatGPT 3.5</b>`, options)
  }

  const sendMidjourney = async (bot, chatId, options) => {
    await bot.sendMessage(chatId, `✏️ <b>Выбран режим Midjourney</b>`, options)
  }

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
          return sendChatGPT(bot, chatId, options)
        else if (res?.mode) {
          sequelize.modeuser.update(
            { mode: '/chat' },
            { where: { chat_id: chatId } }
          ).then(res => {
            bot.select_mode = '/chat'
            return sendChatGPT(bot, chatId, options)
          })
        } else {
          sequelize.modeuser.create({
            chat_id: chatId,
            user_id: msg.from.id,
            mode: '/chat'
          }).then(res => {
            bot.select_mode = '/chat'
            return sendChatGPT(bot, chatId, options)
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
            return sendMidjourney(bot, chatId, options)
          else if (res?.mode) {
            sequelize.modeuser.update(
              { mode: '/image' },
              { where: { chat_id: chatId } }
            ).then(res => {
              bot.select_mode = '/image'
              return sendMidjourney(bot, chatId, options)
            })
          } else {
            sequelize.modeuser.create({
              chat_id: chatId,
              user_id: msg.from.id,
              mode: '/image'
            }).then(res => {
              bot.select_mode = '/image'
              return sendMidjourney(bot, chatId, options)
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
