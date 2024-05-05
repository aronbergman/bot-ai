import { db } from '../db/index.js'
import { REQUEST_TYPES, REQUEST_TYPES_COST } from '../constants/index.js'
import { Tiktoken } from 'tiktoken/lite'
import { load } from 'tiktoken/load'
import registry from 'tiktoken/registry.json' assert { type: 'json' }
import models from 'tiktoken/model_to_encoding.json' assert { type: 'json' }

export async function calculationOfNumberOfTokens(text, type = REQUEST_TYPES_COST.GPT, model = 'gpt-3.5-turbo') {
  const { dataValues: settings } = await db.settings.findOne({ where: { user_id: 0 } })

  const loadModel = await load(registry[models[model]])
  const encoder = new Tiktoken(
    loadModel.bpe_ranks,
    loadModel.special_tokens,
    loadModel.pat_str
  )
  const tokens = encoder.encode(text)
  encoder.free()
  console.log('type', type, settings[type] * tokens.length)
  return tokens.length * settings[type] //
}

async function isTokens(userID, settings, countTokens, typeRequest) {
  const { tokens } = await db.subscriber.findOne({ where: { user_id: userID } })
  return tokens >= ((await countTokens) * settings[REQUEST_TYPES_COST[typeRequest]])
}

export const checkTokens = async (typeRequest, text, userID) => {
  const { dataValues: settings } = await db.settings.findOne({ where: { user_id: 0 } })
  let countTokens

  switch (typeRequest) {
    case REQUEST_TYPES.GPT: // умножение на коэффицент
    case REQUEST_TYPES.TTS: // умножение на коэффицент
    case REQUEST_TYPES.MIDJOURNEY: // умножение на коэффицент
    case REQUEST_TYPES.DALLE: // умножение на коэффицент
      countTokens = await calculationOfNumberOfTokens(text, REQUEST_TYPES_COST[typeRequest], 'gpt-3.5-turbo')
      return isTokens(userID, settings, countTokens, typeRequest)
    case REQUEST_TYPES.CONVERTOR: // стоимость конвертации 1 отправленного файла в таблице
    default:
      return false
  }
}