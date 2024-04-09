import { db } from '../../bot/db/index.js'

export const allSubs = (req, res) => {
  db.subscriber.findAll({
    limit: 10,
    subQuery: false,
    order: [['createdAt', 'DESC']]
  }).then(subs => {
    res.status(200).send(subs)
  })

}