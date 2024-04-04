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
      mode: {
        type: DataTypes.STRING
      },
      premium: {
        type: BOOLEAN
      }
    }
  )
  return SubscriberSchema
}