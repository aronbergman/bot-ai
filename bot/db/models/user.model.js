import { BOOLEAN } from 'sequelize/lib/data-types'

export default (sequelize, DataTypes) => {
  const UserSchema = sequelize.define('user',
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
      },
      premium: {
        type: DataTypes.BOOLEAN
      }
    }
  )
  return UserSchema
}