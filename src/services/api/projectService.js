const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let projectsData = []

// Load initial data
import('../mockData/project.json').then(module => {
  projectsData = [...module.default]
})

const projectService = {
  async getAll() {
    await delay(250)
    return [...projectsData]
  },

  async getById(id) {
    await delay(200)
    const project = projectsData.find(project => project.id === id)
    if (!project) throw new Error('Project not found')
    return {...project}
  },

  async create(projectData) {
    await delay(300)
    const newProject = {
      ...projectData,
      id: Date.now().toString(),
      taskCount: 0,
      completedCount: 0
    }
    projectsData.push(newProject)
    return {...newProject}
  },

  async update(id, projectData) {
    await delay(300)
    const index = projectsData.findIndex(project => project.id === id)
    if (index === -1) throw new Error('Project not found')
    
    projectsData[index] = { ...projectsData[index], ...projectData }
    return {...projectsData[index]}
  },

  async delete(id) {
    await delay(200)
    const index = projectsData.findIndex(project => project.id === id)
    if (index === -1) throw new Error('Project not found')
    
    const deletedProject = projectsData[index]
    projectsData.splice(index, 1)
    return {...deletedProject}
  }
}

export default projectService