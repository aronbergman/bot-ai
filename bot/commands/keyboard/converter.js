import { GetSupportedConversionTypesRequest, InfoApi } from 'groupdocs-conversion-cloud'

import { Converter } from '../../utils/converter.js'

export const keyboardConverter = async (bot, msg) => {
  // прислать сообщение с инструкцией
  // принять файл который пользователь хочет конвертитьвать
  // записать информацию о том, что файл загружен, какое у него имя, формат, в какой формат, статус
  // спросить в какой формат нужно конвертировать файл
  // показать прелоадер
  // вернуть фпйл исхода

  const converter = new Converter()
  const formats = await converter.getSupportedConversionTypes()

  await bot.sendMessage(msg.chat.id, `
  В этом режиме ты можешь конвертировать файлы. Просто пришли файл в чат и выбери формат для конвертации.\n\nПоддерживаемые форматы: ${formats.map((i) => i.sourceFormat).join(', ')}`)
    .catch((error) => {
      console.log('Error: ' + error.message)
    })

}