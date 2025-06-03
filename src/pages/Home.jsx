import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'
import { taskService, projectService } from '../services'

const Home = () => {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedProject, setSelectedProject] = useState('all')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [tasksResult, projectsResult] = await Promise.all([
          taskService.getAll(),
          projectService.getAll()
        ])
        setTasks(tasksResult)
        setProjects(projectsResult)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredTasks = selectedProject === 'all' 
    ? tasks 
    : tasks.filter(task => task.projectId === selectedProject)

  const completedTasks = filteredTasks.filter(task => task.status === 'completed').length
  const totalTasks = filteredTasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3 text-lg font-medium text-indigo-600"
        >
          <ApperIcon name="Loader2" className="h-6 w-6 animate-spin" />
          <span>Loading FlowForge...</span>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-2xl shadow-neu-light border border-red-100"
        >
          <ApperIcon name="AlertTriangle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <ApperIcon name="Zap" className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  FlowForge
                </h1>
                <p className="text-sm text-indigo-600/70 hidden sm:block">Task Management Simplified</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{totalTasks}</div>
                <div className="text-xs text-indigo-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs text-green-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(progressPercentage)}%</div>
                <div className="text-xs text-purple-500">Progress</div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 shadow-neu-light sticky top-24">
              <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                <ApperIcon name="FolderOpen" className="h-5 w-5 mr-2" />
                Projects
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedProject('all')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                    selectedProject === 'all'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <span className="flex items-center">
                    <ApperIcon name="Grid3X3" className="h-4 w-4 mr-2" />
                    All Projects
                  </span>
                  <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                    {totalTasks}
                  </span>
                </button>
                
                {projects?.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                      selectedProject === project.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white/50 text-indigo-700 hover:bg-white/70 border border-indigo-100'
                    }`}
                  >
                    <span className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </span>
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                      {project.taskCount || 0}
                    </span>
                  </button>
                )) || []}
              </div>
            </div>
          </motion.div>

          {/* Main Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <MainFeature 
              tasks={filteredTasks}
              projects={projects}
              onTaskUpdate={(updatedTasks) => setTasks(updatedTasks)}
              onProjectUpdate={(updatedProjects) => setProjects(updatedProjects)}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Home