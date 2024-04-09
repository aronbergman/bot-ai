import { autoRemoveMessage } from '../hoc/autoRemoveMessage.js'
import { db } from '../../db/index.js'
import { COMMAND_GPT, START_MIDJOURNEY } from '../../constants/index.js'
import events from 'events'

/*

TODO: Добавить обработку русскоязычных запросов.

При входе в режим MI
1. Показать короткую инструкцию (в ней
        кол-во бесплатных запросов (либо инф о тарифе), порно-правила
         кнопка с покупкой и кнопка с отменой (выйти из режима))

2. Отключение режима GPT и обработка ответного текста:
    1. Созранить статус включенного режима /mi
    2. Установить if если этот режим - отправлять запрос в MI а не в GPT
    3. После отправки запроса показать информацию о примерном времени генерации и перейти к режиму чат



    😢 У вас недостаточно запросов, чтобы выполнить это действие. Для генерации изображения, необходимо хотя бы один запрос. Восполним запасы?


1. при выборе ВАРИАЦИИ 4 в первый раз, дал вариант, с кнопками для второго запроса.
2. при выборе повторной варианции отдал сначала (не верный )

 */


export const keyboardMidjourney = async (bot, msg) => {
  const sendMidjourney = async (bot, chatId, options) => {
    let accountMessage = await bot.sendMessage(
      chatId,
      '✏️',
      options
    )

    const timeout = setTimeout((chatId, message_id, START_MIDJOURNEY) => {
      bot.deleteMessage(chatId, message_id)
      bot.sendMessage(chatId, START_MIDJOURNEY, {
        ...options,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏞 Купить подписку', callback_data: 'B' }],
            [{ text: 'Выйти', callback_data: COMMAND_GPT }]
          ]
        }
      })
      clearTimeout(timeout)
    }, 1000, chatId, accountMessage.message_id, START_MIDJOURNEY)

    var eventEmitter = new events.EventEmitter()

    eventEmitter.on(COMMAND_GPT, function(query) {

    })

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data, callbackQuery)
      // eventEmitter.removeAllListeners()
      bot.answerCallbackQuery(callbackQuery.id, 'I\'m cold and I want to eat', false)
    })
  }

  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }
  try {
    db.subscriber.findOne({
      where: {
        chat_id: chatId,
        user_id: msg.from.id
      }
    }).then(res => {
      if (res?.mode.match(/\MIDJOURNEY/))
        return sendMidjourney(bot, chatId, options)
      else if (res?.mode) {
        db.subscriber.update(
          {
            mode: 'MIDJOURNEY',
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            username: msg.from.username,
            language_code: msg.from.language_code
          },
          { where: { chat_id: chatId } }
        ).then(res => {
          bot.select_mode = 'MIDJOURNEY'
          return sendMidjourney(bot, chatId, options)
        })
      } else {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          username: msg.from.username,
          language_code: msg.from.language_code,
          mode: 'MIDJOURNEY'
        }).then(res => {
          bot.select_mode = 'MIDJOURNEY'
          return sendMidjourney(bot, chatId, options)
        })
      }
    }).then(res => {

    })
  } catch
    (error) {
    await bot.sendMessage(chatId, `${error.message}`, options)
  }
}