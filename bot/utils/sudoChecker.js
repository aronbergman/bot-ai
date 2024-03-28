// Only specified user can run the bot
import { sequelize } from '../db/index.js'

export const sudoChecker = async (
  userId,
  username,
  sudoUser,
  bot,
  chatID,
  options
) => {
  if (userId !== sudoUser) {
    sequelize.sudouser.findOne({
      where: {
        userId: chatID || userId
      }
    }).then(() => {})
      .catch(() => {
      bot.sendMessage(
        chatID,
        `@${username} you don't have enough permission to run this command.`,
        options || {}
      )
      return false
    })
  }

  return true
}
