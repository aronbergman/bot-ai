import request from 'request'
import path from 'path'
import fetch from 'node-fetch'
import { spinnerOn } from '../utils/spinner.js'
import { Converter } from '../utils/converter.js'
import fs from 'fs'
import { formatsConterter } from '../constants/formatsConterter.js'
import { loaderOn } from '../utils/loader.js'
import { errorMessage } from './hoc/errorMessage.js'

// TODO: теряется оригинальное имя файла
// TODO: сделать имя файла как message_id а не file_27
// TODO: опталедять тип файла от типа в meta telegram

var bookPages = 100

function getPagination(current, formatsArray, msgID) {
  var formats = []
  const formatPages = []

  for (let i = 0; formatsArray.length >= i; i = i + 4) {
    let level = []
    if (formatsArray[i])
      level.push({ text: formatsArray[i], callback_data: `${formatsArray[i]}-${msgID}` })
    if (formatsArray[i + 1])
      level.push({ text: formatsArray[i + 1], callback_data: `${formatsArray[i + 1]}-${msgID}` })
    if (formatsArray[i + 2])
      level.push({ text: formatsArray[i + 2], callback_data: `${formatsArray[i + 2]}-${msgID}` })
    if (formatsArray[i + 3])
      level.push({ text: formatsArray[i + 3], callback_data: `${formatsArray[i + 3]}-${msgID}` })
    formats.push(level)
  }

  for (let i = 0; formats.length >= i; i = i + 4) {
    if (formats[i])
      formatPages.push([formats[i], formats[i + 1], formats[i + 2], formats[i + 3]])
  }

  const keys = []
  if (current > 1) keys.push({ text: `«1`, callback_data: '1' })
  if (current > 2) keys.push({ text: `‹${current - 1}`, callback_data: (current - 1).toString() })
  keys.push({ text: `-${current}-`, callback_data: current.toString() })
  if (current < formatPages.length - 1) keys.push({ text: `${current + 1}›`, callback_data: (current + 1).toString() })
  if (current < formatPages.length) keys.push({
    text: `${formatPages.length}»`,
    callback_data: formatPages.length.toString()
  })

  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [...formatPages[current - 1], keys]
    })
  }
}

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback)
  })
}

export const onMessageDocument = async (bot, msg) => {
  const converter = new Converter()
  const formats = await converter.getSupportedConversionTypes()
  // включить лоадер
  let spinner = await spinnerOn(bot, msg.chat.id, null, 'document')
  // сохранить файл на мой сервер
  const fileId = msg.document.file_id
  const fileType = msg.document['file_name'].split('.')
  const type = fileType[fileType.length - 1]
  console.log('type', type)
  let typesForConverter = formats.find(i => i.sourceFormat === type)

  if (!typesForConverter) {
    await bot.deleteMessage(msg.chat.id, spinner)
    await bot.sendMessage(msg.chat.id, 'Данный формат файла не поддерживается')
    return true
  }

  // const x = typesForConverter.targetFormats.filter(i => formatsConterter.filter(x => i === x ? x : null))
  let result = typesForConverter.targetFormats.filter((arr) => formatsConterter.includes(arr))

  const pagination = await bot.sendMessage(msg.chat.id, 'Выберите формат, в который вы бы хотели конвертировать файл', {
    ...getPagination(1, result, msg.chat.id)
  }).then(() => bot.deleteMessage(msg.chat.id, spinner).catch())
    .catch(() => bot.deleteMessage(msg.chat.id, spinner).catch())

  bot.on('callback_query', async function(message) {
    console.log('message', message)
    var msg = message.message

    if (message.data.includes(msg.chat.id)) {
      await bot.deleteMessage(msg.chat.id, message.message.message_id).catch()
      const waiting = await loaderOn(0, bot, msg.chat.id)
      const resFile = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getFile?file_id=${fileId}`)
      const res2 = await resFile.json()
      const filePath = res2.result.file_path
      const fileName = filePath.split('/')[1]
      const downloadURL = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${filePath}`
      download(downloadURL, path.join('conversions', fileName), () => {
        console.log('🟩Done!')
        bot.sendMessage(process.env.NOTIF_GROUP, `🔧 ${mst.from.first_name} ${type} to ${message.data.split('-')[0]}`).catch()
        loaderOn('12%', bot, msg.chat.id, waiting?.message_id)
        // отправить файл на сервер сервиса

        converter.getUpload(`conversions/${fileName}`).then(res => {
          loaderOn('37%', bot, msg.chat.id, waiting?.message_id)
          // начать процедуру конфертации
          converter.getConverter(
            `conversions/${fileName}`,
            message.data.split('-')[0] // формат в который производим конвертацию
          ).then(res => {
            console.log('RES', res)
            loaderOn('64%', bot, msg.chat.id, waiting?.message_id)
            if (res.length) {
              // скачать файл с их сервера после конвертации и отправить файл в чат после конвертации
              converter.getDownload(res[0].path, res[0].name, msg.chat.id, bot, waiting?.message_id)
              // удалить все файлы на первом и втором этапах с сервера
            } else {
              errorMessage(bot, 'херовая длинна массива', msg, converter.getDownload, "converter.getConverter")
            }
          })
        })
      })

      return true
    }

    var editOptions = Object.assign({}, getPagination(parseInt(message.data), result, msg.chat.id), {
      chat_id: msg.chat.id,
      message_id: msg.message_id
    })
    await bot.editMessageText(msg.text, editOptions)
  })

  // await bot.deleteMessage(msg.chat.id, waiting)
  return true
}