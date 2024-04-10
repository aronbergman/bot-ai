export default (sequelize, DataTypes) => {
  const HistorySchema = sequelize.define('history',
    {
      chat_id: {
        type: DataTypes.DOUBLE,
        required: true,
      },
      message_id: {
        type: DataTypes.DOUBLE,
        required: true
      },
      nickname: {
        type: DataTypes.STRING
      },
      fullname: {
        type: DataTypes.STRING
      },
      request: {
        type: DataTypes.CHAR(255)
      },
      response: {
        type: DataTypes.CHAR(255)
      }
    }
  )
  return HistorySchema;
}