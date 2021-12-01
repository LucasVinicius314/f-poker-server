import * as dotenv from 'dotenv'
import * as jwt from 'jsonwebtoken'

import { Socket, Server as socketIo } from 'socket.io'

import { Game } from '../typescript/game'
import { Server } from 'http'
import { User } from '../typescript/user'
import { v4 } from 'uuid'

dotenv.config()

type Clients = {
  [type: number]: Socket
}

export const useSocket = (server: Server) => {
  const clients: Clients = {}
  const games: Game[] = []
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
          // send a list with all game rooms on the server to the requesting client

          socket.emit('get_games', games)
        })

        socket.on('create_game', async (params: { name: string }) => {
          // assign an id to the game room
          // add it to the game rooms list
          // emit a an event to all clients with the updated game list
          // make the client who created it join the game room

          const id = v4()

          games.push({
            id: id,
            players: [decoded],
            name: params.name ?? `${decoded.username}'s game`,
          })

          io.emit('get_games', games)

          await socket.join(id)

          // TODO: fix
          socket.data['joinedGameId'] = id
        })

        socket.on('join_game', async (params: { id: string }) => {
          // TODO: fix
          // find a game with the given id
          // if found, add the client to the players list
          // make the client join the game room
          // emit game_info to connected clients

          const game = games.find((v) => v.id === params.id)

          if (game !== undefined) {
            game.players.push(decoded)

            await socket.join(game.id)

            // TODO: fix
            socket.data['joinedGameId'] = game.id

            io.to(game.id).emit('game_info', game)
          }
        })

        socket.on('leave_game', async (params) => {
          const joinedGameId = socket.data['joinedGameId'] as string

          const game = games.find((v) => v.id === joinedGameId)

          if (game !== undefined) {
            const index = game.players.findIndex((v) => v.id === decoded.id)

            if (index !== -1) {
              game.players.splice(index)

              await socket.leave(game.id)

              // TODO: fix
              delete socket.data['joinedGameId']

              io.to(game.id).emit('game_info', game)
            }
          }
        })

        socket.on('game_info', (params) => {
          // TODO: fix
          // send the client's current joined game info to the client

          const joinedGameId = socket.data['joinedGameId'] as string

          const game = games.find((v) => v.id === joinedGameId)

          if (game != undefined) socket.emit('game_info', game)
        })
      } catch (error) {
        socket.emit('error', 'Unauthorized')
        socket.disconnect(true)
      }
    }
  })
}
