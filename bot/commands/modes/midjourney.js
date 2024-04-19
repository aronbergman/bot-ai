import { Midjourney } from 'freezer-midjourney-api'
import { saveAndSendPhoto, saveAndSendPreloaderPhoto } from '../../utils/saveAndSendPhoto.js'
import { sudoChecker } from '../../utils/sudoChecker.js'
import { db } from '../../db/index.js'
import { spinnerOn } from '../../utils/spinner.js'
import { loaderOn } from '../../utils/loader.js'
import { TYPE_RESPONSE_MJ } from '../../constants/index.js'

export const modeMidjourney = async (bot, sudoUser, msg, match) => {
  let userMessageId
  let prompt
  let client
  let Imagine
  let Variation

  userMessageId = msg.message_id
  prompt = msg.text?.replace(match[0], '').trim() ?? msg.sticker.emoji
  const { id: userId, username, first_name: firstname } = msg.from
  const { id: chatID } = msg.chat
  const options = {
    reply_to_message_id: userMessageId
  }
  // if (
  //   !(await sudoChecker(
  //     userId,
  //     username || firstname,
  //     sudoUser,
  //     bot,
  //     chatID,
  //     options
  //   ))
  // ) {
  //   return
  // }
  if (prompt.length === 0) {
    return bot.sendMessage(chatID, 'Prompt can\'t be empty', options)
  }

  let spinner = await spinnerOn(bot, chatID)
  let waiting = await loaderOn(0, bot, chatID)

  try {
    const { SERVER_ID, CHANNEL_ID, SALAI_TOKEN } = process.env
    client = new Midjourney({
      ServerId: SERVER_ID,
      ChannelId: CHANNEL_ID,
      SalaiToken: SALAI_TOKEN,
      // Debug: true,
      Ws: true
    })
    await client.init()

    Imagine = await client.Imagine(prompt, async (uri, progress) => {
      console.log(`Loading: ${uri}, progress: ${progress}`)
      waiting = await saveAndSendPreloaderPhoto(uri, chatID, bot, waiting?.message_id, progress)
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

    await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, bot, options, TYPE_RESPONSE_MJ.PHOTO, spinner, waiting)
  } catch (error) {
    await bot.sendMessage(chatID, `${error}`)
  }

  bot.on('callback_query', async query => {
    const { id: chat_id, title: chat_name } = query.message.chat
    const { message_id } = query.message
    const selectedLabel = query.data

    if (selectedLabel.includes('R')) {
      return modeMidjourney(bot, sudoUser, msg, match)
    }

    try {
      if (selectedLabel.includes('U')) {
    let spinner = await spinnerOn(bot, chatID)
    let waiting = await loaderOn(0, bot, chatID)

        const UCustomID = Imagine.options?.find(
          o => o.label === selectedLabel
        )?.custom

        const Upscale = await client.Custom({
          msgId: Imagine.id,
          flags: Imagine.flags,
          customId: UCustomID,
          loading: async (uri, progress) => {
            console.log(`Loading: ${uri}, progress: ${progress}`)
            waiting = await saveAndSendPreloaderPhoto(uri, chatID, bot, waiting.message_id, progress)
          }
        })

        const imgUrl = Upscale.uri
        const imgDir = './Upscales'
        const filePath = `${imgDir}/${message_id}.png`
        const options = {
          reply_to_message_id: userMessageId
        }

        await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, bot, options, TYPE_RESPONSE_MJ.DOCUMENT, spinner, waiting)
      } else if (selectedLabel.includes('V')) {

        // await bot.deleteMessage(chat_id, message_id)
    let spinner = await spinnerOn(bot, chatID)
    let waiting = await loaderOn(0, bot, chatID)
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
            waiting = await saveAndSendPreloaderPhoto(uri, chatID, bot, waiting?.message_id, progress)
          }
        })

        const options = {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                { text: '📸 1', callback_data: 'scale1' },
                { text: '📸 2', callback_data: 'scale2' },
                { text: '📸 3', callback_data: 'scale3' },
                { text: '📸 4', callback_data: 'scale4' }
              ],
              // [{ text: '🔁 Regenerate', callback_data: 'scaleR' }]
            ]
          })
        }

        const { id: user_id, username } = query.from
        await db.midjourney.create({
          query_id: query.id,
          message_id,
          chat_instance: query.chat_instance,
          chat_id,
          chat_name,
          user_id,
          username,
          prompt,
          data: selectedLabel
        })

        const imgUrl = Variation.uri
        const imgDir = './Variations'
        const filePath = `${imgDir}/${message_id}.png`

        await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, bot, options, TYPE_RESPONSE_MJ.PHOTO, spinner, waiting)

        bot.on('callback_query', async query_up => {
          const upscaleLabel = query_up.data
          let imgLabel

          if (upscaleLabel === 'scaleR') {
            await modeMidjourney(bot, sudoUser, msg, match)
            return true
          }

          let spinner = await spinnerOn(bot, chatID)
          let waiting = await loaderOn(0, bot, chatID)

          switch (upscaleLabel) {
            case 'scale1':
              imgLabel = 'U1'
              break
            case 'scale2':
              imgLabel = 'U2'
              break
            case 'scale3':
              imgLabel = 'U3'
              break
            case 'scale4':
              imgLabel = 'U4'
              break
            default:
              bot.sendMessage(chat_id, 'Invalid selection')
              break
          }

          const upscaleCustomID = Variation.options?.find(
            o => o.label === imgLabel
          )?.custom

          const variationUpscale = await client.Custom({
            msgId: Variation.id,
            flags: Variation.flags,
            customId: upscaleCustomID,
            loading: async (uri, progress) => {
              console.log(`Loading: ${uri}, progress: ${progress}`)
              waiting = await saveAndSendPreloaderPhoto(uri, chatID, bot, waiting.message_id, progress)
            }
          })

          console.log(variationUpscale)

          const imgUrl = variationUpscale.uri
          const imgDir = './VariationsUpscales'
          const filePath = `${imgDir}/${message_id}.png`
          const options = {
            reply_to_message_id: userMessageId
          }

          await saveAndSendPhoto(
            imgUrl,
            imgDir,
            filePath,
            chat_id,
            bot,
            options,
            TYPE_RESPONSE_MJ.DOCUMENT,
            spinner,
            waiting
          )

        })
      }
    } catch (error) {
      bot.sendMessage(chat_id, error, { reply_to_message_id: userMessageId })
    }
  })
}