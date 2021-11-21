import * as dotenv from 'dotenv'

import { DataTypes, Sequelize } from 'sequelize'

dotenv.config()

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  ssl: true,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
})

const User = sequelize.define('user', {
  email: DataTypes.STRING,
  password: DataTypes.STRING(256),
  username: DataTypes.STRING,
})

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get())
  delete values.password
  return values
}

export const Models = {
  User,
}
