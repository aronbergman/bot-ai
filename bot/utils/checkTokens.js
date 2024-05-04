import { db } from '../db/index.js'
import { REQUEST_TYPES } from '../constants/index.js'
import { Tiktoken } from 'tiktoken/lite'
import { load } from 'tiktoken/load'
import registry from 'tiktoken/registry.json' assert { type: 'json' }
import models from 'tiktoken/model_to_encoding.json' assert { type: 'json' }

export async function calculationOfNumberOfTokens(text, model = 'gpt-3.5-turbo') {
  const loadModel = await load(registry[models[model]])
  const encoder = new Tiktoken(
    loadModel.bpe_ranks,
    loadModel.special_tokens,
    loadModel.pat_str
  )
  const tokens = encoder.encode(text)
  encoder.free()

  return tokens
}

async function processingChatGPTRequest(typeRequest, text, userID, cost) {
  const countTokens = await calculationOfNumberOfTokens(text)
  const { tokens } = await db.subscriber.findOne({ where: { user_id: userID } })

  if (tokens >= (await countTokens).length) { // TODO:  Добавить алгоритм примерного расчета стоимости вопроса и ответа ( x10 ? )
      return true
  } else {
    return false
  }
}

export const checkTokens = async (typeRequest, text, userID) => {
  const { dataValues: settings } = await db.settings.findOne({ where: { user_id: 0 } })

  switch (typeRequest) {
    case REQUEST_TYPES.CHAT_GPT:
      return await processingChatGPTRequest(typeRequest, text, userID, settings['cost_chat'])
    case REQUEST_TYPES.MIDJOUNEY:
    case REQUEST_TYPES.DALLE:
    case REQUEST_TYPES.TTS:
    case REQUEST_TYPES.CONVERTOR:
    default:
      return false
  }
}