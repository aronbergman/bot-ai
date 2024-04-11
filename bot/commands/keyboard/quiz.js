import {
  QUIZ_RULES, QUIZS
} from '../../constants/index.js'
import events from 'events'
import { removeQueryFromPrevMessage } from '../hoc/removeQueryFromPrevMsg.js'
import { db } from '../../db/index.js'

const miniGames = ['🎲', '🎯', '🏀', '⚽', '🎳']

const getStringOrDist = (emoji, name) => {
  const miniGames = [
    { emoji: '🎲', name: 'CUBE' },
    { emoji: '🎯', name: 'DARTS' },
    { emoji: '🏀', name: 'BASKET' },
    { emoji: '⚽', name: 'FOOT' },
    { emoji: '🎳', name: 'BOWLING' }
  ]

  // { emoji: '🎰', name: 'MACHINE' }

  return miniGames.map((i) => {
    if (emoji)
      if (i.emoji === emoji) return i.name
    if (name)
      if (i.name === name) return i.emoji
  }).join('')
}

export const keyboardQuiz = async (bot, msg) => {
  let quiz
  let accountMessage
  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }

  var eventEmitter = new events.EventEmitter()

  eventEmitter.on(`WIN_REQ_${chatId}`, async function(qwery) {
    console.log(`GO_GO${chatId}`, qwery)
    eventEmitter.removeAllListeners(`WIN_REQ_${chatId}`)
    await removeQueryFromPrevMessage(bot, chatId, accountMessage)
    await db.subscriber.findOne({
      where: {
        chat_id: chatId
      }
    }).then(async res => {
      let quizAvailable
      if (!res) {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          mode: 'GPT'
        })
        quizAvailable = 5
      } else {
        quizAvailable = res?.dataValues?.quiz_available
      }

      if (quizAvailable > 0) {
        bot.sendDice(accountMessage.chat.id, {
          emoji: miniGames[Math.floor(Math.random() * miniGames.length)],
          reply_to_message_id: msgId,
          disable_notification: true,
          protect_content: true
        }).then(async (quiz) => {
          const { emoji, value } = quiz.dice
          const createStringValue = getStringOrDist(emoji)

          const quizRes = value > 1 ? Math.round(value / 2) : 0
          const text = quizRes ? QUIZS[0].fin(emoji, quizRes) : QUIZS[0].finNeg(emoji)

          setTimeout((emoji, value, chatId) => bot.sendMessage(
            chatId,
            text,
            {
              ...options,
              reply_markup: {
                inline_keyboard: [
                  [{ text: '👾 Статистика игр', callback_data: `HISTORY_QUIZ_${chatId}` }]
                ]
              }
            }
          ), 3000, emoji, value, chatId)

          await db.quiz.create(
            {
              chat_id: chatId,
              name: createStringValue,
              dice_res: value,
              quiz_res: quizRes
            }
          )

          const available = res.dataValues.quiz_available - 1;

          await db.subscriber.update(
            {
              quiz_available: available,
              quiz_type_available: available ? 'REQUESTS' : null
            },
            { where: { chat_id: chatId } }
          )
        })
      }
      // const {} = res.data

    })
  })
  eventEmitter.on(`WIN_SUBS_${chatId}`, async function(qwery) {
    console.log(`WIN_SUBS_${chatId}`, qwery)
    eventEmitter.removeAllListeners(`WIN_SUBS_${chatId}`)
    await removeQueryFromPrevMessage(bot, chatId, accountMessage)
    await db.subscriber.findOne({
      where: {
        chat_id: chatId
      }
    }).then(async res => {
      let quizAvailable
      if (!res) {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          mode: 'GPT'
        })
        quizAvailable = 5
      } else {
        quizAvailable = res?.dataValues?.quiz_available
      }

      if (quizAvailable > 0) {
        bot.sendDice(accountMessage.chat.id, {
          emoji: '🎰',
          reply_to_message_id: msgId,
          disable_notification: true,
          protect_content: true
        }).then(async (quiz) => {
          const { emoji, value } = quiz.dice
          const createStringValue = getStringOrDist(emoji)

          const quizRes = value // TODO: установить значение для выйгрыша

          setTimeout((emoji, value, chatId) => bot.sendMessage(
            chatId,
            QUIZS[0].fin(emoji, quizRes),
            {
              ...options,
              reply_markup: {
                inline_keyboard: [
                  [{ text: '👾 Статистика игр', callback_data: `HISTORY_QUIZ_${chatId}` }]
                ]
              }
            }
          ), 3000, emoji, value, chatId)

          await db.quiz.create(
            {
              chat_id: chatId,
              name: 'MACHINE',
              dice_res: value,
              quiz_res: quizRes
            }
          )

          const available = res.dataValues.quiz_available - 1;

          await db.subscriber.update(
            {
              quiz_available: available,
              quiz_type_available: available ? 'SUBSCRIBE' : null
            },
            { where: { chat_id: chatId } }
          )
        })
      }
    })
  })

  eventEmitter.on(`HISTORY_QUIZ_${chatId}`, async function() {
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
        text.push(`${res[i].dataValues.quiz_res ? '🎁' : '⬜️'}  <b>${res[i].dataValues.quiz_res}</b>   ${getStringOrDist(null, res[i].dataValues.name)}       ${someDate}\n`)
      }
      await bot.sendMessage(chatId, text.join(''), options)
      eventEmitter.removeAllListeners()
    })
  })

  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    eventEmitter.emit(callbackQuery.data)
    bot.answerCallbackQuery(callbackQuery.id, 'quiz', false)
  })

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

      // res.dataValues.quiz_available

      if (res?.dataValues?.quiz_available == 0) {
        keyboard.push({ text: '⌛️ Новая игра через неделю', callback_data: `EXIT` })
      } else if (res?.dataValues.quiz_type_available === 'SUBSCRIBE') {
        keyboard.push({
          text: `Выиграй подписку 🥳 (${res.dataValues.quiz_available})`,
          callback_data: `WIN_SUBS_${chatId}`
        })
      } else if (res?.dataValues.quiz_type_available === 'REQUESTS') {
        keyboard.push({
          text: `Выиграй запросы 🤓 (${res.dataValues.quiz_available})`,
          callback_data: `WIN_REQ_${chatId}`
        })
      } else {
        keyboard.push({ text: 'Выиграй запросы 🤓', callback_data: `WIN_REQ_${chatId}` })
        keyboard.push({ text: 'Выиграй подписку 🥳', callback_data: `WIN_SUBS_${chatId}` })
      }

      const timeout = setTimeout(async () => {
        // TODO: Сделать подсчет колличества бесплатных запросов в сутки на бесплатном режиме
        await bot.deleteMessage(chatId, accountMessage.message_id)
        accountMessage = await bot.sendMessage(
          chatId,
          QUIZ_RULES,
          {
            message_id: accountMessage.message_id,
            chat_id: chatId,
            ...options,
            reply_markup: {
              inline_keyboard: [
                keyboard,
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
}
