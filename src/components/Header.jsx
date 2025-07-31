import React from 'react'
import { Bot, Sparkles } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                NexPR
              </h1>
              <p className="text-sm text-gray-600">Replace your marketing team with AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Qloo Analysis Active</span>
            <Sparkles className="w-4 h-4 text-green-600" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 