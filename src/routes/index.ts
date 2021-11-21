import { Router } from 'express'
import { authRouter } from './auth'
import { errorHandler } from '../middleware/error'
import { validationHandler } from '../middleware/jwt'

export const router = Router()

// open routes

router.use('/user', authRouter)

// protected routes

router.use(validationHandler)

// error

router.use(errorHandler)
