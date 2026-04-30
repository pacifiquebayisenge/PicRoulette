import { io } from 'socket.io-client'

export async function wakeUpServer() {
  return fetch(import.meta.env.VITE_SERVER_URL + '/health', {
    method: 'GET',
    cache: 'no-store'
  })
}

class SocketService {
  socket = null

  connect(username) {
    if (this.socket) return this.socket

    this.socket = io(import.meta.env.VITE_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      query: { name: username }
    })

    return this.socket
  }

  getSocket() {
    if (!this.socket) {
      throw new Error('Socket not initialized. Call connect() first.')
    }
    return this.socket
  }

  emit(event, payload) {
    this.getSocket().emit(event, payload)
  }

  on(event, callback) {
    this.getSocket().on(event, callback)
  }

  off(event, callback) {
    this.getSocket().off(event, callback)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

export const socketService = new SocketService()
