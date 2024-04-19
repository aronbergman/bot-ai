import axios from 'axios'
import fs from 'fs'
import { TYPE_RESPONSE_MJ } from '../constants/index.js'
import { spinnerOff } from './spinner.js'
import { createProgress } from './loader.js'

export const saveAndSendPhoto = async (
  imgUrl,
  imgDir,
  filePath,
  chatID,
  bot,
  options,
  typeResponse,
  spinner,
  loadingMessage
) => {
  try {
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir)
    }
    await axios
      .get(imgUrl, { responseType: 'arraybuffer' })
      .then(response => {
        fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'))
        const stream = fs.createReadStream(filePath)
        if (typeResponse === TYPE_RESPONSE_MJ.PHOTO)
          bot.sendPhoto(chatID, stream, options || {}).then(async () => {
            await spinnerOff(bot, chatID, spinner).then(() => {
              return bot.deleteMessage(chatID, loadingMessage?.message_id)
            })
          })
        else if (typeResponse === TYPE_RESPONSE_MJ.DOCUMENT) {
          bot.sendPhoto(chatID, stream, options || {}).then(async () => {
            await bot.sendDocument(chatID, stream, options || {}).then(async () => {
              await spinnerOff(bot, chatID, spinner).then(() => {
                return bot.deleteMessage(chatID, loadingMessage.message_id)
              })
            })
          })
        }
      })
      .catch(error => {
        console.error(error)
      })
  } catch (error) {
    console.log(error)
  }
}

export const saveAndSendPreloaderPhoto = async (
  imgUrl,
  chatID,
  bot,
  prev,
  progress
) => {
  const imgDir = './loading_upscales'
  const filePath = `${imgDir}/${imgUrl.substr(-7)}.png`
  let photo
  try {
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir)
    }
    await axios
      .get(imgUrl, { responseType: 'arraybuffer' })
      .then(async response => {
        fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'))
        const stream = fs.createReadStream(filePath)
        await bot.deleteMessage(chatID, prev)
        photo = await bot.sendPhoto(chatID, stream, {
          caption: createProgress(progress?.replace('%', ''), 0)
        })
      })
      .catch(error => {
        console.error(error)
      })
    return photo
  } catch (error) {
    console.log(error)
  }
}