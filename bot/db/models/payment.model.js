import { BOOLEAN } from 'sequelize/lib/data-types'

// Реферальные ссылки нужно учитывать как платежи без оплаты с определенным типом

export default (sequelize, DataTypes) => {
  const PaymentSchema = sequelize.define('payments',
    {
      payment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1(10),
        allowNull: false,
        primaryKey: true
      },
      payment_confirmed: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      type_of_tariff: { // "DAYS" || "REQUESTS"
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: { // "7" "100"
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      subs_end_date: { // TODO: Добавить подсчет после подтверждения оплаты
        type: DataTypes.DATE,
        allowNull: true,
      },
      price: { // 199 (сумма проведенная через stripe)
        type: DataTypes.STRING
      },
      currency: { // "RUB" (строка валюты платежа)
        type: DataTypes.STRING
      },
      user_id: { // кому принадлежит подписка
        type: DataTypes.DOUBLE,
        required: true,
      },
      username: { // кому принадлежит подписка
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_method: { // "stripe", "referal"
        type: DataTypes.STRING
      },
    }
  )
  return PaymentSchema
}