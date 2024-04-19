import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'
// Import command
import { startBot } from './bot/commands/start.js'
import { addSudoer } from './bot/commands/admin/addSudoer.js'
import { removeSudoer } from './bot/commands/admin/removeSudoer.js'
import { listSudoers } from './bot/commands/admin/listSudoers.js'
import { onMessageVoice } from './bot/commands/onMessageVoice.js'
import { getId } from './bot/commands/admin/getId.js'

import { db } from './bot/db/index.js'

import authRoutes from './api/routes/auth.routes.js'
import userRoutes from './api/routes/user.routes.js'
import subsRoutes from './api/routes/subs.routes.js'
import {
  COMMAND_ACCOUNT,
  COMMAND_DALL_E,
  COMMAND_GPT,
  COMMAND_HELP,
  COMMAND_MIDJOURNEY,
  COMMAND_QUIZ,
  COMMAND_SPEECH_TO_TEXT
} from './bot/constants/index.js'
import { keyboardChatGPT } from './bot/commands/keyboard/chat_gpt.js'
import { keyboardMyAccount } from './bot/commands/keyboard/my_account.js'
import { keyboardHelp } from './bot/commands/keyboard/help.js'
import { keyboardMidjourney } from './bot/commands/keyboard/midjourney.js'
import { isModeMidjourney } from './bot/utils/getMode.js'
import { keyboardQuiz } from './bot/commands/keyboard/quiz.js'
import { sendMessage } from './bot/commands/admin/sendMessage.js'
import { switchToMode } from './bot/utils/switchToChatMode.js'
import { keyboardDalle } from './bot/commands/keyboard/dalle.js'

dotenv.config()

import Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { exceptionForHistoryLogging } from './bot/utils/exceptionForHistoryLogging.js'
import { usePromoModel } from './bot/utils/promo/usePromoModel.js'
import { keyboardSpeechToText } from './bot/commands/keyboard/keyboardSpeechToText.js'
import { setQuizModeForSubs } from './bot/commands/admin/setQuizModeForSubs.js'

const { TELEGRAM_API_KEY, SUDO_USER, NODE_REST_PORT, REACT_ADMIN_PORT, PROTOCOL, CORS_HOST } = process.env
const sudoUser = parseInt(SUDO_USER, 10)

const bot = new TelegramBot(TELEGRAM_API_KEY, { polling: true })

bot.on('polling_error', console.log)

// Use command
startBot(bot)

bot.on('message', async (msg, match) => {
  // TODO: add msg.reply_to_message

  if (msg?.chat?.type === 'supergroup' || msg.voice)
    return true

  if (msg.text === 'X2PROMO') {
    await usePromoModel(bot, msg.text, msg.chat.id, msg.from)
    return true
  }

  if (msg.from.username !== 'aronbergman' && process.env.SERVER === 'DEVELOPMENT')
    bot.sendMessage(msg.chat.id, `🤖\n<i>привет ${msg.from.first_name}, этот бот работает не стабильно, он удобен для дебага и не доступен, если выключен ноутбук. Так-же запросы могут теряться из-за перезапуска приложения во время тестирования\n стабильная версия</i> @crayonAI_bot 🤟🏻`, { parse_mode: 'HTML' }).then(r => {
    })

  await db.history.create({
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    nickname: msg.chat.username,
    fullname: `${msg.from.first_name} ${msg.from.last_name}`,
    request: exceptionForHistoryLogging(msg.from.id, msg.text)
  }).catch(async () => {
    await db.history.create({
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      nickname: msg.chat.username,
      fullname: `${msg.from.first_name} ${msg.from.last_name}`,
      request: 'VERY_LONG_MESSAGE'
    })
  })

  switch (msg.text) {
    case COMMAND_ACCOUNT:
      switchToMode('GPT', msg.chat.id, msg.from)
      return keyboardMyAccount(bot, msg)
      break
    case COMMAND_GPT:
      return keyboardChatGPT(bot, msg)
      break
    case COMMAND_MIDJOURNEY:
      return keyboardMidjourney(bot, msg)
      break
    case COMMAND_SPEECH_TO_TEXT:
      return keyboardSpeechToText(bot, msg)
      break
    case COMMAND_DALL_E:
      return keyboardDalle(bot, msg)
      break
    case COMMAND_HELP:
      switchToMode('GPT', msg.chat.id, msg.from)
      return keyboardHelp(bot, msg)
      break
    case COMMAND_QUIZ:
      switchToMode('GPT', msg.chat.id, msg.from)
      return keyboardQuiz(bot, msg)
      break
    default:
      return isModeMidjourney(bot, msg, match, sudoUser)
  }
})

onMessageVoice(bot);

// Use admin command
// TODO: Разрешить эти команды только пользователям с ролью администратор
getId(bot)
sendMessage(bot)
setQuizModeForSubs(bot)
addSudoer(bot, sudoUser)
removeSudoer(bot, sudoUser)
listSudoers(bot, sudoUser)

const app = express()

if (process.env.SERVER !== 'DEVELOPMENT')
  Sentry.init({
    dsn: 'https://cd16320a573f069cdc9afe19e324c2cb@o392602.ingest.us.sentry.io/4507084187893760',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration()
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0
  })

if (process.env.SERVER !== 'DEVELOPMENT') {
  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
}

var corsOptions = {
  origin: `${PROTOCOL}://${CORS_HOST}:${REACT_ADMIN_PORT}`
}

app.use(cors(corsOptions))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.options('*', cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

authRoutes(app)
userRoutes(app)
subsRoutes(app)

// initial()
function initial() {
  db.role.create({
    id: 1,
    name: 'user'
  })

  db.role.create({
    id: 2,
    name: 'moderator'
  })

  db.role.create({
    id: 3,
    name: 'admin'
  })
}

if (process.env.SERVER !== 'DEVELOPMENT')
  app.use(Sentry.Handlers.errorHandler())

app.listen(NODE_REST_PORT, () => console.log(`🟡 REST API is listening on port ${NODE_REST_PORT}`))