import { saveAndSendPhoto } from '../../utils/saveAndSendPhoto.js'
import { sudoChecker } from '../../utils/sudoChecker.js'
import { spinnerOn } from '../../utils/spinner.js'
import dotenv from 'dotenv'
import { TYPE_RESPONSE_MJ } from '../../constants/index.js'
import { loaderOn } from '../../utils/loader.js'
import { OpenAI } from '../../utils/openAi.js'

dotenv.config()

export const modeDalle = async (bot, sudoUser, msg, match) => {
  let userMessageId
  let prompt

  userMessageId = msg.message_id
  prompt = msg.text ? msg.text.replace(match[0], '').trim() : msg.sticker.emoji
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
  let waiting = await loaderOn(0, bot, chatID, null, 1)

  // var eventEmitter = new events.EventEmitter()
  //
  // eventEmitter.on(`REGENERATE_${chatID}_${msg.message_id}`, function(query) {
  //   eventEmitter.removeAllListeners()
  //   console.log('qyery', qyery)
  //   // bot.deleteMessage(chatID, )
  //   return modeDalle(bot, sudoUser, msg, match)
  // })

  // bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  //   eventEmitter.emit(callbackQuery.data, callbackQuery)
  //   // eventEmitter.removeAllListeners()
  //   bot.answerCallbackQuery(callbackQuery.id, 'modes/dall-e', false)
  // })

  try {

    const openAi = new OpenAI()

    const response = await openAi.image(prompt)

    const imgUrl = response
    const imgDir = './Dall-e'
    const filePath = `${imgDir}/${userMessageId}.png`

    // const options = {
    //   reply_markup: JSON.stringify({
    //     inline_keyboard: [
    //       [{ text: '🔁 Regenerate', callback_data: `REGENERATE_${chatID}_${msg.message_id}` }]
    //     ]
    //   })
    // }

    await loaderOn('42%', bot, chatID, waiting?.message_id, 1)

    await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, bot, options, TYPE_RESPONSE_MJ.PHOTO, spinner,
      waiting)
  } catch (error) {
    await bot.sendMessage(chatID, `${error}`)
  }
}

// 20 апреля 135/200