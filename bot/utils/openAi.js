import { createReadStream } from 'fs'
import * as parse from '@fortaine/fetch-event-source/parse'
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

//  openai: OpenAIApi

  constructor(filepath) {
    this.openai = new OpenAIApi({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.filepath = filepath
  }

  async chat(messages, bot, editId) {
    const response = await this.openai.chat.completions.create({
      model: this.chatGPTVersion,
      messages,
      stream: true
    })
let answer = ''
  for await (const chunk of response) {
    answer += chunk.choices[0]?.delta?.content || ''
    console.log('chunk.choices[0]?.delta?.content', chunk.choices[0]?.delta?.content)
    bot.sendMessage(6221051172, chunk.choices[0]?.delta?.content).catch((err) => {console.log(err)})
  }



    // return new Promise(res => res(answer))
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
