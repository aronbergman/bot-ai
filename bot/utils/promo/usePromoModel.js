import { db } from '../../db/index.js'

export const usePromoModel = async (bot, code, chatId) => {
  if (code === 'X2PROMO') {
    await db.subscriber.findOne({
      where: {
        chat_id: chatId
      }
    }).then(async res => {
      console.log("res.dataValues.tags", res.dataValues.tags)
      if (res.dataValues.tags?.includes(code))  {
        await bot.sendMessage(chatId,
            `Этот промо-код уже использован.`)

      } else {
        await db.subscriber.update(
          {
            quiz_available: 0,
            quiz_type_available: 'X2',
            tags: `${res.dataValues.tags ? res.dataValues.tags : ''}` + `#${code}`
          },
          { where: { chat_id: chatId } }
        ).then(async res => {
          await bot.sendMessage(chatId,
            `🙄ОК! Колличество попыток для Викторины на этой неделе увеличено в 2 раза! Удачи!`)
        })
      }
    })
  }
}