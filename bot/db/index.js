import { DataTypes, Sequelize } from 'sequelize'
import MidjourneySchema from './models/midjourney.model.js'
import ModeUserSchema from './models/mode.model.js'
import SudoUserSchema from './models/sudoer.model.js'
import { dbConfig } from "./db.config.js";

export const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
})

try {
  await sequelize.authenticate()
  console.log('Connection has been established successfully.')
} catch (error) {
  console.log(`>> ${dbConfig.HOST}:${dbConfig.port}`)
  console.error('Unable to connect to the database:', error)
}

sequelize.midjourney = MidjourneySchema(sequelize, DataTypes)
sequelize.modeuser = ModeUserSchema(sequelize, DataTypes)
sequelize.sudouser = SudoUserSchema(sequelize, DataTypes)

sequelize.sync().then(() => {
  console.log(`>> ${dbConfig.HOST}:${dbConfig.port} – tables created successfully!`)
}).catch((error) => {
  console.error('Unable to create table : ', error)
})