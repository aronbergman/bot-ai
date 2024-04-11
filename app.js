import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'
// Import command
import { startBot } from './bot/commands/start.js'
import { addSudoer } from './bot/commands/admin/addSudoer.js'
import { removeSudoer } from './bot/commands/admin/removeSudoer.js'
import { listSudoers } from './bot/commands/admin/listSudoers.js'
import { onMessageVoice } from './bot/commands/_refact/onMessageVoice.js'
import { textToSpeach } from './bot/commands/_refact/textToSpeach.js'
import { getId } from './bot/commands/admin/getId.js'

import { db } from './bot/db/index.js'

import authRoutes from './api/routes/auth.routes.js'
import userRoutes from './api/routes/user.routes.js'
import subsRoutes from './api/routes/subs.routes.js'
import { COMMAND_ACCOUNT, COMMAND_GPT, COMMAND_HELP, COMMAND_MIDJOURNEY, COMMAND_QUIZ } from './bot/constants/index.js'
import { keyboardChatGPT } from './bot/commands/keyboard/chat_gpt.js'
import { keyboardMyAccount } from './bot/commands/keyboard/my_account.js'
import { keyboardHelp } from './bot/commands/keyboard/help.js'
import { keyboardMidjourney } from './bot/commands/keyboard/midjourney.js'
import { isModeMidjourney } from './bot/utils/getMode.js'
import { keyboardQuiz } from './bot/commands/keyboard/quiz.js'
import { sendMessage } from './bot/commands/admin/sendMessage.js'
import { switchToMode } from './bot/utils/switchToChatMode.js'

dotenv.config()

const { TELEGRAM_API_KEY, SUDO_USER, NODE_REST_PORT, REACT_ADMIN_PORT, PROTOCOL, CORS_HOST } = process.env
const sudoUser = parseInt(SUDO_USER, 10)

const bot = new TelegramBot(TELEGRAM_API_KEY, { polling: true })

bot.on('polling_error', console.log)

// Use command
startBot(bot)

bot.on('message', (msg, match) => {

  if (msg.reply_to_message) {
    return db.helper.create({
      count: msg.reply_to_message.text,
      comment: msg.text,
    })
  }

  if (msg.from.username !== 'aronbergman')
    bot.sendMessage(msg.chat.id, `🤖\n<i>привет ${msg.from.first_name}, этот бот работает не стабильно, он удобен для дебага и не доступен, если выключен ноутбук. Так-же запросы могут теряться из-за перезапуска приложения во время тестирования\n стабильная версия</i> @crayonAI_bot 🤟🏻`, {parse_mode: 'HTML'})

  db.history.create({
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    nickname: msg.chat.username,
    fullname: `${msg.from.first_name} ${msg.from.last_name}`,
    request: msg.text
  })
  switch (msg.text) {
    case COMMAND_ACCOUNT:
      switchToMode('CHAT', msg.chat.id, msg.from)
      return keyboardMyAccount(bot, msg)
      break
    case COMMAND_GPT:
      return keyboardChatGPT(bot, msg)
      break
    case COMMAND_MIDJOURNEY:
      return keyboardMidjourney(bot, msg)
      break
    case COMMAND_HELP:
      switchToMode('CHAT', msg.chat.id, msg.from)
      return keyboardHelp(bot, msg)
      break
    case COMMAND_QUIZ:
      switchToMode('CHAT', msg.chat.id, msg.from)
      return keyboardQuiz(bot, msg)
      break
    default:
      return isModeMidjourney(bot, msg, match, sudoUser)
  }
})

// textToSpeach(bot)
// onMessageVoice(bot);

// Use admin command
// TODO: Разрешить эти команды только пользователям с ролью администратор
getId(bot)
sendMessage(bot)
addSudoer(bot, sudoUser)
removeSudoer(bot, sudoUser)
listSudoers(bot, sudoUser)

const app = express()

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

app.listen(NODE_REST_PORT, () => console.log(`🟡 REST API is listening on port ${NODE_REST_PORT}`))