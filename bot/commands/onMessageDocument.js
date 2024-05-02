import fs from 'fs'
import path from 'path'
import events from 'events'
import request from 'request'
import fetch from 'node-fetch'
import { loaderOn } from '../utils/loader.js'
import { spinnerOn } from '../utils/spinner.js'
import { Converter } from '../utils/converter.js'
import { formats, formatsConvertor } from '../constants/formatsConterter.js'
import { stepperOn } from '../utils/stepper.js'
import { sleep } from '../utils/sleep.js'

// TODO: теряется оригинальное имя файла
// TODO: сделать имя файла как message_id а не file_27
// TODO: опталедять тип файла от типа в meta telegram

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
  // keys.push({ text: `-${current}-`, callback_data: current.toString() })
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
  // const formats = await converter.getSupportedConversionTypes()
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

  let result = typesForConverter.targetFormats.filter((arr) => formatsConvertor.includes(arr))

  await bot.sendMessage(msg.chat.id, 'Выберите формат, в который вы бы хотели конвертировать файл', {
    ...getPagination(1, result, msg.chat.id)
  }).then(() => bot.deleteMessage(msg.chat.id, spinner).catch())
    .catch(() => bot.deleteMessage(msg.chat.id, spinner).catch())

  const eventEmitter = new events.EventEmitter()

  for (let i = 0; result.length > i; i++) {
    eventEmitter.on(`${result[i]}-${msg.from.id}`, async function(msg) {
      if (msg.data.includes(msg.from.id)) {
        await bot.deleteMessage(msg.from.id, msg.message.message_id).catch((error) => console.log('error dm', error))
        const waiting = await stepperOn(bot, msg.from.id, 0)
        const resFile = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getFile?file_id=${fileId}`)
        const res2 = await resFile.json()
        const filePath = res2.result.file_path
        const fileName = filePath.split('/')[1]
        const downloadURL = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${filePath}`
        download(downloadURL, path.join('conversions', fileName), async () => {
          console.log('🟩Done!', msg)
          bot.sendMessage(process.env.NOTIF_GROUP, `⚙️ ${msg.from.first_name} converts file from ${type} to ${msg.data.split('-')[0]}`).catch()
          await stepperOn(bot, msg.from.id, 1, waiting)
          await converter.getUpload(`conversions/${fileName}`)
            .then(async res => {
              await stepperOn(bot, msg.from.id, 2, waiting)
              await sleep(3000)
              const newFile = await converter.getConverter(
                `conversions/${fileName}`,
                msg.data.split('-')[0], // формат в который производим конвертацию
                bot,
                msg
              )

              if (newFile) {
                await stepperOn(bot, msg.from.id, 3, waiting)
                await converter.getDownload(newFile[0].path, newFile[0].name, msg.from.id, bot, waiting?.message_id)
              }
            })
        })

        return true
      }
    })
  }

  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    eventEmitter.emit(callbackQuery.data, callbackQuery)
    bot.answerCallbackQuery(callbackQuery.id, 'on_message_document', false)

    if (!callbackQuery.data.includes(msg.from.id)) {
      const editOptions = Object.assign({}, getPagination(parseInt(callbackQuery.data), result, msg.from.id), {
        chat_id: msg.from.id,
        message_id: callbackQuery.message.message_id
      })
      bot.editMessageText('Выберите формат, в который вы бы хотели конвертировать файл', editOptions)
    }
  })

  // await bot.deleteMessage(msg.chat.id, waiting)
  return true
}