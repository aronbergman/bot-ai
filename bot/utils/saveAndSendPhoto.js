import axios from 'axios'
import fs from 'fs'
import { TYPE_RESPONSE_MJ } from '../constants/index.js'

export const saveAndSendPhoto = async (
  imgUrl,
  imgDir,
  filePath,
  chatID,
  bot,
  options,
  typeResponse
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
        if (typeResponse = TYPE_RESPONSE_MJ.PHOTO)
          bot.sendPhoto(chatID, stream, options || {})
        else if (typeResponse = TYPE_RESPONSE_MJ.DOCUMENT)
          bot.sendDocument(chatID, stream, options || {})
      })
      .catch(error => {
        console.error(error)
      })
  } catch (error) {
    console.log(error)
  }
}
