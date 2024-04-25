import { GetSupportedConversionTypesRequest, InfoApi } from 'groupdocs-conversion-cloud'

import { Converter } from '../../utils/converter.js'

export const keyboardConverter = async (bot, msg) => {
  let accountMessage = await bot.sendMessage(
    msg.chat.id,
    '💱',
    {
      parse_mode: 'HTML'
    }
  ).catch(err => console.log(err))

  // прислать сообщение с инструкцией
  // принять файл который пользователь хочет конвертитьвать
  // записать информацию о том, что файл загружен, какое у него имя, формат, в какой формат, статус
  // спросить в какой формат нужно конвертировать файл
  // показать прелоадер
  // вернуть фпйл исхода

  const converter = new Converter()
  const formats = await converter.getSupportedConversionTypes()

  console.log('formats', formats)

  const timeout = setTimeout((chatId, message_id) => {
    bot.editMessageText(
      `В этом режиме ты можешь конвертировать файлы. Просто пришли файл в чат и выбери формат для конвертации.\n\nПоддерживаемые форматы: ${formats.map((i) => i.sourceFormat).join(', ')}`
      , {
        chat_id: chatId,
        message_id: message_id,
        parse_mode: 'HTML'
      }).catch(() => {
      return true
    })
    clearTimeout(timeout)
  }, 0, msg.chat.id, accountMessage?.message_id)
}