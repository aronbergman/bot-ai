
import { Midjourney } from 'freezer-midjourney-api'
import Converter from 'timestamp-conv'

export const midjourneyInfo = async (bot, userMessageId) => {
  bot.onText(/^\/minfo+/ig, async msg => {
    const { id: chatId } = msg.chat
    const options = {
      reply_to_message_id: userMessageId,
      parse_mode: 'HTML'
    }

    try {
      const { SERVER_ID, CHANNEL_ID, SALAI_TOKEN } = process.env
      const client = new Midjourney({
        ServerId: SERVER_ID,
        ChannelId: CHANNEL_ID,
        SalaiToken: SALAI_TOKEN,
        Debug: true,
        Ws: true
      })

      const msg = await client.Info()

const date = new Converter.date(+msg.subscription.split('<t:')[1].substring(0, 10));

      const message = `
👨🏻‍🎨 <b>Midjourney Info </b>
Basic (Active monthly, renews next on ${date.getDay()}.${date.getMonth()}.${date.getYear()}, ${date.getHour()}:${date.getMinute()}
${msg.fastTimeRemaining}
visibilityMode: ${msg.visibilityMode}
lifetimeUsage: ${msg.lifetimeUsage}
relaxedUsage: ${msg.relaxedUsage}
queuedJobsFast: ${msg.queuedJobsFast}
queuedJobsRelax: ${msg.queuedJobsRelax}
runningJobs: ${msg.runningJobs}
jobMode: ${msg.jobMode} 
  `
      await bot.sendMessage(chatId, message, options)
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
