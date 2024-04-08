import axios from 'axios'
import fs from 'fs'
import { TYPE_RESPONSE_MJ } from '../constants/index.js'
import { spinnerOff } from './spinner.js'

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
              return bot.deleteMessage(chatID, loadingMessage.message_id)
            })
          })
        else if (typeResponse === TYPE_RESPONSE_MJ.DOCUMENT)
          bot.sendDocument(chatID, stream, options || {}).then(async () => {
            await spinnerOff(bot, chatID, spinner).then(() => {
              return bot.deleteMessage(chatID, loadingMessage.message_id)
            })
          })
      })
      .catch(error => {
        console.error(error)
      })
  } catch (error) {
    console.log(error)
  }
}
