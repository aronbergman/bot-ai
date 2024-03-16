import { Telegraf, session } from 'telegraf'
import { code } from 'telegraf/format'
import { message } from 'telegraf/filters'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { Midjourney } from 'freezer-midjourney-api'
import { SUDOER, MJ } from './../db/mjSchema'
import { sudoChecker } from '../utils/sudoChecker'
import { INITIAL_SESSION } from '@/constants'
import { MyContext } from '@/contracts/telegramBot'
import { OggDownloader } from './oggDownloader'
import { OggConverter } from './oggConverter'
import { OpenAI } from './openAi'
import { saveAndSendPhoto } from '@/utils/saveAndSendPhoto'

export class TelegramBot {
  private bot: Telegraf<MyContext>

  public constructor() {
    this.bot = new Telegraf<MyContext>(process.env.TELEGRAM_API_KEY)

    this.useSession()
  }

  public runBot() {
    this.bot.launch()
  }

  public commandStart() {
    this.bot.command('start', async ctx => {
      ctx.session = INITIAL_SESSION

      await ctx.reply(code('The session has been started.'))
    })
  }

  public onMessageVoice() {
    this.bot.on(message('voice'), async ctx => {
      try {
        ctx.session ??= INITIAL_SESSION

        await ctx.reply(code('...'))

        const url = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)

        const oggDownloader = new OggDownloader(url.href)

        const oggPath = await oggDownloader.download(userId)

        if (!oggPath) {
          oggDownloader.delete()
          throw new Error('Something went wrong please try again.')
        }

        const oggConverter = new OggConverter(oggPath)

        const mp3Path = await oggConverter.toMp3(userId)
        oggDownloader.delete()

        if (!mp3Path) {
          oggConverter.delete()
          throw new Error('Something went wrong please try again.')
        }

        const openAi = new OpenAI(mp3Path)

        const { text } = await openAi.transcription()

        await ctx.reply(code(`Request: ${text}`))

        oggConverter.delete()

        ctx.session.messages.push({
          role: openAi.roles.User as ChatCompletionRequestMessageRoleEnum,
          content: text
        })

        const response = await openAi.chat(ctx.session.messages)

        if (!response) {
          throw new Error('Something went wrong please try again.')
        }

        ctx.session.messages.push({
          role: openAi.roles.Assistant as ChatCompletionRequestMessageRoleEnum,
          content: response.content
        })

        await ctx.reply(response.content)
      } catch (error) {
        if (error instanceof Error) {
          return await ctx.reply(error.message)
        }
      }
    })
  }

  public onMessageText() {
    this.bot.on(message('text'), async ctx => {
      try {
        ctx.session ??= INITIAL_SESSION

        await ctx.reply(code('...'))

        const openAi = new OpenAI()

        ctx.session.messages.push({
          role: openAi.roles.User as ChatCompletionRequestMessageRoleEnum,
          content: ctx.message.text
        })

        const response = await openAi.chat(ctx.session.messages)

        if (!response) {
          throw new Error('Something went wrong please try again.')
        }

        ctx.session.messages.push({
          role: openAi.roles.Assistant as ChatCompletionRequestMessageRoleEnum,
          content: response.content
        })

        await ctx.reply(response.content)
      } catch (error) {
        if (error instanceof Error) {
          return await ctx.reply(error.message)
        }
      }
    })
  }

  public listSudoers(sudoUser: number) {
    this.bot.command('ls', async ctx => {
      const { id: userId } = ctx.from
      const { id: chatID } = ctx.chat
      const msgId = ctx.message.message_id
      const options = {
        parse_mode: 'HTML',
        reply_to_message_id: msgId
      }

      if (userId !== sudoUser) {
        return ctx.reply(
          'permission denied: You do not have sufficient privileges to execute this command.'
        )
      }

      try {
        const counts = await SUDOER.count({})
        if (counts > 0) {
          const lists = await SUDOER.find({})
          const sudoers = lists.map((list: any) => `tg://user?id=${list.sudoer}\n`)
          ctx.reply(`${sudoers}\nsudoers: Total users in sudoers: [${counts}]`)
        } else {
          ctx.reply('sudoers: No users are currently authorized.')
        }
      } catch (error: any) {
        ctx.reply(`${error.message}`)
      }
    })
  }

  public removeSudoer(sudoUser: number) {
    this.bot.command('rm', async ctx => {
      // this.bot.onText(/\/rm/, async (msg, match) => {
      const { id: userId } = ctx.from
      const { id: chatID } = ctx.chat
      const msgId = ctx.message.message_id
      const options = {
        parse_mode: 'HTML',
        reply_to_message_id: msgId
      }

      if (userId !== sudoUser) {
        return ctx.reply(
          'permission denied: You do not have sufficient privileges to execute this command.'
        )
      }

      // User id that is going to be added as sudo
      const sudoId = ctx.message.text.replace('/rm ', '').trim()
      if (sudoId.length === 0) {
        return ctx.reply(
          'sudoers: No user ID provided. Unable to proceed.'
        )
      }

      try {
        const rmsu = await SUDOER.findOneAndDelete({ sudoer: sudoId })
        if (rmsu) {
          ctx.reply(
            'sudoers: User removed from sudoers. Permission revoked. Bot access disabled.'
          )
        } else {
          ctx.reply(
            'sudoers: User not found in sudoers. No action required.'
          )
        }
      } catch (error: any) {
        console.log(error.message)
        ctx.reply(
          'error: Invalid action. Please provide a valid action.'
        )
      }
    })
  };

  public addSudoer(sudoUser: number) {
    let sudoId
    this.bot.command('sudo', async ctx => {
      const { id: userId } = ctx.from
      const { id: chatID } = ctx.chat
      const msgId = ctx.message.message_id
      const options = {
        parse_mode: 'HTML',
        reply_to_message_id: msgId
      }

      if (userId !== sudoUser) {
        return ctx.reply(
          `${userId}: You do not have sufficient privileges to execute this command.`
        )
      }
      // User id that is going to be added as sudo
      sudoId = ctx.message.text.replace('/sudo ', '').trim()

      if (sudoId.length === 0) {
        return ctx.reply(
          'sudoers: No user ID provided. Unable to proceed.'
        )
      }

      try {
        const sudo = new SUDOER({
          sudoer: parseInt(sudoId, 10)
        })

        await sudo.save()

        ctx.reply(
          'sudoers: User successfully added. Bot access granted.'
        )
      } catch (error: any) {
        let errorMessage = ''
        if (error.code === 11000) {
          errorMessage +=
            'error: User ID already exists. Please select a different user ID.'
        } else {
          errorMessage += 'error: Invalid ID type specified.'
        }
        await ctx.reply(errorMessage)
      }
    })
  }

  public midJourney(sudoUser: number) {
    let userMessageId: any
    let prompt: string | any[]
    let client: any
    let Imagine: { uri: any; options: any[]; id: any; flags: any }
    let Variation: { uri: any; options: any[]; id: any; flags: any }

    this.bot.command('image', async ctx => {
      userMessageId = ctx.message.message_id
      prompt = ctx.message.text.replace('/image', '').trim()
      const { id: userId, username, first_name: firstname } = ctx.from
      const { id: chatID } = ctx.chat
      const options = {
        reply_to_message_id: userMessageId
      }
      if (
        !(await sudoChecker(
          userId,
          username || firstname,
          sudoUser,
          this.bot,
          chatID,
          options
        ))
      ) {
        return
      }
      if (prompt.length === 0) {
        return ctx.reply('Prompt can\'t be empty')
      }
      ctx.reply(
        `prompt: ${prompt} received generating image...`
      )

      try {
        const { SERVER_ID, CHANNEL_ID, SALAI_TOKEN } = process.env
        client = new Midjourney({
          ServerId: SERVER_ID,
          ChannelId: CHANNEL_ID,
          SalaiToken: SALAI_TOKEN,
          Debug: true,
          Ws: true
        })
        await client.init()
        Imagine = await client.Imagine(prompt, (uri: any, progress: any) => {
          console.log(`Loading: ${uri}, progress: ${progress}`)
        })

        const options = {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                { text: 'U1', callback_data: 'U1' },
                { text: 'U2', callback_data: 'U2' },
                { text: 'U3', callback_data: 'U3' },
                { text: 'U4', callback_data: 'U4' }
              ],
              [
                { text: 'V1', callback_data: 'V1' },
                { text: 'V2', callback_data: 'V2' },
                { text: 'V3', callback_data: 'V3' },
                { text: 'V4', callback_data: 'V4' }
              ]
            ]
          })
        }
        const imgUrl = Imagine.uri
        const imgDir = './Imagines'
        const filePath = `${imgDir}/${userMessageId}.png`
        ctx.reply('Choose What to do')
        await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, this.bot, options)
      } catch (error) {
        ctx.reply(`${error}`)
      }
    })

    // this.bot.on('callback_query', async ctx => {
    //   const { id: chat_id, title: chat_name } = ctx.message.chat
    //   const { message_id } = ctx.message
    //   const selectedLabel = ctx.data
    //   try {
    //     if (selectedLabel.includes('U')) {
    //       bot.sendMessage(chat_id, `Upscaling Image ${selectedLabel}`)
    //       const UCustomID = Imagine.options?.find(
    //         o => o.label === selectedLabel
    //       )?.custom
    //       const Upscale = await client.Custom({
    //         msgId: Imagine.id,
    //         flags: Imagine.flags,
    //         customId: UCustomID,
    //         loading: (uri, progress) => {
    //           console.log(`Loading: ${uri}, progress: ${progress}`)
    //         }
    //       })
    //
    //       const imgUrl = Upscale.uri
    //       const imgDir = './Upscales'
    //       const filePath = `${imgDir}/${message_id}.png`
    //       const options = {
    //         reply_to_message_id: userMessageId
    //       }
    //
    //       saveAndSendPhoto(imgUrl, imgDir, filePath, chat_id, bot, options)
    //     } else if (selectedLabel.includes('V')) {
    //       bot.deleteMessage(chat_id, message_id)
    //       bot.sendMessage(chat_id, `Generating Variants of ${selectedLabel}.`)
    //       const VCustomID = Imagine.options?.find(
    //         o => o.label === selectedLabel
    //       )?.custom
    //
    //       Variation = await client.Custom({
    //         msgId: Imagine.id,
    //         flags: Imagine.flags,
    //         customId: VCustomID,
    //         content: prompt,
    //         loading: (uri, progress) => {
    //           console.log(`Loading: ${uri}, progress: ${progress}`)
    //         }
    //       })
    //
    //       const options = {
    //         reply_markup: JSON.stringify({
    //           inline_keyboard: [
    //             [
    //               { text: '1', callback_data: 'scale1' },
    //               { text: '2', callback_data: 'scale2' },
    //               { text: '3', callback_data: 'scale3' },
    //               { text: '4', callback_data: 'scale4' }
    //             ]
    //           ]
    //         })
    //       }
    //
    //       const { id: user_id, username } = query.from
    //       const mj = new MJ({
    //         query_id: query.id,
    //         message_id,
    //         chat_instance: query.chat_instance,
    //         chat_id,
    //         chat_name,
    //         user_id,
    //         username,
    //         prompt,
    //         data: selectedLabel
    //       })
    //
    //       await mj.save()
    //
    //       const imgUrl = Variation.uri
    //       const imgDir = './Variations'
    //       const filePath = `${imgDir}/${message_id}.png`
    //
    //       saveAndSendPhoto(imgUrl, imgDir, filePath, chat_id, bot, options)
    //
    //       bot.on('callback_query', async query_up => {
    //         const upscaleLabel = query_up.data
    //         let imgLabel
    //
    //         switch (upscaleLabel) {
    //           case 'scale1':
    //             imgLabel = 'U1'
    //             break
    //           case 'scale2':
    //             imgLabel = 'U2'
    //             break
    //           case 'scale3':
    //             imgLabel = 'U3'
    //             break
    //           case 'scale4':
    //             imgLabel = 'U4'
    //             break
    //           default:
    //             bot.sendMessage(chat_id, 'Invalid selection')
    //             break
    //         }
    //
    //         bot.sendMessage(chat_id, `Upscaling Image from Variants ${imgLabel}`)
    //
    //         const upscaleCustomID = Variation.options?.find(
    //           o => o.label === imgLabel
    //         )?.custom
    //
    //         const variationUpscale = await client.Custom({
    //           msgId: Variation.id,
    //           flags: Variation.flags,
    //           customId: upscaleCustomID,
    //           loading: (uri, progress) => {
    //             console.log(`Loading: ${uri}, progress: ${progress}`)
    //           }
    //         })
    //
    //         console.log(variationUpscale)
    //
    //         const imgUrl = variationUpscale.uri
    //         const imgDir = './VariationsUpscales'
    //         const filePath = `${imgDir}/${message_id}.png`
    //         const options = {
    //           reply_to_message_id: userMessageId
    //         }
    //         saveAndSendPhoto(imgUrl, imgDir, filePath, chat_id, bot, options)
    //       })
    //     }
    //   } catch (error) {
    //     bot.sendMessage(chat_id, error, { reply_to_message_id: userMessageId })
    //   }
    // })
  };

  private useSession() {
    this.bot.use(session())
  }
}
