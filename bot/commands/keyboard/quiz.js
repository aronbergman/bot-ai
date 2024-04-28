import {
  QUIZS, WON_A_MONTH_SUBSCRIPTION
} from '../../constants/index.js'
import events from 'events'
import { db } from '../../db/index.js'
import { getStringOrDist } from '../../utils/quiz/getStringOrDist.js'
import { calculationOfWonTokens } from '../../utils/quiz/calculationOfWonTokens.js'
import { nanoid } from 'nanoid'
import dotenv from 'dotenv'
import { ct } from '../../utils/createTranslate.js'

dotenv.config()

const miniGames = ['🏀', '🏀', '🏀', '⚽', '⚽', '⚽', '🎳', '🎲', '🎯']

export const keyboardQuiz = async (bot, msg) => {
  const t = await ct(msg)
  let accountMessage
  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }

  try {
    accountMessage = await bot.sendMessage(
      chatId,
      '🪄',
      options
    )

    await db.subscriber.findOne({
      where: {
        chat_id: chatId
      }
    }).then(res => {

      let keyboard = []
      let keyboard2 = []

      if (res?.dataValues?.quiz_subs_available === 0 && res.dataValues?.quiz_token_available === 0) {
        keyboard.push({ text: '⌛️ Новые игры через неделю', callback_data: `NO_ATTEMPTS` })
      } else {
        if (res?.dataValues?.quiz_subs_available !== 0)
          keyboard.push({
            text: `Выиграй подписку 🥳 (${res.dataValues.quiz_subs_available})`,
            callback_data: `WIN_SUBS_${chatId}`
          })
        if (res?.dataValues?.quiz_token_available !== 0)
          keyboard2.push({
            text: `Выиграй запросы 🤓 (${res.dataValues.quiz_token_available})`,
            callback_data: `WIN_REQ_${chatId}`
          })
      }

      const timeout = setTimeout(async () => {
        // TODO: Сделать подсчет колличества бесплатных запросов в сутки на бесплатном режиме
        await bot.deleteMessage(chatId, accountMessage.message_id)
        accountMessage = await bot.sendMessage(
          chatId,
          t('start_quiz'),
          {
            message_id: accountMessage.message_id,
            chat_id: chatId,
            ...options,
            reply_markup: {
              inline_keyboard: [
                keyboard,
                keyboard2,
                [{ text: '👾 Статистика игр', callback_data: `HISTORY_QUIZ_${chatId}` }]
              ]
            }
          }
        )
        clearTimeout(timeout)
      }, 1000)

    })
  } catch (error) {
    await bot.sendMessage(chatId, `${error.message}`, options)
  }

    const eventEmitter = new events.EventEmitter()

  eventEmitter.on(`WIN_REQ_${chatId}`, async function(qwery) {
    eventEmitter.removeAllListeners()
    // await removeQueryFromPrevMessage(bot, chatId, accountMessage)
    await bot.deleteMessage(chatId, accountMessage.message_id)
    await db.subscriber.findOne({
      where: {
        chat_id: chatId
      }
    }).then(async res => {

      if (res?.dataValues.quiz_token_available > 0) {
        bot.sendDice(msg.chat.id, {
          emoji: miniGames[Math.floor(Math.random() * miniGames.length)],
          reply_to_message_id: msgId,
          disable_notification: true,
          protect_content: true
        }).then(async (quiz) => {
          const { emoji, value } = quiz.dice
          const createStringValue = getStringOrDist(emoji)
          const quizRes = calculationOfWonTokens(emoji, value)
          await bot.sendMessage(process.env.NOTIF_GROUP, `${msg.from.first_name} играет в ${emoji}, value ${value}, tokens ${quizRes} @${msg.from.username}`)
          const text = quizRes ? QUIZS[0].fin(emoji, quizRes) : QUIZS[0].finNeg(emoji)

          setTimeout((emoji, value, chatId) => {
            bot.sendMessage(
              chatId,
              text,
              options
            )
            db.subscriber.findOne(
              { where: { chat_id: chatId } }
            ).then(res => {
              db.subscriber.update(
                { tokens: res.dataValues.tokens + quizRes },
                { where: { chat_id: chatId } }
              )
            })
          }, 5000, emoji, value, chatId)

          await db.quiz.create(
            {
              chat_id: chatId,
              name: createStringValue,
              dice_res: value,
              quiz_res: quizRes
            }
          )

          const available = res?.dataValues.quiz_token_available - 1

          await db.subscriber.update(
            {
              quiz_token_available: available,
            },
            { where: { chat_id: chatId } }
          )
        })
      }
    })
  })

  eventEmitter.on(`WIN_SUBS_${chatId}`, async function(qwery) {
    eventEmitter.removeAllListeners()
    // await removeQueryFromPrevMessage(bot, chatId, accountMessage)
    await bot.deleteMessage(chatId, accountMessage.message_id)
    await db.subscriber.findOne({
      where: {
        chat_id: chatId
      }
    }).then(async res => {

      if (res?.dataValues.quiz_subs_available > 0) {
        bot.sendDice(msg.chat.id, {
          emoji: '🎰',
          reply_to_message_id: msgId,
          disable_notification: true,
          protect_content: true
        }).then(async (quiz) => {
          const { emoji, value } = quiz.dice

          const quizRes = calculationOfWonTokens(emoji, value)
          await bot.sendMessage(process.env.NOTIF_GROUP, `${msg.from.first_name} играет в ${emoji}, value ${value}, tokens ${quizRes} @${msg.from.username}`)
          const text = quizRes ? WON_A_MONTH_SUBSCRIPTION('@PiraJoke') : QUIZS[0].finNeg(emoji)

          setTimeout((emoji, value, chatId) => {
            bot.sendMessage(
              chatId,
              text,
              options
            )
          }, 5000, emoji, value, chatId)

          if (quizRes) {
            await db.payment.create({
              payment_id: nanoid(7),
              type_of_tariff: 'DAYS',
              duration: 30,
              user_id: chatId,
              username: msg.from.username,
              payment_method: 'QUIZ',
              payment_confirmed: new Date()
            })
            await db.subscriber.update({
              paid_days: 30
            }, { where: { chat_id: chatId } })
            // TODO: Ждем рефералов сделать рефералку на 3 из 5 ссылок пришли от пользователя
            await bot.sendMessage(process.env.NOTIF_GROUP, `🎰 @${msg.from.username} выиграл подписку, ждём рефералов...`)
          }

          await db.quiz.create(
            {
              chat_id: chatId,
              name: 'MACHINE',
              dice_res: value,
              quiz_res: quizRes
            }
          )

          const available = res?.dataValues.quiz_subs_available - 1

          await db.subscriber.update(
            {
              quiz_subs_available: available,
            },
            { where: { chat_id: chatId } }
          )
        })
      }
    })
  })

  eventEmitter.on(`HISTORY_QUIZ_${chatId}`, async function() {
    await bot.deleteMessage(chatId, accountMessage.message_id)
    await db.quiz.findAll({
      where: {
        chat_id: chatId
      },
      limit: 15,
      subQuery: false,
      order: [['createdAt', 'DESC']]
    }).then(async res => {

      let text = ['Итак, победитель 🤴🏻\nвот твоя статистика...\n\n']

      for (let i = 0; i < res.length; i++) {
        let someDate = new Date(res[i].dataValues.createdAt).toLocaleString('ru')
        if (res[i].dataValues.name === 'MACHINE')
          text.push(`${res[i].dataValues.quiz_res > 55 ? '🎁' : '➖'}       ${getStringOrDist(null, res[i].dataValues.name)}       ${someDate}\n`)
        else
          text.push(`${res[i].dataValues.quiz_res ? '🎁' : '➖'}  <b>${res[i].dataValues.quiz_res}</b>   ${getStringOrDist(null, res[i].dataValues.name)}       ${someDate}\n`)
      }
      await bot.sendMessage(chatId, text.join(''), options)
      eventEmitter.removeAllListeners()
    })
  })

  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    eventEmitter.emit(callbackQuery.data)
    bot.answerCallbackQuery(callbackQuery.id, 'quiz', false)
  })
}
