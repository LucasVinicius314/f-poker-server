import { User } from './user'

declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      PORT?: string
      SECRET: string
      DATABASE_URL: string
    }
  }
}

export {}
