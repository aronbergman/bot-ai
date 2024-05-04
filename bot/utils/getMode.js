import { db } from '../db/index.js'
import { modeMidjourney } from '../commands/modes/midjourney.js'
import { onMessageTextDefault } from '../commands/onMessageTextDefault.js'
import { modeDalle } from '../commands/modes/modeDalle.js'
import { textToSpeech } from '../commands/textToSpeech.js'
import { createFullName } from './createFullName.js'
import { checkTokens } from './checkTokens.js'
import { REQUEST_TYPES } from '../constants/index.js'
import { keyboardMyAccount } from '../commands/keyboard/my_account.js'
import { isTokensEmpty } from '../commands/keyboard/empty_tokens.js'

export const isModeMidjourney = async (bot, msg, match, sudoUser, t) => {
  if (msg.text?.match(/^\/+/ig))
    return
  await db.subscriber.findOne({
    where: { chat_id: msg.chat.id, user_id: msg.from.id }
  }).then(async res => {
    if (res.mode === 'MIDJOURNEY') {
      return modeMidjourney(bot, sudoUser, msg, match)
    } else if (res.mode === 'DALL-E') {
      return modeDalle(bot, sudoUser, msg, match)
    } else if (res.mode === 'TTS') {
      return textToSpeech(bot, msg.chat.id, msg, msg.text, res.tts_voice)
    } else {
      const isPermission = await checkTokens(REQUEST_TYPES.CHAT_GPT, msg.text, msg.chat.id)
      console.log('isPermission', isPermission)
      if (isPermission)
        return onMessageTextDefault(bot, msg, match, sudoUser, t)
      else
        return isTokensEmpty(bot, msg)
    }
  }).catch(() => true)
}