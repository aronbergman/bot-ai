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
        type: DataTypes.STRING,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
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
      tokens: {
        type: DataTypes.DOUBLE,
        defaultValue: 10000,
      },
      paid_days: {
        type: DataTypes.DOUBLE,
        defaultValue: 7
      },
      user_id_referral_program: {
        type: DataTypes.DOUBLE,
      },
      quiz_subs_available: {
        type: DataTypes.DOUBLE,
        defaultValue: 3
      },
      quiz_token_available: {
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
      },
      tts_voice: {
        type: DataTypes.STRING,
        defaultValue: "alloy"
      }
    }
  )
  return SubscriberSchema
}