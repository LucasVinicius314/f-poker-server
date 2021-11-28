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
  const clients: Clients = {}
  const games: { name: string }[] = []
  const io = new socketIo(server, {
    transports: ['websocket'],
    allowEIO3: true,
  })

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

        socket.on('get_games', (params) => {
          socket.emit('get_games', games)
        })

        socket.on('create_game', (params) => {
          games.push({ name: params.name ?? `${decoded.username}'s game` })

          io.emit('get_games', games)
        })

        socket.on('join_game', (params) => {
          // TODO: fix
        })
      } catch (error) {
        socket.emit('error', 'Unauthorized')
        socket.disconnect(true)
      }
    }
  })
}
