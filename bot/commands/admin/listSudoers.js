// Add sudo users who'll have ability to run the bot
import { sequelize } from '../../db/index.js'

export const listSudoers = (bot, sudoUser) => {
  bot.onText(/\/ls/, async msg => {
    const { id: userId } = msg.from
    const { id: chatID } = msg.chat
    const msgId = msg.message_id
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId
    }

    if (userId !== sudoUser) {
      return bot.sendMessage(
        chatID,
        'permission denied: You do not have sufficient privileges to execute this command.',
        options
      )
    }

    try {
      sequelize.sudouser.count()
        .then(res => {
          console.log(res)
          if (res > 0) {
            sequelize.sudouser.findAll({
              limit: 10,
              subQuery: false,
              order: [['createdAt', 'DESC']]
            }).then(res => {
              console.log('res findAll', res)
              const sudoers = res.map(user => `tg://user?id=${user.dataValues.userId}\n`)
              bot.sendMessage(
                chatID,
                `${sudoers}\nsudoers: Total users in sudoers: ${sudoers.length}`,
                options
              )
            })
          } else {
            bot.sendMessage(chatID, 'sudoers: No users are currently authorized.', options)
          }
        })
    } catch (error) {
      await bot.sendMessage(chatID, `${error.message}`, options)
    }
  })
}
