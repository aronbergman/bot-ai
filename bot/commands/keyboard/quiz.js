import {
  QUIZ_RULES, QUIZS
} from '../../constants/index.js'
import events from 'events'
import { removeQueryFromPrevMessage } from '../hoc/removeQueryFromPrevMsg.js'
import { db } from '../../db/index.js'

const miniGames = ['🎲', '🎯', '🏀', '⚽', '🎳']

const getStringOrDist = (emoji) => {
  const miniGames = [
    { emoji: '🎲', name: 'CUBE' },
    { emoji: '🎯', name: 'DARTS' },
    { emoji: '🏀', name: 'BASKET' },
    { emoji: '⚽', name: 'FOOT' },
    { emoji: '🎳', name: 'BOWLING' }
  ]

  // { emoji: '🎰', name: 'MACHINE' }

  return miniGames.map((i) => {
    if (i.emoji === emoji) return i.name
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

      console.log('accountMessage.chat.id', accountMessage.chat.id)
      console.log('chatID', chatId)
      console.log('msgId', msgId)

      if (quizAvailable > 0) {
        bot.sendDice(accountMessage.chat.id, {
          emoji: miniGames[Math.floor(Math.random() * miniGames.length)],
          reply_to_message_id: msgId,
          disable_notification: true,
          protect_content: true
        }).then(async (quiz) => {
          const { emoji, value } = quiz.dice
          const createStringValue = getStringOrDist(emoji)

          const quizRes = Math.round(value / 2)

          setTimeout((emoji, value, chatId) => bot.sendMessage(
            chatId,
            QUIZS[0].fin(emoji, quizRes),
            {
              ...options,
              reply_markup: {
                inline_keyboard: [
                  [{ text: '👾 Статистика игр', callback_data: 'HISTORY_QUIZ' }]
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

          await db.subscriber.update(
            {
              quiz_available: res.dataValues.quiz_available - 1,
              quiz_type_available: 'REQUESTS'
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

      console.log('accountMessage.chat.id', accountMessage.chat.id)
      console.log('chatID', chatId)
      console.log('msgId', msgId)

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
                  [{ text: '👾 Статистика игр', callback_data: 'HISTORY_QUIZ' }]
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

          await db.subscriber.update(
            {
              quiz_available: res.dataValues.quiz_available - 1,
              quiz_type_available: 'SUBSCRIBE'
            },
            { where: { chat_id: chatId } }
          )
        })
      }
    })
  })
  eventEmitter.on(`HISTORY_QUIZ_${chatId}`, async function() {

  })

  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    eventEmitter.emit(callbackQuery.data)
    bot.answerCallbackQuery(callbackQuery.id, `${chatId}`, false)
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
                [{ text: '👾 Статистика игр', callback_data: 'HISTORY_QUIZ' }]
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
