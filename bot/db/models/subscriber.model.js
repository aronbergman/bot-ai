import { BOOLEAN } from 'sequelize/lib/data-types'

export default (sequelize, DataTypes) => {
  const SubscriberSchema = sequelize.define('subscriber',
    {
      chat_id: {
        type: DataTypes.DOUBLE,
        required: true,
        unique: true
      },
      user_id: {
        type: DataTypes.DOUBLE,
        required: true
      },
      first_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      username: {
        type: DataTypes.STRING
      },
      language_code: {
        type: DataTypes.STRING,
        defaultValue: 'en'
      },
      mode: {
        type: DataTypes.STRING,
        defaultValue: "GPT"
      },
      modeGPT: {
        type: DataTypes.STRING,
        defaultValue: 'assistant'
      },
      premium: {
        type: BOOLEAN
      },
      user_id_referral_program: {
        type: DataTypes.DOUBLE
      },
      quiz_type_available: {
        type: DataTypes.STRING,
      },
      quiz_available: {
        type: DataTypes.DOUBLE,
        defaultValue: 3
      },
      quiz_count: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
      },
      MI_count: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
      },
      GPT_count: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
      },
      FILES_count: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
      },
      comment: {
        type: DataTypes.STRING,
      },
      tags: {
        type: DataTypes.STRING,
      }
    }
  )
  return SubscriberSchema
}