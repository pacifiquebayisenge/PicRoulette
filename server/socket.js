const socketIo = require('socket.io')
const SUPERBASE = require('./supabase')
const GAME = require('./game')

// Keep track of connected users and available emojis
const users = {}
const availableEmojis = [
  '🐵',
  '🐶',
  '🐺',
  '🦊',
  '🦝',
  '🐱',
  '🦁',
  '🐯',
  '🐮',
  '🐷',
  '🐭',
  '🐹',
  '🐰',
  '🐻',
  '🐻‍❄️',
  '🐨',
  '🐼',
  '🐥',
  '🐧',
  '🦉',
  '🐸',
  '🐙',
  '🪼',
  '🦀',
  '🦋'
]

const userState = Object.freeze({
  WAITING: 'Waiting...',
  READY: 'Ready'
})

// Function to shuffle the array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]] // Swap elements
  }
}

// Function to send the list of connected users to all clients
const updateActiveUsers = (io) => {
  const activeUsers = Object.values(users) // Get all user names
  io.emit('activeUsers', { count: activeUsers.length, users: activeUsers }) // Emit user count and names
  startGameCheck(io)
}

const startGameCheck = async (io) => {
  const usersArray = Object.values(users)
  const allReady = Object.values(users).every((user) => user.state === userState.READY)

  if (usersArray.length > 0 && allReady) {
    console.log('All users are ready! Starting the game...')

    const list = await SUPERBASE.getGameImages(users)
    io.emit('allReady', list)
    launchGame(io, list, usersArray)
  } else {
    console.log('Not all users are ready yet.')
  }
}

const launchGame = async (io, imageList, usersArray) => {
  GAME.initGame(io, imageList, usersArray)
}

// Function to set up Socket.IO
const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: '*', // Allow all origins
      methods: ['GET', 'POST']
    }
  })

  // When a client connects
  io.on('connection', (socket) => {
    // Extract the user's name from the query
    const { name } = socket.handshake.query

    // Check for available emojis
    if (availableEmojis.length > 0) {
      // Shuffle the available emojis initially
      shuffleArray(availableEmojis)

      // Select random emoji
      const randomIndex = Math.floor(Math.random() * availableEmojis.length)
      const emoji = availableEmojis[randomIndex]
      availableEmojis.splice(randomIndex, 1)

      // Initialize user
      users[socket.id] = { id: socket.id, name, emoji, imageCount: 0, state: userState.WAITING }
      console.log(
        `User connected: ${users[socket.id].emoji} ${users[socket.id].name} (${socket.id}) images: ${users[socket.id].imageCount}`
      )

      // Send the updated list of users to all clients
      updateActiveUsers(io)

      socket.emit('userInfo', {
        name: users[socket.id].name,
        emoji: users[socket.id].emoji,
        id: users[socket.id].id,
        imageCount: users[socket.id].imageCount
      })

      // Listen for comments from clients
      socket.on('comment', (data) => {
        console.log(`Comment received from ${data.id} (${data.emoji}): ${data.message}`)
        io.emit('comment', {
          name: data.name,
          message: data.message,
          emoji: data.emoji,
          id: data.id
        })
      })

      // when image is uploaded
      socket.on('imageUploaded', async (uploadData) => {
        let successfulUploads = 0

        for (const img of uploadData) {
          try {
            // Extract the base64 string from the image data (removing "data:image/...;base64," prefix)
            const base64Data = img.image.replace(/^data:image\/\w+;base64,/, '')

            // Convert the base64 string to a Buffer
            const buffer = Buffer.from(base64Data, 'base64')

            const fileData = {
              name: `${img.id}:${img.imageName.replaceAll(' ', '_')}`,
              buffer, // Pass the buffer to upload function
              type: img.type // Adjust this based on your file type (JPEG, PNG, etc.)
            }

            const imageUrl = await SUPERBASE.uploadToSupabase(fileData) // Function to handle image upload

            // Emit back the image URL
            socket.emit('newImage', imageUrl)
            successfulUploads++
          } catch (error) {
            socket.emit('imageAlreadyUsed', 'image already used')
            console.error('Image upload error:', error)
          }
        }

        if (successfulUploads > 0) {
          const userFiles = await SUPERBASE.getFilesStartingWith(socket.id)
          users[socket.id].imageCount = userFiles.length
          if (users[socket.id].imageCount > 4) users[socket.id].state = userState.READY
          updateActiveUsers(io)
          console.log(
            `User ${users[socket.id].emoji} ${users[socket.id].name} (${socket.id}) uploaded ${successfulUploads} new image(s). Total: ${users[socket.id].imageCount}`
          )
          socket.emit(
            'userImgCount',
            `User ${users[socket.id].emoji} ${users[socket.id].name} (${socket.id}) uploaded ${successfulUploads} new image(s). Total: ${users[socket.id].imageCount}`
          )
        }
      })

      socket.on('image-response', (data) => {
        GAME.handleResponse(data)
      })

      // When a client disconnects
      socket.on('disconnect', (reason) => {
        if (users[socket.id]) {
          const disconnectedUser = users[socket.id]
          console.log(
            `User disconnected: ${disconnectedUser.emoji} ${disconnectedUser.name} (${socket.id}) ::: ${reason}`
          )

          io.emit('disconnected', {
            name: disconnectedUser.name,
            emoji: disconnectedUser.emoji,
            id: socket.id
          })

          delete users[socket.id]
          availableEmojis.push(disconnectedUser.emoji)
          updateActiveUsers(io)
        } else {
          console.log(`Unknown user disconnected: ${socket.id}`)
        }
      })
    } else {
      console.log(`No available emojis for user: ${name}`)
      socket.emit('roomIsFull', { message: 'This room is full!' })
      socket.disconnect() // Disconnect the user if no emoji is available
    }
  })
}

// Create a SOCKET object to encapsulate the methods
const SOCKET = {
  setupSocket
}

module.exports = SOCKET
