import React from 'react'

const RobotLoader = ({ message = "Generating Enhanced PR Campaign Analysis..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Robot Animation Container */}
      <div className="relative">
        {/* Robot Head */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl relative overflow-hidden shadow-lg">
          {/* Robot Eyes */}
          <div className="absolute top-6 left-4 w-4 h-4 bg-white rounded-full robot-eye">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
          <div className="absolute top-6 right-4 w-4 h-4 bg-white rounded-full robot-eye">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Robot Mouth */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full animate-pulse"></div>
          
          {/* Robot Antenna */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-blue-400 rounded-full">
            <div className="w-2 h-2 bg-yellow-400 rounded-full antenna-glow"></div>
          </div>
        </div>
        
        {/* Robot Body */}
        <div className="w-20 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl mx-auto mt-2 relative">
          {/* Robot Chest Light */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full robot-process"></div>
          
          {/* Robot Arms */}
          <div className="absolute top-4 -left-2 w-2 h-8 bg-gray-500 rounded-full animate-bounce">
            <div className="w-3 h-3 bg-gray-300 rounded-full -bottom-1 absolute"></div>
          </div>
          <div className="absolute top-4 -right-2 w-2 h-8 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}>
            <div className="w-3 h-3 bg-gray-300 rounded-full -bottom-1 absolute"></div>
          </div>
        </div>
        
        {/* Robot Legs */}
        <div className="flex justify-center space-x-2 mt-1">
          <div className="w-3 h-6 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-6 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        {/* Processing Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        {/* Data Stream Animation */}
        <div className="absolute -right-8 top-8 space-y-1">
          <div className="w-1 h-3 bg-green-400 rounded-full data-stream"></div>
          <div className="w-1 h-2 bg-blue-400 rounded-full data-stream" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-4 bg-purple-400 rounded-full data-stream" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <div className="absolute -left-8 top-8 space-y-1">
          <div className="w-1 h-2 bg-yellow-400 rounded-full data-stream"></div>
          <div className="w-1 h-3 bg-red-400 rounded-full data-stream" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-1 h-2 bg-cyan-400 rounded-full data-stream" style={{ animationDelay: '0.1s' }}></div>
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 animate-pulse">
          {message}
        </h3>
        <p className="text-sm text-gray-600">
          AI is analyzing your campaign data...
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
      
      {/* Status Indicators */}
      <div className="flex space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Processing Data</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <span>AI Analysis</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <span>Generating Insights</span>
        </div>
      </div>
    </div>
  )
}

export default RobotLoader 