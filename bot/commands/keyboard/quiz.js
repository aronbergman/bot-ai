import events from 'events'
import { db } from '../../db/index.js'
import { getStringOrDist } from '../../utils/quiz/getStringOrDist.js'
import dotenv from 'dotenv'
import { ct } from '../../utils/createTranslate.js'
import { createNewQuizKeyboard } from '../../utils/quiz/createNewQuizKeyboard.js'

dotenv.config()

const miniGames = ['🏀', '🏀', '🏀', '⚽', '⚽', '⚽', '🎳', '🎲', '🎯']

export const keyboardQuiz = async (bot, msg, isDescription) => {
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
      const keyboard = createNewQuizKeyboard(res, msgId, t)
      const timeout = setTimeout(async () => {
        // TODO: Сделать подсчет колличества бесплатных запросов в сутки на бесплатном режиме
        await bot.deleteMessage(chatId, accountMessage.message_id)
        accountMessage = await bot.sendMessage(
          chatId,
          isDescription ? t('start_quiz') : t('replay'),
          {
            message_id: accountMessage.message_id,
            chat_id: chatId,
            ...options,
            reply_markup: {
              inline_keyboard: [
                ...keyboard,
                [{ text: `👾 ${t('stat_quiz')}`, callback_data: `HISTORY_QUIZ_${chatId}` }]
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

  eventEmitter.on(`WIN_REQ_${msgId}`, async function(qwery) {
    eventEmitter.removeAllListeners()
    // await removeQueryFromPrevMessage(bot, chatId, accountMessage)
    await bot.deleteMessage(chatId, accountMessage.message_id).catch()
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
          const settings = await db.settings.findOne(
            { where: { user_id: 0 } }
          )

          const { emoji, value } = quiz.dice
          const createStringValue = getStringOrDist(emoji)
          // const quizRes = calculationOfWonTokens(emoji, value)
          const quizRes = (value * settings.dataValues['m_factor_req'])
          await bot.sendMessage(process.env.NOTIF_GROUP, `${emoji} ${msg.from.first_name} + ${quizRes} tokens (${value}) @${msg.from.username}`)
          const text = quizRes ? t('win_token', { emoji, count: quizRes }) : t('desc_not_win', { emoji })

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
              quiz_token_available: available
            },
            { where: { chat_id: chatId } }
          ).then(res => {

            setTimeout((emoji, value, chatId, text) => {
              bot.sendMessage(
                chatId,
                text,
                options
              )
              db.subscriber.findOne(
                { where: { chat_id: chatId } }
              ).then(res => {
                db.subscriber.update(
                  { tokens: (res.dataValues.tokens + quizRes) },
                  { where: { chat_id: chatId } }
                )
              })
              return keyboardQuiz(bot, msg, false)
            }, 4400, emoji, value, chatId, text)
          })
        })
      }
    })
  })

  eventEmitter.on(`WIN_SUBS_${msgId}`, async function(qwery) {
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

          const { dataValues } = await db.settings.findOne(
            { where: { user_id: 0 } }
          )

          // const quizRes = calculationOfWonTokens(emoji, value)
          const quizRes = value * dataValues['m_factor_sub']
          await bot.sendMessage(process.env.NOTIF_GROUP, `${emoji} ${msg.from.first_name} + ${quizRes} tokens (${value}) @${msg.from.username}`)

          // const text = quizRes ? t('win_subscribe_month', { 0: '@PiraJoke' }) : t('desc_not_win', {emoji})
          const text = t('win_token', { emoji, count: quizRes })

          if (quizRes) {
            // await db.payment.create({
            //   payment_id: nanoid(7),
            //   type_of_tariff: 'DAYS',
            //   duration: 30,
            //   user_id: chatId,
            //   username: msg.from.username,
            //   payment_method: 'QUIZ',
            //   payment_confirmed: new Date()
            // })

            db.settings.findOne(
              { where: { user_id: 0 } }
            ).then(settings => {
              db.subscriber.findOne(
                { where: { chat_id: chatId } }
              ).then(res => {
                db.subscriber.update(
                  { tokens: (res.dataValues.tokens + quizRes) },
                  { where: { chat_id: chatId } }
                )
              })
            })

            // await db.subscriber.update({
            //   paid_days: 30
            // }, { where: { chat_id: chatId } })
            // TODO: Ждем рефералов сделать рефералку на 3 из 5 ссылок пришли от пользователя
            // await bot.sendMessage(process.env.NOTIF_GROUP, `🎰 @${msg.from.username} выиграл подписку, ждём рефералов...`)
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
              quiz_subs_available: available
            },
            { where: { chat_id: chatId } }
          ).then(res => {
            setTimeout((emoji, value, chatId, text) => {
              bot.sendMessage(
                chatId,
                text,
                options
              )
              return keyboardQuiz(bot, msg, false)
            }, 2000, emoji, value, chatId, text)
          })
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

      let text = [t('stat_quiz_description')]

      for (let i = 0; i < res.length; i++) {
        let someDate = new Date(res[i].dataValues.createdAt).toLocaleString('ru')
        // TODO: переделать логику расчета на 1 11 22 33 44 55 66
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
    eventEmitter.removeAllListeners()
    // TODO: исправить баг. запуск нескольких игр одновременно
  })
}
