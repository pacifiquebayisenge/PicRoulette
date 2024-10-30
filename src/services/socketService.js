import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
  }

  connect(username) {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_SERVER_URL, {
        query: { name: username }
      })
    }

    return this.socket
  }

  getSocket() {
    if (!this.socket) {
      throw new Error('Socket not initialized. Call connect() first.')
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

const socketService = new SocketService()
export default socketService
