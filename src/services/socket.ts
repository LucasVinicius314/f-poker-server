import * as dotenv from 'dotenv'
import * as jwt from 'jsonwebtoken'

import { Socket, Server as socketIo } from 'socket.io'

import { Server } from 'http'
import { User } from '../typescript/user'

dotenv.config()

type Clients = {
  [type: number]: Socket
}

export const useSocket = (server: Server) => {
  const io = new socketIo(server, { transports: ['websocket'] })
  const clients: Clients = {}

  io.engine.on('connection_error', (err) => {
    console.log(err.req)
    console.log(err.code)
    console.log(err.message)
    console.log(err.context)
  })

  io.on('connection', (socket) => {
    console.log('Socket client connected')

    const token = socket.request.headers['x-access-token'] as string

    if (typeof token != 'string') {
      socket.emit('error', 'Unauthorized')
      socket.disconnect(true)
    } else {
      try {
        const decoded = jwt.verify(token, process.env.SECRET) as User

        clients[decoded.id] = socket

        socket.on('message', (params) => {
          console.log('message event')
        })
      } catch (error) {
        socket.emit('error', 'Unauthorized')
        socket.disconnect(true)
      }
    }
  })
}
