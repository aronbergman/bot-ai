import { DataTypes, Sequelize } from 'sequelize'
import MidjourneySchema from './models/midjourney.model.js'
import ModeUserSchema from './models/mode.model.js'
import SudoUserSchema from './models/sudoer.model.js'

export const sequelize = new Sequelize('bot-ai', 'root', 'Salut@3462', {
  host: '127.0.0.1',
  dialect: 'mysql'
})

try {
  await sequelize.authenticate()
  console.log('Connection has been established successfully.')
} catch (error) {
  console.error('Unable to connect to the database:', error)
}

sequelize.midjourney = MidjourneySchema(sequelize, DataTypes)
sequelize.modeuser = ModeUserSchema(sequelize, DataTypes)
sequelize.sudouser = SudoUserSchema(sequelize, DataTypes)

sequelize.sync().then(() => {
  console.log('tables created successfully!')
}).catch((error) => {
  console.error('Unable to create table : ', error)
})