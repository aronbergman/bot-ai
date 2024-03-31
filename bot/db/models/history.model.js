export default (sequelize, DataTypes) => {
  const HistorySchema = sequelize.define('history',
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
      nickname: {
        type: DataTypes.STRING
      },
      request: {
        type: DataTypes.STRING
      },
      response: {
        type: DataTypes.STRING
      }
    }
  )
  return HistorySchema;
}