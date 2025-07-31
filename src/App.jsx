import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import CampaignBuilder from './components/CampaignBuilder'
import AnalysisResults from './components/AnalysisResults'
import Header from './components/Header'

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route 
            path="/" 
            element={
              <CampaignBuilder 
                setCurrentAnalysis={setCurrentAnalysis}
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
    </div>
  )
}

export default App 