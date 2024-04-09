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
        type: DataTypes.STRING
      },
      modeGPT: {
        type: DataTypes.STRING,
        defaultValue: 'MODE_CHATGPT'
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
      }
    }
  )
  return SubscriberSchema
}