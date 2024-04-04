import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'
// Import command
import { startBot } from './bot/commands/start.js'
import { addSudoer } from './bot/commands/admin/addSudoer.js'
import { removeSudoer } from './bot/commands/admin/removeSudoer.js'
import { listSudoers } from './bot/commands/admin/listSudoers.js'
import { onMessageText } from './bot/commands/onMessageText.js'
import { onMessageVoice } from './bot/commands/onMessageVoice.js'
import { textToSpeach } from './bot/commands/textToSpeach.js'
import { getId } from './bot/commands/admin/getId.js'
import { changeMode } from './bot/commands/changeMode.js'
import { getInfo } from './bot/commands/account.js'

import { db } from './bot/db/index.js'

import api from './api/routes/auth.routes.js'

import api0 from './api/routes/user.routes.js'

dotenv.config()

const { TG_BOT_TOKEN, SUDO_USER, NODE_REST_PORT, REACT_ADMIN_PORT } = process.env
const sudoUser = parseInt(SUDO_USER, 10)

const bot = new TelegramBot(TG_BOT_TOKEN, { polling: true })

// Use command
startBot(bot)
changeMode(bot)
getId(bot)
getInfo(bot)
textToSpeach(bot)
// midjourneyCallbackQuery(bot);
addSudoer(bot, sudoUser)
removeSudoer(bot, sudoUser)
listSudoers(bot, sudoUser)
onMessageText(bot, sudoUser)
// onMessageVoice(bot);

const app = express();

var corsOptions = {
  origin: `http://localhost:${REACT_ADMIN_PORT}`
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

api(app);
api0(app);

// initial()
function initial() {
  db.role.create({
    id: 1,
    name: "user"
  });

  db.role.create({
    id: 2,
    name: "moderator"
  });

  db.role.create({
    id: 3,
    name: "admin"
  });
}

app.post('/auth/login', (req, res) => {
  console.log('> req', req)
  // db.user.findOne({})
})

app.listen(NODE_REST_PORT, () => console.log(`🟡 REST API is listening on port ${NODE_REST_PORT}`))