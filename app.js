import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'
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
  COMMAND_ACCOUNT_EN,
  COMMAND_ACCOUNT_FR,
  COMMAND_ACCOUNT_RU,
  COMMAND_DALL_E,
  COMMAND_FILE_CONVERTOR_EN,
  COMMAND_FILE_CONVERTOR_FR,
  COMMAND_FILE_CONVERTOR_RU,
  COMMAND_GPT,
  COMMAND_HELP_EN,
  COMMAND_HELP_FR,
  COMMAND_HELP_RU,
  COMMAND_MIDJOURNEY,
  COMMAND_QUIZ_EN, COMMAND_QUIZ_FR, COMMAND_QUIZ_RU,
  COMMAND_TEXT_TO_SPEECH_EN,
  COMMAND_TEXT_TO_SPEECH_FR,
  COMMAND_TEXT_TO_SPEECH_RU,
  REQUEST_TYPES
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
import { setQuizModeForSubs } from './bot/commands/admin/setQuizModeForSubs.js'
import { midjourneyInfo } from './bot/commands/admin/midjourneyInfo.js'
import { keyboardTextToSpeech } from './bot/commands/keyboard/tts.js'
import { keyboardConverter } from './bot/commands/keyboard/converter.js'
import { createFullName } from './bot/utils/createFullName.js'
import { onMessageDocument } from './bot/commands/onMessageDocument.js'
import { ct } from './bot/utils/createTranslate.js'
import { checkTokens } from './bot/utils/checkTokens.js'
import { isTokensEmpty } from './bot/commands/keyboard/empty_tokens.js'

const { TELEGRAM_API_KEY, SUDO_USER, NODE_REST_PORT, REACT_ADMIN_PORT, PROTOCOL, CORS_HOST } = process.env
const sudoUser = parseInt(SUDO_USER, 10)

const bot = new TelegramBot(TELEGRAM_API_KEY, { polling: true })

bot.on('polling_error', console.log)

// Use command
startBot(bot)

bot.on('document', async (msg, match) => {
  const {tokensAvailable, price} = await checkTokens(REQUEST_TYPES.CONVERTOR, msg.chat.id)
  if (tokensAvailable <= price)
    return isTokensEmpty(bot, msg, tokensAvailable, price)
  return onMessageDocument(bot, msg)
})

bot.on('message', async (msg, match) => {
  const t = await ct(msg)
  // TODO: add msg.reply_to_message
  if (msg.document) {
    return true
  }

  if (msg?.chat?.type === 'supergroup' || msg.voice) {
    console.log('supergroup?', msg?.chat?.type, msg?.chat)
    return true
  }

  if (msg.text === 'X2PROMO') {
    await usePromoModel(bot, msg.text, msg.chat.id, msg.from)
    return true
  }

  if (msg.from.username !== 'aronbergman' && process.env.SERVER === 'DEVELOPMENT')
    bot.sendMessage(msg.chat.id, `🤖\n${t('msg:open-dev-bot', { name: msg.from.first_name })} @PaperClip_gptbot 🤟🏻`, { parse_mode: 'HTML' }).then(r => {
    })

  await db.history.create({
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    nickname: msg.chat.username,
    fullname: createFullName(msg.from),
    request: exceptionForHistoryLogging(msg.from.id, msg.text)
  }).catch(async () => {
    await db.history.create({
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      nickname: msg.chat.username,
      fullname: createFullName(msg.from),
      request: 'VERY_LONG_MESSAGE'
    })
  })

  switch (msg.text) {
    case COMMAND_ACCOUNT_RU:
    case COMMAND_ACCOUNT_FR:
    case COMMAND_ACCOUNT_EN:
      switchToMode('GPT', msg.chat.id, msg.from)
      return keyboardMyAccount(bot, msg)
    case COMMAND_GPT:
      return keyboardChatGPT(bot, msg)
    case COMMAND_FILE_CONVERTOR_FR:
    case COMMAND_FILE_CONVERTOR_EN:
    case COMMAND_FILE_CONVERTOR_RU:
      switchToMode('GPT', msg.chat.id, msg.from)
      return keyboardConverter(bot, msg)
    case COMMAND_MIDJOURNEY:
      return keyboardMidjourney(bot, msg)
    case COMMAND_TEXT_TO_SPEECH_EN:
    case COMMAND_TEXT_TO_SPEECH_RU:
    case COMMAND_TEXT_TO_SPEECH_FR:
      return keyboardTextToSpeech(bot, msg)
    case COMMAND_DALL_E:
      switchToMode('GPT', msg.chat.id, msg.from)
      return keyboardDalle(bot, msg)
      break
    case COMMAND_HELP_RU:
    case COMMAND_HELP_EN:
    case COMMAND_HELP_FR:
      switchToMode('GPT', msg.chat.id, msg.from)
      return keyboardHelp(bot, msg, t)
    case COMMAND_QUIZ_RU:
    case COMMAND_QUIZ_EN:
    case COMMAND_QUIZ_FR:
      switchToMode('GPT', msg.chat.id, msg.from)
      return keyboardQuiz(bot, msg, true)
    default:
      return isModeMidjourney(bot, msg, match, sudoUser, t)
  }
})

onMessageVoice(bot)

// Use admin command
getId(bot)
sendMessage(bot)
midjourneyInfo(bot)
setQuizModeForSubs(bot)
addSudoer(bot, sudoUser) // TODO: Удалить этот метод и таблицу
removeSudoer(bot, sudoUser) // TODO: Удалить этот метод и таблицу
listSudoers(bot, sudoUser) // TODO: Удалить этот метод и таблицу

const app = express()

Sentry.init({
  dsn: 'https://cd16320a573f069cdc9afe19e324c2cb@o392602.ingest.us.sentry.io/4507084187893760',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    nodeProfilingIntegration()
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0
})

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())
Sentry.setTag('build', process.env.SERVER)

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

app.use(Sentry.Handlers.errorHandler())
app.listen(NODE_REST_PORT, () => console.log(`🟡 REST API is listening on port ${NODE_REST_PORT}`))