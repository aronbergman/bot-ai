import { db } from '../db/index.js'
import { REQUEST_TYPES, REQUEST_TYPES_COST } from '../constants/index.js'
import { Tiktoken } from 'tiktoken/lite'
import { load } from 'tiktoken/load'
import registry from 'tiktoken/registry.json' assert { type: 'json' }
import models from 'tiktoken/model_to_encoding.json' assert { type: 'json' }
import { Sequelize } from 'sequelize'
import { autoRemoveMessage } from '../commands/hoc/autoRemoveMessage.js'
import { ct } from './createTranslate.js'

// Функция для примерного подсчета стоимости запроса для пояления предупреждения что токенов не хватает
export const checkTokens = async (typeRequest, userID, text = '') => {
  const { dataValues: settings } = await db.settings.findOne({ where: { user_id: 0 } })
  let countTokens

  switch (typeRequest) {
    case REQUEST_TYPES.GPT:
    case REQUEST_TYPES.TTS:
      // умножение на коэффицент
      countTokens = await calculationOfNumberOfTokens(text, REQUEST_TYPES_COST[typeRequest])
      return isTokens(userID, settings, countTokens, typeRequest)
    case REQUEST_TYPES.DALLE:
    case REQUEST_TYPES.MIDJOURNEY:
    case REQUEST_TYPES.CONVERTOR:
      // стоимость конвертации 1 отправленного файла в таблице
      return isTokens(userID, settings, 1, typeRequest)
    default:
      return { tokensAvailable: null, price: null }
  }
}

// Функция для списания определенного кол-ва токенов в зависимости от типа запроса
export async function writingOffTokens(bot, msg, type, prompt = '') {
  const t = await ct(msg)
  const {price} = await checkTokens(type, msg.from.id, prompt)
  const { GPT_model } = await db.subscriber.findOne({ where: { user_id: msg.from.id } })

  await db.subscriber.update(
    { tokens: Sequelize.literal(`tokens - ${price}`) },
    { where: { chat_id: msg.from.id } }
  )

  await autoRemoveMessage(t('msg:writing-off-tokens', {price}) + ` ${GPT_model}`, bot, msg.from.id)
}

async function calculationOfNumberOfTokens(text, type = REQUEST_TYPES_COST.GPT, model = 'gpt-3.5-turbo') {
  const { dataValues: settings } = await db.settings.findOne({ where: { user_id: 0 } })

  const loadModel = await load(registry[models[model]])
  const encoder = new Tiktoken(
    loadModel.bpe_ranks,
    loadModel.special_tokens,
    loadModel.pat_str
  )
  const tokens = encoder.encode(text)
  encoder.free()
  return tokens.length * settings[type]
}

async function isTokens(userID, settings, countTokens, typeRequest) {
  const { tokens: tokensAvailable } = await db.subscriber.findOne({ where: { user_id: userID } })
  return {
    tokensAvailable,
    price: ((await countTokens) * settings[REQUEST_TYPES_COST[typeRequest]])

  }
}
