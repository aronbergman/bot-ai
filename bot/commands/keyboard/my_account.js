import { INITIAL_SESSION, TARIFS } from '../../constants/index.js'
import { db } from '../../db/index.js'
import * as events from 'events'

export const keyboardMyAccount = async (bot, msg) => {
  try {
    let accountMessage
    const { id: chatId } = msg.chat
    const msgId = msg.message_id
    const { id } = msg.from
    // TODO: рефакторинг в отдельный файл
    const generalOptions = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId,
      disable_web_page_preview: true
    }
    // TODO: рефакторинг в отдельный файл
    const firstLevel = {
      message: `
💬 Доступно запросов для ChatGPT: 2
🌅 Доступных запросов для Midjourney: 0

Зачем нужны запросы?

Генерируя изображения с помощью искусственного интеллекта Midjourney вы тратите по 1 запросу на 1 изображение.


Зачем запросы ChatGPT?

Задавая вопросы - ты тратишь 1 запрос. Бесплатно можно тратить 5 запросов каждый день. Запросы восстанавливаются каждый день в 06:00

Не хватает запросов ChatGPT и Midjourney?

- Вы можете купить подписку для ChatGPT или запросы для Midjourney и не париться о лимитах.
- Пригласи человека и получи за него 3 запроса ChatGPT и 1 запрос на генерацию изображения.

Как правильно общаться с ChatGPT – https://telegra.ph/Gajd-Kak-sostavit-horoshij-zapros-v-ChatGPT-s-primerami-04-08-2

🔴 Создай своего ChatGPT и Midjourney бота и заработай на этом - @FatherAiRobot
`,
      options: {
        ...generalOptions,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Купить подписку', callback_data: 'buy_subscription' }],
            [{ text: 'Получить бонус', callback_data: 'referral_program' }]
          ]
        }
      }
    }
    // TODO: рефакторинг в отдельный файл
    const buyLevel = {
      message: 'Выберите тарифный план, который хотите приобрести.',
      options: {
        ...generalOptions,
        reply_markup: {
          inline_keyboard: [
            [{ text: TARIFS[0].text, callback_data: TARIFS[0].callback_data }],
            [{ text: TARIFS[1].text, callback_data: TARIFS[1].callback_data }],
            [{ text: TARIFS[2].text, callback_data: TARIFS[2].callback_data }],
            [{ text: TARIFS[3].text, callback_data: TARIFS[3].callback_data }],
            [{ text: TARIFS[4].text, callback_data: TARIFS[4].callback_data }],
            [{ text: TARIFS[5].text, callback_data: TARIFS[5].callback_data }],
            [{ text: TARIFS[6].text, callback_data: TARIFS[6].callback_data }],
            [{ text: 'Вернуться в меню', callback_data: 'get_first_level' }]
          ]
        }
      }
    }
    // TODO: рефакторинг в отдельный файл
    // TODO: сделать реферальную программу
    const referralLevel = {
      message: '🤝 Зарабатывайте запросы с нашей реферальной системой\n' +
        '\n' +
        'С каждого приглашенного пользователя вы получаете: 3 запроса ChatGPT и 1 запрос Midjourney\n' +
        'Приглашено за все время вами человек: 0\n' +
        '\n' +
        'Ваша пригласительная ссылка: https://t.me/XXX?start=user-XXX',
      options: {
        ...generalOptions,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Вернуться в меню', callback_data: 'get_first_level' }]
          ]
        }
      }
    }

    msg['ctx'] = INITIAL_SESSION

    var eventEmitter = new events.EventEmitter()

    eventEmitter.on('referral_program', async function() {
      console.log('referral_program')
      await bot.editMessageText(
        'text',
        {
          message_id: accountMessage.message_id,
          chat_id: chatId
        }
      )
    })

    eventEmitter.on('buy_subscription', async function() {
      console.log('buy_subscription')
      await bot.editMessageText(
        buyLevel.message,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...buyLevel.options
        }
      )
    })

    eventEmitter.on('referral_program', async function() {
      await bot.editMessageText(
        referralLevel.message,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...referralLevel.options
        }
      )
    })

    eventEmitter.on('get_first_level', function() {
      console.log('buy_subscription', accountMessage.message_id)
      bot.editMessageText(
        firstLevel.message,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...firstLevel.options
        }
      )
    })

    for (let i = 0; i < TARIFS.length; i++) {
      eventEmitter.on(TARIFS[i].callback_data, function() {
        // TODO: Добавить ссылки на открытие оплаты
        console.log('💚 ', TARIFS[i].text)
      })
    }

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data)
      bot.answerCallbackQuery(callbackQuery.id, 'I\'m cold and I want to eat', false)
    })


    db.subscriber.findOne({
      where: {
        chat_id: chatId
      }
    }).then(async (res) => {
      if (!res)
        return
      let mode
      switch (res?.dataValues.mode) {
        case '/midjourney':
          mode = 'MidJourney'
          break
        case '/gpt':
          mode = 'ChatGPT'
          break
        default:
          mode = '.'
      }
      // TODO: Сделать подсчет колличества бесплатных запросов в сутки на бесплатном режиме
      accountMessage = await bot.sendMessage(
        chatId,
        firstLevel.message,
        firstLevel.options
      )
    })
  } catch (error) {
    await bot.sendMessage(chatId, `${error.message}`, generalOptions)
  }
}
