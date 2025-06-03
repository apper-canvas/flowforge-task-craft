const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let tasksData = []

// Load initial data
import('../mockData/task.json').then(module => {
  tasksData = [...module.default]
})

const taskService = {
  async getAll() {
    await delay(300)
    return [...tasksData]
  },

  async getById(id) {
    await delay(200)
    const task = tasksData.find(task => task.id === id)
    if (!task) throw new Error('Task not found')
    return {...task}
  },

  async create(taskData) {
    await delay(400)
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    tasksData.push(newTask)
    return {...newTask}
  },

  async update(id, taskData) {
    await delay(350)
    const index = tasksData.findIndex(task => task.id === id)
    if (index === -1) throw new Error('Task not found')
    
    tasksData[index] = { ...tasksData[index], ...taskData }
    return {...tasksData[index]}
  },

  async delete(id) {
    await delay(250)
    const index = tasksData.findIndex(task => task.id === id)
    if (index === -1) throw new Error('Task not found')
    
    const deletedTask = tasksData[index]
    tasksData.splice(index, 1)
    return {...deletedTask}
  }
}

export default taskService