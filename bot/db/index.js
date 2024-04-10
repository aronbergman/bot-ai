import { DataTypes, Sequelize } from 'sequelize'
import MidjourneySchema from './models/midjourney.model.js'
import UserSchema from './models/user.model.js'
import SubscriberSchema from './models/subscriber.model.js'
import PaymentSchema from './models/payment.model.js'
import RoleSchema from './models/role.model.js'
import UserRolesSchema from './models/user_roles.model.js'
import SudoUserSchema from './models/sudoer.model.js'
import QuizSchema from './models/quiz.model.js'
import HistorySchema from './models/history.model.js'
import TranslateSchema from './models/translait.model.js'
import { dbConfig } from './db.config.js'

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
    timestamps: true
  },
  logging:false,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
})

// try {
//   await sequelize.authenticate()
//   console.log('Connection has been established successfully.')
// } catch (error) {
//   console.log(`>> ${dbConfig.HOST}:${dbConfig.port}`)
//   console.error('Unable to connect to the database:', error)
// }

export const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = UserSchema(sequelize, DataTypes)
db.role = RoleSchema(sequelize, DataTypes)
db.midjourney = MidjourneySchema(sequelize, DataTypes)
db.subscriber = SubscriberSchema(sequelize, DataTypes)
db.userRoles = UserRolesSchema(sequelize, DataTypes)
db.sudouser = SudoUserSchema(sequelize, DataTypes)
db.payment = PaymentSchema(sequelize, DataTypes)
db.quiz = QuizSchema(sequelize, DataTypes)
db.history = HistorySchema(sequelize, DataTypes)
db.translate = TranslateSchema(sequelize, DataTypes)

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.ROLES = ['user', 'admin', 'moderator']

sequelize.sync().then(() => {
  console.log(`🟢 ${dbConfig.HOST}:${dbConfig.port} – sequelize.sync successfully!`)
}).catch((error) => {
  console.error('Unable to create table : ', error)
})