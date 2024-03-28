export default (sequelize, DataTypes) => {
  const ModeUserSchema = sequelize.define('modeuser',
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
      mode: {
        type: DataTypes.STRING
      }
    }
  )
  return ModeUserSchema;
}