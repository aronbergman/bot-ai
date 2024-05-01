// TODO: Подключи эту схему, она нужна для управления настройками глобально в строке 0 и настройками для каждого чата по отдельности, если кого-то нужно ограничить или перенаправить, дав отдельные токены
export default (sequelize, DataTypes) => {
  const SettingsSchema = sequelize.define('settings', {
    user_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      primaryKey: true
    },
    converter_switch: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    midjourney_switch: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    chatgpt_switch: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    dalle_switch: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    chatgpt_default_version: {
      type: DataTypes.STRING,
      defaultValue: 'gpt-4'
    },
    chatgpt_subs_version: {
      type: DataTypes.STRING,
      defaultValue: 'gpt-3.5-turbo'
    },
    converter_sid: {
      type: DataTypes.STRING
    },
    converter_key: {
      type: DataTypes.STRING
    },
    openai_key_temp: {
      type: DataTypes.STRING
    }
  })

  return SettingsSchema
};
