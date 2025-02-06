class GameService {
    constructor() {    
  
      this.userList = []
    }

  
    setUserList(userList) {
      this.userList = userList
    }
  
    getUserList() {
      return this.userList
    }
  
    
  }
  
  const gameService = new GameService()
  export default gameService
  