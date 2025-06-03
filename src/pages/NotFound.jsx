import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="inline-block p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-neu-light mb-8"
        >
          <ApperIcon name="Search" className="h-16 w-16 text-white" />
        </motion.div>
        
        <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
          Task Not Found
        </h2>
        
        <p className="text-indigo-600/70 mb-8 leading-relaxed">
          Looks like this page has completed itself and moved on! 
          Let's get you back to managing your tasks.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <ApperIcon name="ArrowLeft" className="h-5 w-5 mr-2" />
          Back to FlowForge
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound