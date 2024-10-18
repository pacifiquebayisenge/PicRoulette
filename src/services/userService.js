class UserService {
  constructor() {
    this.user = {
      name: null,
      id: null,
      emoji: null,
      imageCount: 0
    }

    this.userList = []
  }

  // Method to set the user's data
  setUser(name, id, emoji, imageCount) {
    this.user.name = name
    this.user.id = id
    this.user.emoji = emoji
    this.user.imageCount = imageCount
  }

  // Method to get the user's data
  getUser() {
    return this.user
  }

  // Optional: Method to reset user data (if needed)
  clearUser() {
    this.user.name = null
    this.user.id = null
    this.user.emoji = null
    this.user.imageCount = 0
  }

  isAuthenticated() {
    return !!this.user.name // returns true if user is set
  }
}

const userService = new UserService()
export default userService
