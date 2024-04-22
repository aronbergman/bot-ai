import { createReadStream } from 'fs'
import { OpenAI as OpenAIApi } from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import fs from "fs";

dotenv.config({ path: '../.env' })

export class OpenAI {
  roles = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
  }

  chatGPTVersion = 'gpt-3.5-turbo'

  constructor(filepath) {
    this.openai = new OpenAIApi({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.filepath = filepath
  }

  async chat(messages, bot, editMessage, chatId) {
    const response = await this.openai.chat.completions.create({
      model: this.chatGPTVersion,
      messages,
      stream: true
    })
    let answer = ''
    let prevAnswer = ''
    for await (const chunk of response) {
      answer += chunk.choices[0]?.delta?.content || ''
      process.stdout.write(`${answer.length % process.env.CHAT_GPT_SPEED}`)
      process.stdout.write(`${answer.length === prevAnswer.length ? '🔺' : ''}`)
      if (
        answer.length
        && answer.length !== prevAnswer.length
        && answer.length % process.env.CHAT_GPT_SPEED === 0
      ) {
        // process.stdout.write('🟩')
        await bot.editMessageText(answer, {
          message_id: editMessage.message_id, chat_id: chatId
        }).then(() => {
          prevAnswer = answer
        }).catch((err) => {
          console.log('💀 openai.chat', err.message)
          return true
        })
      }
    }

    await bot.editMessageText(answer, {
      message_id: editMessage.message_id, chat_id: chatId
    }).catch((err) => {
      console.log('💀 openai.chat', err.message)
    })

    return new Promise(res => res(answer))
  }

  async image(prompt) {
    let response = await this.openai.images.generate({
      prompt,
      n: 4,
      size: '512x512',
      quality: 'hd'
    })
    return response.data[0].url
  }

  async transcription() {
    if (!this.filepath) {
      throw new Error('Something went wrong please try again.')
    }

    const { text } = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: createReadStream(this.filepath)
    })

    return text
  }

  async textToSpeech(prompt, msg, voice) {
      const imgDir = './text-to-speech'
    const speechFile = path.resolve(`${imgDir}/@${msg.from.username}-${msg.message_id}.mp3`)
    const mp3 = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: voice ?? 'nova',
      input: prompt
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    await fs.promises.writeFile(speechFile, buffer)

    return speechFile;
  }
}
