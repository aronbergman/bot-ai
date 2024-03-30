import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";

// Import command
import { startBot } from "./bot/commands/start.js";
import { addSudoer } from "./bot/commands/admin/addSudoer.js";
import { removeSudoer } from "./bot/commands/admin/removeSudoer.js";
import { listSudoers } from "./bot/commands/admin/listSudoers.js";
import { onMessageText } from "./bot/commands/onMessageText.js";
import { onMessageVoice } from "./bot/commands/onMessageVoice.js";
import { textToSpeach } from './bot/commands/textToSpeach.js'
import { getId } from './bot/commands/admin/getId.js'
import { changeMode } from './bot/commands/changeMode.js'
import { getInfo } from './bot/commands/account.js'

dotenv.config();

const { TG_BOT_TOKEN, SUDO_USER } = process.env;
const sudoUser = parseInt(SUDO_USER, 10);

const bot = new TelegramBot(TG_BOT_TOKEN, { polling: true });

// Use command
startBot(bot);
changeMode(bot);
getId(bot);
getInfo(bot)
textToSpeach(bot);
// midjourneyCallbackQuery(bot);
addSudoer(bot, sudoUser);
removeSudoer(bot, sudoUser);
listSudoers(bot, sudoUser);
onMessageText(bot, sudoUser);
// onMessageVoice(bot);