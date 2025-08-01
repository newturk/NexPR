import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import CampaignBuilder from './components/CampaignBuilder'
import AnalysisResults from './components/AnalysisResults'
import Header from './components/Header'
import Chatbot from './components/Chatbot'

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [showChatbot, setShowChatbot] = useState(false)

  const handleAnalysisGenerated = (analysis) => {
    console.log('App: Received analysis data:', analysis)
    setCurrentAnalysis(analysis)
    setShowChatbot(true) // Show chatbot after PR campaign is generated
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route 
            path="/" 
            element={
              <CampaignBuilder 
                setCurrentAnalysis={handleAnalysisGenerated}
              />
            } 
          />
          <Route 
            path="/results" 
            element={
              <AnalysisResults 
                analysis={currentAnalysis}
              />
            } 
          />
        </Routes>
      </main>

      {/* Floating Chatbot */}
      <Chatbot isVisible={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  )
}

export default App 