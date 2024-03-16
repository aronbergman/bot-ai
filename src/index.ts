import 'dotenv/config'

import { TelegramBot } from './infrastructure'

const bot = new TelegramBot()
const { SUDO_USER } = process.env;
const sudoUser = parseInt(SUDO_USER, 10);

bot.commandStart()
bot.addSudoer(sudoUser)
bot.removeSudoer(sudoUser)
bot.listSudoers(sudoUser)
bot.midJourney(sudoUser)
bot.onMessageVoice()
bot.onMessageText()

bot.runBot()
