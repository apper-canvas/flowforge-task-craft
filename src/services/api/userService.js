const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let usersData = []

// Load initial data
import('../mockData/user.json').then(module => {
  usersData = [...module.default]
})

const userService = {
  async getAll() {
    await delay(300)
    return [...usersData]
  },

  async getById(id) {
    await delay(200)
    const user = usersData.find(user => user.id === id)
    if (!user) throw new Error('User not found')
    return {...user}
  },

  async create(userData) {
    await delay(400)
    const newUser = {
      ...userData,
      id: Date.now().toString()
    }
    usersData.push(newUser)
    return {...newUser}
  },

  async update(id, userData) {
    await delay(350)
    const index = usersData.findIndex(user => user.id === id)
    if (index === -1) throw new Error('User not found')
    
    usersData[index] = { ...usersData[index], ...userData }
    return {...usersData[index]}
  },

  async delete(id) {
    await delay(250)
    const index = usersData.findIndex(user => user.id === id)
    if (index === -1) throw new Error('User not found')
    
    const deletedUser = usersData[index]
    usersData.splice(index, 1)
    return {...deletedUser}
  }
}

export default userService