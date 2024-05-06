import { db } from '../../bot/db/index.js'
import { Sequelize } from 'sequelize'

export const paymentSuccess = (req, res) => {
  // найти один счет, который якобы оплачен
  db.payment.findOne({
    where: {
      payment_id: req.query?.paymentID,
      user_id: req.query?.userID,
      tokens: req.query?.tokens
    }
  }).then(async invoice => {
    console.log('invoice', invoice['dataValues'])
    //  если он есть - зачислить пользователю токены и дату активации и дату окончания
    await db.payment.update(
      { payment_confirmed: Sequelize.literal('CURRENT_TIMESTAMP') },
      { where: { payment_id: req.query?.paymentID } }
    )

    await db.subscriber.update(
      {
        tokens: Sequelize.literal(`tokens + ${invoice.dataValues['tokens']}`),
        paid_days: invoice.dataValues['duration_days']
      },
      { where: { user_id: invoice.dataValues['user_id'] } }
    )

    // отправить html c позитивным сообщением и просьбой вернуться в бота
    res.status(200).send(`${invoice['dataValues']['type_of_tariff']} успешно зачислены!`)
  })

}