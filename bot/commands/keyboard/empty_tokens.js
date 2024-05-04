import { INITIAL_SESSION, TARIFS } from '../../constants/index.js'
import { db } from '../../db/index.js'
import * as events from 'events'
import { PAYOK } from 'payok'
import { nanoid } from 'nanoid'
import dotenv from 'dotenv'
import { ct } from '../../utils/createTranslate.js'
import { keyboardQuiz } from './quiz.js'

dotenv.config({ path: '../.env' })

export const isTokensEmpty = async (bot, msg, tokens) => {
  const t = await ct(msg)
  let accountMessage
  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const { id } = msg.from
  // TODO: рефакторинг в отдельный файл
  const generalOptions = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId,
    disable_web_page_preview: true
  }
  try {
    // TODO: рефакторинг в отдельный файл
    const firstLevel = {
      message: null,
      options: {
        ...generalOptions,
        reply_markup: {
          inline_keyboard: [
            [{ text: t('keyboard_buy_subscription'), callback_data: `buy_subscription_A_${chatId}` }],
            [{ text: t('keyboard_referral'), callback_data: `referral_program_A_${chatId}` }],
            [{ text: t('keyboard_quiz'), callback_data: `keyboard_quiz_A_${chatId}` }]
          ]
        }
      }
    }
    // TODO: рефакторинг в отдельный файл
    const buyLevel = {
      message: t('keyboard_tariff'),
      options: {
        ...generalOptions,
        reply_markup: {
          inline_keyboard: [
            [{ text: TARIFS[0].text, callback_data: `${TARIFS[0].callback_data}_A_${chatId}` }],
            [{ text: TARIFS[1].text, callback_data: `${TARIFS[1].callback_data}_A_${chatId}` }],
            [{ text: TARIFS[2].text, callback_data: `${TARIFS[2].callback_data}_A_${chatId}` }],
            [{ text: TARIFS[3].text, callback_data: `${TARIFS[3].callback_data}_A_${chatId}` }],
            [{ text: TARIFS[4].text, callback_data: `${TARIFS[4].callback_data}_A_${chatId}` }],
            [{ text: TARIFS[5].text, callback_data: `${TARIFS[5].callback_data}_A_${chatId}` }],
            [{ text: TARIFS[6].text, callback_data: `${TARIFS[6].callback_data}_A_${chatId}` }],
            [{ text: 'Вернуться в меню', callback_data: `get_first_level_A_${chatId}` }]
          ]
        }
      }
    }
    // TODO: рефакторинг в отдельный файл
    // TODO: сделать реферальную программу
    const referralLevel = {
      message: '🤝 Зарабатывайте запросы с нашей реферальной системой\n' +
        '\n' +
        'С каждого приглашенного пользователя вы получаете: 3 запроса ChatGPT и 1 запрос Midjourney\n' +
        'Приглашено за все время вами человек: 0\n' +
        '\n' +
        'Ваша пригласительная ссылка: https://t.me/XXX?start=user-XXX',
      options: {
        ...generalOptions,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Вернуться в меню', callback_data: `get_first_level_A_${chatId}` }]
          ]
        }
      }
    }

    msg['ctx'] = INITIAL_SESSION

    const eventEmitter = new events.EventEmitter()

    eventEmitter.on(`referral_program_A_${chatId}`, async function() {
      await bot.editMessageText(
        'text',
        {
          message_id: accountMessage.message_id,
          chat_id: chatId
        }
      ).catch(err => console.log(err))
    })

    eventEmitter.on(`buy_subscription_A_${chatId}`, async function() {
      await bot.editMessageText(
        buyLevel.message,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...buyLevel.options
        }
      ).catch(err => console.log(err))
    })

    eventEmitter.on(`keyboard_quiz_A_${chatId}`, async function() {
      eventEmitter.removeAllListeners()
      return keyboardQuiz(bot, msg, true)
    })

    eventEmitter.on(`referral_program_A_${chatId}`, async function() {
      await bot.editMessageText(
        referralLevel.message,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...referralLevel.options
        }
      ).catch(err => console.log(err))
    })

    eventEmitter.on(`get_first_level_A_${chatId}`, function() {
      bot.editMessageText(
        t('account'),
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...firstLevel.options
        }
      ).catch(err => console.log(err))
    })

    for (let i = 0; i < TARIFS.length; i++) {
      eventEmitter.on(`${TARIFS[i].callback_data}_A_${chatId}`, function() {
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
              ...generalOptions,
              message_id: accountMessage.message_id,
              chat_id: chatId,
              reply_markup: {
                inline_keyboard: [
                  [{ text: '| Оплатить через Payok |', url: link.payUrl }],
                  [{ text: '| Российская карта | Payok |', url: linkCR.payUrl }],
                  [{ text: '| Зарубежная карта | Payok |', url: linkCW.payUrl }],
                  [{ text: '| СБП | Payok |', url: linkSBP.payUrl }],
                  [{ text: 'Вернуться в меню', callback_data: `get_first_level_A_${chatId}` }]
                ]
              }
            }).catch(err => console.log(err))
        })
      })
    }

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data)
      bot.answerCallbackQuery(callbackQuery.id, 'my_account', false)
    })

    accountMessage = await bot.sendMessage(
      chatId,
      '💤',
      generalOptions
    ).catch(err => console.log(err))

    const timeout = setTimeout(async (accountMessage) => {

      await db.subscriber.findOne({
        where: {
          chat_id: chatId
        }
      }).then(res => {
        clearTimeout(timeout)
        bot.editMessageText(
          t('msg:empty_tokens', {tokens}),
          {
            message_id: accountMessage.message_id,
            chat_id: chatId,
            ...firstLevel.options
          }
        ).catch(err => console.log(err))
      })
    }, 2000, accountMessage)
  } catch (error) {
    await bot.sendMessage(chatId, `${error.message}`, generalOptions)
  }
}
