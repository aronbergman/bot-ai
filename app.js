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

import api from './api/routes/auth.routes.js'

import api0 from './api/routes/user.routes.js'
import { COMMAND_ACCOUNT, COMMAND_GPT, COMMAND_HELP, COMMAND_MIDJOURNEY, COMMAND_QUIZ } from './bot/constants/index.js'
import { keyboardChatGPT } from './bot/commands/keyboard/chat_gpt.js'
import { keyboardMyAccount } from './bot/commands/keyboard/my_account.js'
import { keyboardHelp } from './bot/commands/keyboard/help.js'
import { keyboardMidjourney } from './bot/commands/keyboard/midjourney.js'
import { isModeMidjourney } from './bot/utils/getMode.js'
import { keyboardQuiz } from './bot/commands/keyboard/quiz.js'
import { sendMessage } from './bot/commands/admin/sendMessage.js'

dotenv.config()

const { TELEGRAM_API_KEY, DEV_TG_BOT_TOKEN, SUDO_USER, NODE_REST_PORT, REACT_ADMIN_PORT } = process.env
const sudoUser = parseInt(SUDO_USER, 10)

const bot = new TelegramBot(DEV_TG_BOT_TOKEN, { polling: true })

bot.on('polling_error', console.log)

// Use command
startBot(bot)

bot.on('message', (msg, match) => {
  console.log('msg.text', msg.text)

  switch (msg.text) {
    case COMMAND_ACCOUNT:
      return keyboardMyAccount(bot, msg)
      break
    case COMMAND_GPT:
      return keyboardChatGPT(bot, msg)
      break
    case COMMAND_MIDJOURNEY:
      return keyboardMidjourney(bot, msg)
      break
    case COMMAND_HELP:
      return keyboardHelp(bot, msg)
      break
    case COMMAND_QUIZ:
      return keyboardQuiz(bot, msg)
      break
    default:
      return isModeMidjourney(bot, msg, match, sudoUser)
  }
})

// textToSpeach(bot)
// onMessageVoice(bot);

// Use admin command
getId(bot)
sendMessage(bot)
addSudoer(bot, sudoUser)
removeSudoer(bot, sudoUser)
listSudoers(bot, sudoUser)

const app = express()

var corsOptions = {
  origin: `http://localhost:${REACT_ADMIN_PORT}`
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

api(app)
api0(app)

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