import { autoRemoveMessage } from '../hoc/autoRemoveMessage.js'
import { db } from '../../db/index.js'
import { COMMAND_GPT, START_DALLE, TARIFS } from '../../constants/index.js'
import events from 'events'
import { PAYOK } from 'payok'
import { nanoid } from 'nanoid'
import dotenv from 'dotenv'
import { keyboardChatGPT } from './chat_gpt.js'

dotenv.config({ path: '../.env' })

/*

TODO: Добавить обработку русскоязычных запросов.

- Показать что вошли в мод
- Принять текст и отдать на генерацию
- закрыть режим
- показать лоадер на пвремя ненерации
- запустить процесс как из mi по загрузке картинки и ее отправке
- отправить картинку
 */


export const keyboardDalle = async (bot, msg) => {
  const sendDalle = async (bot, chatId, options) => {
    let accountMessage = await bot.sendMessage(
      chatId,
      '🎨',
      options
    ).catch(err => console.log(err))

    const firstLevel = {
      message: START_DALLE,
      options: {
        ...options,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏞 Купить подписку', callback_data: `buy_subscription_M_${chatId}` }],
            [{ text: 'Выйти', callback_data: `${COMMAND_GPT}_M_${chatId}` }]
          ]
        }
      }
    }

    const buyLevel = {
      message: 'Выберите тарифный план, который хотите приобрести.',
      options: {
        ...options,
        reply_markup: {
          inline_keyboard: [
            [{ text: TARIFS[0].text, callback_data: `${TARIFS[0].callback_data}_M_${chatId}`  }],
            [{ text: TARIFS[1].text, callback_data: `${TARIFS[1].callback_data}_M_${chatId}` }],
            [{ text: TARIFS[2].text, callback_data: `${TARIFS[2].callback_data}_M_${chatId}`  }],
            [{ text: TARIFS[3].text, callback_data: `${TARIFS[3].callback_data}_M_${chatId}` }],
            [{ text: TARIFS[4].text, callback_data: `${TARIFS[4].callback_data}_M_${chatId}`  }],
            [{ text: TARIFS[5].text, callback_data: `${TARIFS[5].callback_data}_M_${chatId}` }],
            [{ text: TARIFS[6].text, callback_data: `${TARIFS[6].callback_data}_M_${chatId}`  }],
            [{ text: 'Вернуться в меню', callback_data: `get_first_level_M_${chatId}` }]
          ]
        }
      }
    }

    const timeout = setTimeout((chatId, message_id, firstLevel, messageStart) => {
      bot.editMessageText(firstLevel.message, {
        chat_id: chatId,
        message_id: message_id,
        ...firstLevel.options
      }).catch(() => {
        console.log('!')
        return true
      })
      clearTimeout(timeout)
    }, 1000, chatId, accountMessage.message_id, firstLevel)

    var eventEmitter = new events.EventEmitter()

    eventEmitter.on(`buy_subscription_M_${chatId}`, async function() {
      await bot.editMessageText(
        buyLevel.message,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...buyLevel.options
        }
      ).catch(err => console.log(err))
    })

    eventEmitter.on(`get_first_level_M_${chatId}`, function() {
      bot.editMessageText(
        firstLevel.message,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...firstLevel.options
        }
      ).catch(err => console.log(err))
    })

    eventEmitter.on(`${COMMAND_GPT}_M_${chatId}`, function() {
      return keyboardChatGPT(bot, msg)
    })

    for (let i = 0; i < TARIFS.length; i++) {
      eventEmitter.on(`${TARIFS[i].callback_data}_M_${chatId}`, function() {
        const tarif = TARIFS[i].callback_data.split('_')

        const payok = new PAYOK({
          apiId: process.env.PAYOK_APIID,
          apiKey: process.env.PAYOK_APIKEY,
          secretKey: process.env.PAYOK_SECRETKEY,
          shop: process.env.PAYOK_SHOP
        })

        db.payment.create({
          payment_id: nanoid(7),
          type_of_tariff: tarif[0],
          duration: tarif[1],
          price: tarif[2],
          currency: 'RUB',
          user_id: chatId,
          username: msg.from.username,
          payment_method: 'PAYOK'
        }).then((invoice) => {

          const link = payok.getPaymentLink({
            amount: invoice.dataValues.price,
            payment: invoice.dataValues.payment_id,
            desc: TARIFS[i].text,
            method: 'cd'
          })

          const linkSBP = payok.getPaymentLink({
            amount: invoice.dataValues.price,
            payment: invoice.dataValues.payment_id,
            desc: TARIFS[i].text,
            method: 'sbp'
          })

          const linkCR = payok.getPaymentLink({
            amount: invoice.dataValues.price,
            payment: invoice.dataValues.payment_id,
            desc: TARIFS[i].text,
            method: 'cru'
          })

          const linkCW = payok.getPaymentLink({
            amount: invoice.dataValues.price,
            payment: invoice.dataValues.payment_id,
            desc: TARIFS[i].text,
            method: 'cwo'
          })

          bot.editMessageText(
            `🔗 Осталось только оплатить

Подписка ${invoice.dataValues.type_of_tariff} ${invoice.dataValues.duration} 
Сумма: ${invoice.dataValues.price} ${invoice.dataValues.currency}
Номер платежа: ${invoice.dataValues.payment_id}

Payok - оплачивайте следующими способами:
   └ VISA, Mastercard, MIR, QIWI, YooMoney, Crypto
`, {
              ...options,
              message_id: accountMessage.message_id,
              chat_id: chatId,
              reply_markup: {
                inline_keyboard: [
                  [{ text: '| Оплатить через Payok |', url: link.payUrl }],
                  [{ text: '| Российская карта | Payok |', url: linkCR.payUrl }],
                  [{ text: '| Зарубежная карта | Payok |', url: linkCW.payUrl }],
                  [{ text: '| СБП | Payok |', url: linkSBP.payUrl }],
                   [{ text: 'Вернуться в меню', callback_data: `get_first_level_M_${chatId}` }]
                ]
              }
            }).catch(err => console.log(err))
        })
      })
    }

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data, callbackQuery)
      bot.answerCallbackQuery(callbackQuery.id, 'keyboard/dall-e', false)
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
      if (res?.dataValues.mode?.match(/\DALL-E/))
        return sendDalle(bot, chatId, options)
      else if (res?.dataValues.mode) {
        db.subscriber.update(
          {
            mode: 'DALL-E',
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            username: msg.from.username,
            language_code: msg.from.language_code
          },
          { where: { chat_id: chatId } }
        ).then(res => {
          bot.select_mode = 'DALL-E'
          return sendDalle(bot, chatId, options)
        })
      } else {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          username: msg.from.username,
          language_code: msg.from.language_code,
          mode: 'DALL-E'
        }).then(res => {
          bot.select_mode = 'DALL-E'
          return sendDalle(bot, chatId, options)
        })
      }
    }).then(res => {

    })
  } catch
    (error) {
    await bot.sendMessage(chatId, `${error.message}`, options).catch(err => console.log(err))
  }
}