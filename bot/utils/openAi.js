import { createReadStream } from 'fs'
import {
  Configuration,
  OpenAIApi
} from 'openai'

export class OpenAI {
  roles = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
  }

  chatGPTVersion = 'gpt-3.5-turbo'

//  openai: OpenAIApi

  constructor(filepath) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    })

    this.openai = new OpenAIApi(configuration)
    this.filepath = filepath
  }

  async chat(messages) {
    const response = await this.openai.createChatCompletion({
      model: this.chatGPTVersion,
      messages
    })

    return response.data.choices[0].message
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
