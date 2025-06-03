import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from './ApperIcon'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { taskService } from '../services'

const MainFeature = ({ tasks, projects, onTaskUpdate }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [sortBy, setSortBy] = useState('dueDate')
  const [filterStatus, setFilterStatus] = useState('all')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    projectId: '',
    tags: []
  })

  const priorityColors = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    urgent: 'bg-red-100 text-red-700 border-red-200'
  }

  const statusColors = {
    todo: 'bg-gray-100 text-gray-700 border-gray-200',
    'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200'
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) {
      toast.error('Task title is required')
      return
    }

    try {
      const taskData = {
        ...newTask,
        createdAt: new Date().toISOString(),
        completedAt: newTask.status === 'completed' ? new Date().toISOString() : null,
        subtasks: []
      }
      
      const createdTask = await taskService.create(taskData)
      const updatedTasks = await taskService.getAll()
      onTaskUpdate(updatedTasks)
      
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        projectId: '',
        tags: []
      })
      setIsCreateModalOpen(false)
      toast.success('Task created successfully!')
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleUpdateTask = async (e) => {
    e.preventDefault()
    if (!editingTask?.title?.trim()) {
      toast.error('Task title is required')
      return
    }

    try {
      const taskData = {
        ...editingTask,
        completedAt: editingTask.status === 'completed' && 
                    tasks.find(t => t.id === editingTask.id)?.status !== 'completed'
                    ? new Date().toISOString() 
                    : editingTask.completedAt
      }
      
      await taskService.update(editingTask.id, taskData)
      const updatedTasks = await taskService.getAll()
      onTaskUpdate(updatedTasks)
      
      setIsEditModalOpen(false)
      setEditingTask(null)
      toast.success('Task updated successfully!')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId)
      const updatedTasks = await taskService.getAll()
      onTaskUpdate(updatedTasks)
      toast.success('Task deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      const taskData = {
        ...task,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      }
      
      await taskService.update(taskId, taskData)
      const updatedTasks = await taskService.getAll()
      onTaskUpdate(updatedTasks)
      
      toast.success(`Task marked as ${newStatus.replace('-', ' ')}!`)
    } catch (error) {
      toast.error('Failed to update task status')
    }
  }

  const getFilteredAndSortedTasks = () => {
    let filtered = tasks || []
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus)
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })
  }

  const getProjectName = (projectId) => {
    const project = projects?.find(p => p.id === projectId)
    return project?.name || 'No Project'
  }

  const getProjectColor = (projectId) => {
    const project = projects?.find(p => p.id === projectId)
    return project?.color || '#6366f1'
  }

  const filteredTasks = getFilteredAndSortedTasks()

  const renderTaskCard = (task) => (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="border-l-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50/50"
            style={{ borderLeftColor: getProjectColor(task.projectId) }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={(checked) => 
                  handleStatusChange(task.id, checked ? 'completed' : 'todo')
                }
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <CardTitle className={`text-lg leading-tight ${
                  task.status === 'completed' 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-900'
                }`}>
                  {task.title}
                </CardTitle>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingTask(task)
                  setIsEditModalOpen(true)
                }}
                className="h-8 w-8 p-0 hover:bg-indigo-100"
              >
                <ApperIcon name="Edit" className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTask(task.id)}
                className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
              >
                <ApperIcon name="Trash2" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={priorityColors[task.priority]}>
              <ApperIcon 
                name={
                  task.priority === 'urgent' ? 'AlertTriangle' :
                  task.priority === 'high' ? 'ArrowUp' :
                  task.priority === 'medium' ? 'Minus' : 'ArrowDown'
                } 
                className="h-3 w-3 mr-1" 
              />
              {task.priority}
            </Badge>
            
            <Badge variant="outline" className={statusColors[task.status]}>
              <ApperIcon 
                name={
                  task.status === 'completed' ? 'CheckCircle' :
                  task.status === 'in-progress' ? 'Clock' : 'Circle'
                } 
                className="h-3 w-3 mr-1" 
              />
              {task.status.replace('-', ' ')}
            </Badge>
            
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              <div 
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: getProjectColor(task.projectId) }}
              />
              {getProjectName(task.projectId)}
            </Badge>
            
            {task.dueDate && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <ApperIcon name="Calendar" className="h-3 w-3 mr-1" />
                {format(new Date(task.dueDate), 'MMM dd')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderBoardView = () => {
    const statusGroups = {
      todo: { title: 'To Do', icon: 'Circle', color: 'gray' },
      'in-progress': { title: 'In Progress', icon: 'Clock', color: 'blue' },
      completed: { title: 'Completed', icon: 'CheckCircle', color: 'green' }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(statusGroups).map(([status, config]) => {
          const statusTasks = filteredTasks.filter(task => task.status === status)
          
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold text-${config.color}-700 flex items-center`}>
                  <ApperIcon name={config.icon} className="h-5 w-5 mr-2" />
                  {config.title}
                </h3>
                <Badge variant="secondary" className="bg-gray-100">
                  {statusTasks.length}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                  {statusTasks.map(renderTaskCard)}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 gap-4">
          <div className="flex items-center space-x-4">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8"
              >
                <ApperIcon name="List" className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('board')}
                className="h-8"
              >
                <ApperIcon name="Columns" className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="created">Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Task Display */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-2xl border border-indigo-100"
        >
          <ApperIcon name="ListTodo" className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-indigo-700 mb-2">No tasks found</h3>
          <p className="text-indigo-500 mb-6">
            {filterStatus === 'all' 
              ? "Get started by creating your first task!"
              : `No ${filterStatus.replace('-', ' ')} tasks to show.`
            }
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </motion.div>
      ) : (
        <>
          {viewMode === 'board' ? renderBoardView() : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredTasks.map(renderTaskCard)}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Create Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
              Create New Task
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Add task description..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newTask.status} onValueChange={(value) => setNewTask({...newTask, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="project">Project</Label>
                <Select value={newTask.projectId} onValueChange={(value) => setNewTask({...newTask, projectId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                Create Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ApperIcon name="Edit" className="h-5 w-5 mr-2" />
              Edit Task
            </DialogTitle>
          </DialogHeader>
          
          {editingTask && (
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <Label htmlFor="editTitle">Title *</Label>
                <Input
                  id="editTitle"
                  value={editingTask.title || ''}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  placeholder="Enter task title..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  placeholder="Add task description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPriority">Priority</Label>
                  <Select value={editingTask.priority} onValueChange={(value) => setEditingTask({...editingTask, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select value={editingTask.status} onValueChange={(value) => setEditingTask({...editingTask, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDueDate">Due Date</Label>
                  <Input
                    id="editDueDate"
                    type="date"
                    value={editingTask.dueDate || ''}
                    onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="editProject">Project</Label>
                  <Select value={editingTask.projectId || ''} onValueChange={(value) => setEditingTask({...editingTask, projectId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  Update Task
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MainFeature