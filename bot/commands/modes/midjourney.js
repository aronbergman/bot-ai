import { Midjourney } from 'freezer-midjourney-api'
import { saveAndSendPhoto } from '../../utils/saveAndSendPhoto.js'
import { db } from '../../db/index.js'
import { sudoChecker } from '../../utils/sudoChecker.js'
import { spinnerOn } from '../../utils/spinner.js'
import dotenv from 'dotenv'
import { TYPE_RESPONSE_MJ } from '../../constants/index.js'
import events from 'events'
import { loaderOn } from '../../utils/loader.js'
// таблица пользователей.
//   кол-во пользователей , как часто он заходит (сколько было запросов по каждой AIб история запросов, история начисления баллов),
// таблица где видна история покупок
dotenv.config()

export const modeMidjourney = async (bot, sudoUser, msg, match) => {
  let userMessageId
  let prompt
  let client
  let Imagine
  let Variation

  userMessageId = msg.message_id
  prompt = msg.text.replace(match[0], '').trim()
  const { id: userId, username, first_name: firstname } = msg.from
  const { id: chatID } = msg.chat
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: userMessageId
  }
  if (
    !(await sudoChecker(
      userId,
      username || firstname,
      sudoUser,
      bot,
      chatID,
      options
    ))
  ) {
    return
  }
  if (prompt.length === 0) {
    return bot.sendMessage(chatID, 'Prompt can\'t be empty', options)
  }

  let spinner = await spinnerOn(bot, chatID)
  let waiting = await loaderOn(3, bot, chatID)

  try {
    const { SERVER_ID, CHANNEL_ID, SALAI_TOKEN } = process.env
    client = new Midjourney({
      ServerId: SERVER_ID,
      ChannelId: CHANNEL_ID,
      SalaiToken: SALAI_TOKEN,
      Debug: true,
      Ws: true
    })
    await client.init()

    Imagine = await client.Imagine(prompt, async (uri, progress) => {
      console.log(`Loading: ${uri}, progress: ${progress}`)
      await loaderOn(progress, bot, chatID, waiting?.message_id)
    })

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            { text: '📸 1', callback_data: 'U1' },
            { text: '📸 2', callback_data: 'U2' },
            { text: '📸 3', callback_data: 'U3' },
            { text: '📸 4', callback_data: 'U4' }
          ],
          [
            { text: '♻️ 1', callback_data: 'V1' },
            { text: '♻️ 2', callback_data: 'V2' },
            { text: '♻️ 3', callback_data: 'V3' },
            { text: '♻️ 4', callback_data: 'V4' }
          ],
          [{ text: '🔁 Regenerate', callback_data: 'R' }]
        ]
      })
    }
    const imgUrl = Imagine.uri
    const imgDir = './Imagines'
    const filePath = `${imgDir}/${userMessageId}.png`

    await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, bot, options, TYPE_RESPONSE_MJ.PHOTO, spinner,
      waiting)
  } catch (error) {
    await bot.sendMessage(chatID, `${error}`)
  }

  var eventEmitter = new events.EventEmitter()

  const forU = async (query) => {
    const { id: chat_id, title: chat_name } = query.message.chat
    const { message_id } = query.message
    const selectedLabel = query.data
    let waiting
    let spinner
    try {
      spinner = await spinnerOn(bot, chatID)
      waiting = await loaderOn(3, bot, chat_id)
      const UCustomID = Imagine.options?.find(
        o => o.label === selectedLabel
      )?.custom
      const Upscale = await client.Custom({
        msgId: Imagine.id,
        flags: Imagine.flags,
        customId: UCustomID,
        loading: async (uri, progress) => {
          console.log(`Loading: ${uri}, progress: ${progress}`)
          await loaderOn(progress, bot, chatID, waiting?.message_id)
        }
      })

      const imgUrl = Upscale.uri
      const imgDir = './Upscales'
      const filePath = `${imgDir}/${message_id}.png`
      const options = {
        reply_to_message_id: userMessageId
      }
      await saveAndSendPhoto(imgUrl, imgDir, filePath, chat_id, bot, options, TYPE_RESPONSE_MJ.DOCUMENT, spinner,
        waiting)
    } catch (error) {
      await bot.sendMessage(chat_id, error, { reply_to_message_id: userMessageId })
    }
  }

  const forV = async (query) => {
    const { id: chat_id, title: chat_name } = query.message.chat
    const { message_id } = query.message
    const selectedLabel = query.data
    let loadingMessage
    let spinner
    let waiting
    try {
      spinner = await spinnerOn(bot, chatID)
      waiting = await loaderOn(3, bot, chat_id)
      const VCustomID = Imagine.options?.find(
        o => o.label === selectedLabel
      )?.custom

      Variation = await client.Custom({
        msgId: Imagine.id,
        flags: Imagine.flags,
        customId: VCustomID,
        content: prompt,
        loading: async (uri, progress) => {
          console.log(`Loading: ${uri}, progress: ${progress}`)
          await loaderOn(progress, bot, chatID, waiting?.message_id)
        }
      })

      const options = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              { text: '📸 1', callback_data: 'U1' },
              { text: '📸 2', callback_data: 'U2' },
              { text: '📸 3', callback_data: 'U3' },
              { text: '📸 4', callback_data: 'U4' }
            ],
            [
              { text: '♻️ 1', callback_data: 'V1' },
              { text: '♻️ 2', callback_data: 'V2' },
              { text: '♻️ 3', callback_data: 'V3' },
              { text: '♻️ 4', callback_data: 'V4' }
            ],
            [{ text: '🔁 Regenerate', callback_data: 'V1' }]
          ]
        })
      }

      const { id: user_id, username } = query.from
      db.midjourney.create({
        query_id: query.id,
        message_id,
        chat_instance: query.chat_instance,
        chat_id,
        chat_name,
        user_id,
        username,
        prompt,
        data: selectedLabel
      }).then(res => {
        console.log('🔵 sequelize.midjourney.create ')
      })

      const imgUrl = Variation.uri
      const imgDir = './Variations'
      const filePath = `${imgDir}/${message_id}.png`

      await saveAndSendPhoto(
        imgUrl,
        imgDir,
        filePath,
        chat_id,
        bot,
        options,
        TYPE_RESPONSE_MJ.PHOTO,
        spinner,
        waiting
      )

    } catch (error) {
      await bot.sendMessage(chat_id, error, { reply_to_message_id: userMessageId })
    }
  }

  for (let i = 1; i < 5; i++) {
    eventEmitter.on(`U${i}`, function(query) {
      forU(query)
    })
  }

  for (let i = 1; i < 5; i++) {
    eventEmitter.on(`V${i}`, function(query) {
      forV(query)
    })
  }

  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    eventEmitter.emit(callbackQuery.data, callbackQuery)
    // eventEmitter.removeAllListeners()
    bot.answerCallbackQuery(callbackQuery.id, 'modes/midjourney', false)
  })
}

// 20 апреля 135/200