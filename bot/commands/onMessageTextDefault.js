import { modeChatGPT } from './modes/chatGPT.js'
import events from 'events'
import { MODS_CHAT } from '../constants/index.js'
import { db } from '../db/index.js'
import { removeQueryFromPrevMessage } from './hoc/removeQueryFromPrevMsg.js'

// TODO: BUG: Невозможно повторно отправить запрос на смену характера из одного сообщения пользователя

export const onMessageTextDefault = async (bot, msg, match, sudoUser) => {
  const { id: chatID } = msg.chat
  const msgId = msg.message_id

  const optionsGeneral = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }

  try {
    let firstMessage
    if (msg.text.match(/^\/+/ig))
      return
    // TODO: Рефакторинг для минимизации обращения к бд.
    // TODO: BUG: При удалении базы данных и начале нового диалоге не создается сообщение в бд пока не выберается тип.
    // TODO: написать код который будет обрабатывать поступление смайликов и стикеров, по возможности отвечать на них

    const qweryOptions = {
      ...optionsGeneral,
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Новый диалог', callback_data: 'create_new_chat' },
            { text: 'Изменить характер ', callback_data: 'change_chat_mode' }]
        ]
      }
    }

    bot.on('message', async () => {
        if (firstMessage) {
          eventEmitter.removeAllListeners() // исправление бага с отработкой слушателя прежних сообщений
          await removeQueryFromPrevMessage(bot, chatID, firstMessage)
        }
      }
    )


    var eventEmitter = new events.EventEmitter()

    eventEmitter.on('change_chat_mode', async function() {
      await bot.editMessageText(
        firstMessage.text,
        {
          message_id: firstMessage.message_id,
          chat_id: chatID,
          reply_markup: {
            inline_keyboard: [
              [{ text: MODS_CHAT[0].text, callback_data: MODS_CHAT[0].callback_data },
                { text: MODS_CHAT[1].text, callback_data: MODS_CHAT[1].callback_data }],
              [{ text: MODS_CHAT[2].text, callback_data: MODS_CHAT[2].callback_data },
                { text: MODS_CHAT[3].text, callback_data: MODS_CHAT[3].callback_data }],
              [{ text: MODS_CHAT[4].text, callback_data: MODS_CHAT[4].callback_data },
                { text: '⬅️ Назад', callback_data: 'first_step' }]
            ]
          }
        }
      ).catch(() => {
        console.log('!!')
        return true
      })
    })

    eventEmitter.on('first_step', async function() {
      await bot.editMessageText(
        firstMessage.text,
        {
          message_id: firstMessage.message_id,
          chat_id: chatID,
          ...qweryOptions
        }
      ).catch(() => {
        console.log('!')
        return true
      })
    })

    for (let i = 0; i < MODS_CHAT.length; i++) {
      eventEmitter.on(MODS_CHAT[i].callback_data, async function() {
        await db.subscriber.update(
          { modeGPT: MODS_CHAT[i].callback_data },
          { where: { chat_id: chatID } }
        ).then(res => {
          console.log(MODS_CHAT[i].text)
          bot.deleteMessage(chatID, firstMessage.message_id).catch(err => console.error(err))
          firstMessage = modeChatGPT(bot, msg, {
            message_id: firstMessage.message_id,
            chat_id: chatID
          })
        }).catch(err => console.error(err))
      })
    }

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data)
      bot.answerCallbackQuery(callbackQuery.id, 'on_message_text_default', false)
    })

    // TODO: Показывать сообщение только один раз, когда человек вводит первое сообщение при выбранном моде chat
    // await infoMessageWithChatGPT(bot, chatID)
    firstMessage = await modeChatGPT(bot, msg, qweryOptions).catch(err => console.error(err))
  } catch
    (error) {
    if (error instanceof Error) {
      return await bot.sendMessage(
        chatID,
        error.message,
        optionsGeneral
      )
    }
  }
}