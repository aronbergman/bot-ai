import { createReadStream } from 'fs'
import { OpenAI as OpenAIApi } from 'openai'
import dotenv from 'dotenv'

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

  async chat(messages, bot, editId, chatId) {
    const response = await this.openai.chat.completions.create({
      model: this.chatGPTVersion,
      messages,
      stream: true
    })
    let answer = ''
    for await (const chunk of response) {
      answer += chunk.choices[0]?.delta?.content || ''

      await bot.editMessageText(answer, {
        message_id: editId, chat_id: chatId
      }).catch((err) => {console.log('.')})
    }

    return new Promise(res => res(answer))
  }

  async transcription() {
    if (!this.filepath) {
      throw new Error('Something went wrong please try again.')
    }

    const { data } = await this.openai.createTranscription(
      createReadStream(this.filepath),
      'whisper-1'
    )

    return data
  }
}
