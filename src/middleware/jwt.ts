import * as dotenv from 'dotenv'
import * as jwt from 'jsonwebtoken'

import { HttpException } from '../exceptions/httpexception'
import { RequestHandler } from 'express'
import { User } from '../typescript/user'

dotenv.config()

export const validationHandler: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] as string
    const decoded = jwt.verify(token, process.env.SECRET) as User
    req.user = decoded

    next()
  } catch (error) {
    next(new HttpException(401, 'Invalid access token'))
  }
}

export const sign = (user: User) => {
  return jwt.sign(user, process.env.SECRET)
}
