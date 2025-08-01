import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit, 
  Target, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  Lightbulb,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Activity,
  PieChart,
  BarChart,
  Globe,
  Bot
} from 'lucide-react'
import toast from 'react-hot-toast'
import RobotLoader from './RobotLoader'
import Chatbot from './Chatbot'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2'
import { 
  getQlooBasicInsights, 
  getQlooAudienceData, 
  getQlooGeospatialInsights,
  generateStructuredAnalyticsData 
} from '../services/geminiService.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

const AnalysisResults = ({ analysis }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [analyticsSource, setAnalyticsSource] = useState('')

  useEffect(() => {
    // Debug: Log the incoming analysis data
    console.log('=== ANALYSIS DATA DEBUG ===');
    console.log('Full analysis object:', analysis);
    console.log('Qloo insights:', analysis?.qlooInsights);
    console.log('Qloo data:', analysis?.qlooData);
    console.log('Raw Qloo data:', analysis?.qlooInsights?.rawData);
    console.log('Final analysis:', analysis?.qlooInsights?.finalAnalysis);
    console.log('Analytics data:', analysis?.qlooInsights?.finalAnalysis?.analyticsData);
    console.log('Campaign data:', analysis?.campaignData);
    console.log('================================');

    if (analysis?.campaignData) {
      generateEnhancedAnalytics(analysis)
      } else {
      setLoadingAnalytics(false)
      setAnalyticsData(null)
    }
  }, [analysis])

  const generateEnhancedAnalytics = async (analysisData) => {
    setLoadingAnalytics(true)
    console.log('Generating enhanced analytics with Qloo API and Gemini...')
    
    try {
      const campaignData = analysisData.campaignData
      const entityIds = analysisData.qlooData?.results?.filter(r => r.success)?.map(r => r.data?.entity_id).filter(Boolean) || []
      
      console.log('Campaign data:', campaignData)
      console.log('Entity IDs for Qloo API:', entityIds)
      
      // Generate sample entity IDs if none available (for demo purposes)
      const demoEntityIds = entityIds.length > 0 ? entityIds : ['demo-entity-1', 'demo-entity-2']
      
      // Step 1: Get Qloo Basic Insights
      console.log('Fetching Qloo basic insights...')
      const basicInsights = await getQlooBasicInsights(demoEntityIds, 'urn:entity:artist')
      console.log('Basic insights result:', basicInsights)
      
      // Step 2: Get Qloo Audience Data
      console.log('Fetching Qloo audience data...')
      const audienceData = await getQlooAudienceData(demoEntityIds, 'urn:audience:communities')
      console.log('Audience data result:', audienceData)
      
      // Step 3: Get Qloo Geospatial Insights (using demo coordinates)
      console.log('Fetching Qloo geospatial insights...')
      const geospatialData = await getQlooGeospatialInsights(
        demoEntityIds[0] || 'demo-entity-1', 
        40.7128, // New York coordinates as demo
        -74.0060, 
        50
      )
      console.log('Geospatial data result:', geospatialData)
      
      // Step 4: Generate structured analytics data with Gemini
      console.log('Generating structured analytics with Gemini...')
      
      const [basicAnalytics, audienceAnalytics, geospatialAnalytics] = await Promise.all([
        generateStructuredAnalyticsData(basicInsights, campaignData, 'basicInsights'),
        generateStructuredAnalyticsData(audienceData, campaignData, 'audienceData'),
        generateStructuredAnalyticsData(geospatialData, campaignData, 'geospatialData')
      ])
      
      console.log('Generated analytics:', {
        basic: basicAnalytics,
        audience: audienceAnalytics,
        geospatial: geospatialAnalytics
      })
      
      // Step 5: Combine all analytics data
      const combinedAnalytics = {
        // Basic Insights
        ageDemographics: basicAnalytics.data?.ageDemographics || basicAnalytics.fallbackData?.ageDemographics,
        culturalRelevance: basicAnalytics.data?.culturalRelevance || basicAnalytics.fallbackData?.culturalRelevance,
        topCulturalTags: basicAnalytics.data?.topCulturalTags || basicAnalytics.fallbackData?.topCulturalTags,
        
        // Audience Data
        audienceSegments: audienceAnalytics.data?.audienceSegments || audienceAnalytics.fallbackData?.audienceSegments,
        demographicBreakdown: audienceAnalytics.data?.demographicBreakdown || audienceAnalytics.fallbackData?.demographicBreakdown,
        psychographicProfiles: audienceAnalytics.data?.psychographicProfiles || audienceAnalytics.fallbackData?.psychographicProfiles,
        engagementLevels: audienceAnalytics.data?.engagementLevels || audienceAnalytics.fallbackData?.engagementLevels,
        
        // Geospatial Data
        locationAffinity: geospatialAnalytics.data?.locationAffinity || geospatialAnalytics.fallbackData?.locationAffinity,
        culturalHeatmap: geospatialAnalytics.data?.culturalHeatmap || geospatialAnalytics.fallbackData?.culturalHeatmap,
        regionalInsights: geospatialAnalytics.data?.regionalInsights || geospatialAnalytics.fallbackData?.regionalInsights,
        locationMetrics: geospatialAnalytics.data?.locationMetrics || geospatialAnalytics.fallbackData?.locationMetrics,
        
        // Key Metrics (calculated from all data)
        keyMetrics: {
          labels: ["Brand Awareness", "Cultural Relevance", "Audience Engagement", "Market Penetration", "ROI Potential"],
      datasets: [{
            label: "Key Performance Metrics",
            data: [
              basicAnalytics.data?.confidence * 100 || 75,
              basicAnalytics.data?.culturalRelevance?.datasets?.[0]?.data?.[0] || 45,
              audienceAnalytics.data?.engagementLevels?.datasets?.[0]?.data?.[0] || 35,
              geospatialAnalytics.data?.locationMetrics?.datasets?.[0]?.data?.[2] || 45,
              Math.round((basicAnalytics.data?.confidence || 0.75) * 320)
            ],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
          }]
        },
        
        // Data source information
        dataSource: {
          basicInsights: basicAnalytics.source || 'Gemini Generated',
          audienceData: audienceAnalytics.source || 'Gemini Generated',
          geospatialData: geospatialAnalytics.source || 'Gemini Generated',
          qlooApiSuccess: basicInsights.success || audienceData.success || geospatialData.success
        }
      }
      
      console.log('Combined analytics data:', combinedAnalytics)
      setAnalyticsData(combinedAnalytics)
      
      // Set analytics source for UI display
      const hasQlooData = basicInsights.success || audienceData.success || geospatialData.success
      setAnalyticsSource(hasQlooData ? 'Real-Time Qloo API + Gemini AI' : 'Gemini AI Generated')
      
    } catch (error) {
      console.error('Error generating enhanced analytics:', error)
      toast.error('Failed to generate analytics. Using fallback data.')
      
      // Use fallback data
      const fallbackAnalytics = {
        ageDemographics: {
          labels: ["18-24", "25-34", "35-44", "45-54", "55+"],
      datasets: [{
            data: [25, 35, 20, 15, 5],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
          }]
        },
        culturalRelevance: {
          labels: ["Highly Relevant", "Relevant", "Somewhat Relevant", "Not Relevant"],
      datasets: [{
            label: "Cultural Relevance",
            data: [45, 35, 15, 5],
            backgroundColor: ["#9C27B0", "#3F51B5", "#009688", "#795548"]
          }]
        },
        audienceSegments: {
          labels: ["Primary Audience", "Secondary Audience", "Tertiary Audience", "Niche Audience"],
      datasets: [{
            data: [40, 30, 20, 10],
            backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#9C27B0"]
          }]
        },
        locationAffinity: {
          labels: [analysisData.campaignData?.location || "Target Location", "Major Cities", "Suburban Areas", "Rural Areas"],
      datasets: [{
            data: [60, 25, 10, 5],
            backgroundColor: ["#E91E63", "#00BCD4", "#8BC34A", "#FFC107"]
          }]
        },
        keyMetrics: {
          labels: ["Brand Awareness", "Cultural Relevance", "Audience Engagement", "Market Penetration", "ROI Potential"],
      datasets: [{
            label: "Key Performance Metrics",
            data: [75, 68, 45, 30, 240],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
          }]
        },
        dataSource: {
          basicInsights: 'Fallback Data',
          audienceData: 'Fallback Data',
          geospatialData: 'Fallback Data',
          qlooApiSuccess: false
        }
      }
      
      setAnalyticsData(fallbackAnalytics)
      setAnalyticsSource('Fallback Data')
    } finally {
      setLoadingAnalytics(false)
    }
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">No analysis data available</div>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Create New Campaign
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'strategy', label: 'Strategy', icon: MessageSquare },
    { id: 'implementation', label: 'Implementation', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'measurement', label: 'Measurement', icon: BarChart },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
  ]

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-primary-600" />
          Executive Summary
        </h3>
        <p className="text-gray-700 leading-relaxed">{analysis.overview?.executiveSummary}</p>
      </div>

      {/* Key Objectives */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Objectives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.overview?.keyObjectives?.map((objective, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-primary-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{objective}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-primary-600" />
          Target Audience
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Primary Audience</h4>
            <p className="text-gray-600">{analysis.overview?.targetAudience?.primary}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Secondary Audience</h4>
            <p className="text-gray-600">{analysis.overview?.targetAudience?.secondary}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
            <p className="text-gray-600">{analysis.overview?.targetAudience?.demographics}</p>
          </div>
        </div>
      </div>

      {/* Unique Value Proposition */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
          Unique Value Proposition
        </h3>
        <p className="text-gray-700 leading-relaxed">{analysis.overview?.uniqueValueProposition}</p>
      </div>
    </div>
  )

  const renderStrategy = () => (
    <div className="space-y-8">
      {/* Real Qloo Insights */}
      {analysis.qlooInsights?.finalAnalysis && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-primary-600" />
            Real Qloo Cultural Intelligence
          </h3>
          
          <div className="space-y-6">
            {/* Cultural Insights */}
            {analysis.qlooInsights.finalAnalysis.culturalInsights && (
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-gray-900 mb-3">Cultural Insights & Trends</h4>
                <div className="space-y-2">
                  {analysis.qlooInsights.finalAnalysis.culturalInsights.keyTrends?.map((trend, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{trend}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    <strong>Cultural Domains:</strong> {analysis.qlooInsights.finalAnalysis.culturalInsights.culturalDomains?.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Confidence Score:</strong> {(analysis.qlooInsights.finalAnalysis.culturalInsights.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {/* Audience Analysis */}
            {analysis.qlooInsights.finalAnalysis.audienceAnalysis && (
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900 mb-3">Target Audience Analysis</h4>
                <div className="space-y-2">
                  <p><strong>Primary Audience:</strong> {analysis.qlooInsights.finalAnalysis.audienceAnalysis.primaryAudience}</p>
                  <p><strong>Secondary Audience:</strong> {analysis.qlooInsights.finalAnalysis.audienceAnalysis.secondaryAudience}</p>
                  <p><strong>Engagement Score:</strong> {(analysis.qlooInsights.finalAnalysis.audienceAnalysis.engagementScore * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}

            {/* Geographic Opportunities */}
            {analysis.qlooInsights.finalAnalysis.geographicOpportunities && (
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-gray-900 mb-3">Geographic Opportunities</h4>
                <div className="space-y-2">
                  <p><strong>Top Locations:</strong> {analysis.qlooInsights.finalAnalysis.geographicOpportunities.topLocations?.join(', ')}</p>
                  <p><strong>Expansion Potential:</strong> {(analysis.qlooInsights.finalAnalysis.geographicOpportunities.expansionPotential * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}

            {/* Competitive Positioning */}
            {analysis.qlooInsights.finalAnalysis.competitivePositioning && (
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium text-gray-900 mb-3">Competitive Positioning</h4>
                <div className="space-y-2">
                  <p><strong>Market Overlap:</strong> {(analysis.qlooInsights.finalAnalysis.competitivePositioning.overlapScore * 100).toFixed(1)}%</p>
                  <div>
                    <strong>Key Differentiators:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {analysis.qlooInsights.finalAnalysis.competitivePositioning.differentiation?.map((diff, index) => (
                        <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          {diff}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Strategic Recommendations */}
            {analysis.qlooInsights.finalAnalysis.strategicRecommendations && (
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium text-gray-900 mb-3">Strategic Recommendations</h4>
                <div className="space-y-2">
                  {analysis.qlooInsights.finalAnalysis.strategicRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Relations */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
          Media Relations Strategy
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Key Messages</h4>
            <div className="space-y-2">
              {analysis.strategy?.mediaRelations?.keyMessages?.map((message, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{message}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Story Angles</h4>
            <div className="space-y-2">
              {analysis.strategy?.mediaRelations?.storyAngles?.map((angle, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{angle}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Target Media Outlets</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.strategy?.mediaRelations?.targetMedia?.map((media, index) => (
                <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {media}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Pitch Strategy</h4>
            <p className="text-gray-700">{analysis.strategy?.mediaRelations?.pitchStrategy}</p>
          </div>
        </div>
      </div>

      {/* Content Strategy */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-primary-600" />
          Content Strategy
        </h3>
        
        <div className="space-y-6">
          {/* Press Release */}
          <div className="border-l-4 border-primary-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Press Release</h4>
            <div className="space-y-2">
              <p><strong>Headline:</strong> {analysis.strategy?.contentStrategy?.pressRelease?.headline}</p>
              <p><strong>Subheadline:</strong> {analysis.strategy?.contentStrategy?.pressRelease?.subheadline}</p>
              <div>
                <strong>Key Points:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {analysis.strategy?.contentStrategy?.pressRelease?.keyPoints?.map((point, index) => (
                    <li key={index} className="text-gray-700">{point}</li>
                  ))}
                </ul>
              </div>
              <p><strong>Call to Action:</strong> {analysis.strategy?.contentStrategy?.pressRelease?.callToAction}</p>
            </div>
          </div>

          {/* Social Media */}
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Social Media Strategy</h4>
            <div className="space-y-2">
              <p><strong>Platforms:</strong> {analysis.strategy?.contentStrategy?.socialMedia?.platforms?.join(', ')}</p>
              <p><strong>Content Types:</strong> {analysis.strategy?.contentStrategy?.socialMedia?.contentTypes?.join(', ')}</p>
              <p><strong>Messaging:</strong> {analysis.strategy?.contentStrategy?.socialMedia?.messaging}</p>
            </div>
          </div>

          {/* Blog Content */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Blog Content Strategy</h4>
            <div className="space-y-2">
              <div>
                <strong>Topics:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {analysis.strategy?.contentStrategy?.blogContent?.topics?.map((topic, index) => (
                    <li key={index} className="text-gray-700">{topic}</li>
                  ))}
                </ul>
              </div>
              <p><strong>Tone:</strong> {analysis.strategy?.contentStrategy?.blogContent?.tone}</p>
              <p><strong>Distribution:</strong> {analysis.strategy?.contentStrategy?.blogContent?.distribution}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Management */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          Crisis Management
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Potential Risks</h4>
            <div className="space-y-2">
              {analysis.strategy?.crisisManagement?.potentialRisks?.map((risk, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{risk}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Response Strategy</h4>
            <p className="text-gray-700">{analysis.strategy?.crisisManagement?.responseStrategy}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Spokesperson</h4>
            <p className="text-gray-700">{analysis.strategy?.crisisManagement?.spokesperson}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderImplementation = () => (
    <div className="space-y-8">
      {/* Timeline */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary-600" />
          Implementation Timeline
        </h3>
        
        <div className="space-y-6">
          {['phase1', 'phase2', 'phase3'].map((phase, index) => (
            <div key={phase} className="border-l-4 border-primary-500 pl-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-medium text-gray-900">Phase {index + 1}</h4>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {analysis.implementation?.timeline?.[phase]?.duration}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Activities</h5>
                  <ul className="space-y-1">
                    {analysis.implementation?.timeline?.[phase]?.activities?.map((activity, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Deliverables</h5>
                  <ul className="space-y-1">
                    {analysis.implementation?.timeline?.[phase]?.deliverables?.map((deliverable, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Allocation */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
          Budget Allocation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analysis.implementation?.budgetAllocation || {}).map(([category, percentage]) => (
            <div key={category} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-lg font-bold text-primary-600">{percentage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: percentage }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Requirements */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-primary-600" />
          Team Requirements
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Roles</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.implementation?.teamRequirements?.roles?.map((role, index) => (
                <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {role}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Responsibilities</h4>
            <p className="text-gray-700">{analysis.implementation?.teamRequirements?.responsibilities}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">External Partners</h4>
            <p className="text-gray-700">{analysis.implementation?.teamRequirements?.externalPartners}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMeasurement = () => (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
          Key Performance Indicators
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(analysis.measurement?.kpis || {}).map(([category, kpis]) => (
            <div key={category} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 capitalize">{category}</h4>
              <ul className="space-y-2">
                {kpis.map((kpi, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{kpi}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Measurement Tools</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.measurement?.tools?.map((tool, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Reporting Schedule */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary-600" />
          Reporting Schedule
        </h3>
        <p className="text-gray-700">{analysis.measurement?.reportingSchedule}</p>
      </div>
    </div>
  )

  const renderAnalytics = () => {
    if (loadingAnalytics) {
      return (
        <div className="text-center py-12">
          <RobotLoader message="Generating Enhanced Analytics with Qloo Intelligence..." />
        </div>
      )
    }

    if (!analyticsData) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analytics Data Available</h3>
            <p className="text-gray-600 mb-4">
              Unable to generate analytics. Please check your campaign data and try again.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {/* Enhanced Data Source Indicator */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold text-green-800">Enhanced Qloo Analytics</h3>
              <p className="text-sm text-green-700">
                {analyticsSource} - Comprehensive cultural intelligence with audience and geospatial insights
              </p>
              {analyticsData.dataSource && (
                <div className="mt-2 text-xs text-green-600">
                  <span className="font-medium">Data Sources:</span> 
                  Basic Insights: {analyticsData.dataSource.basicInsights} | 
                  Audience Data: {analyticsData.dataSource.audienceData} | 
                  Geospatial: {analyticsData.dataSource.geospatialData}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Age Demographics */}
        {analyticsData.ageDemographics && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              Age Demographics Analysis
            </h3>
            <p className="text-gray-600 mb-4">Age-based cultural engagement analysis from Qloo demographic insights</p>
            <div className="chart-container">
              <Doughnut
                data={analyticsData.ageDemographics}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#374151' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed}%`
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Cultural Relevance */}
        {analyticsData.culturalRelevance && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-primary-600" />
              Cultural Relevance Assessment
            </h3>
            <p className="text-gray-600 mb-4">Cultural alignment analysis based on Qloo cultural intelligence data</p>
            <div className="chart-container">
              <Bar
                data={analyticsData.culturalRelevance}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#374151' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed.y}%`
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%'
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Audience Segments */}
        {analyticsData.audienceSegments && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary-600" />
              Audience Segmentation
            </h3>
            <p className="text-gray-600 mb-4">Audience breakdown based on Qloo audience intelligence and demographic analysis</p>
            <div className="chart-container">
              <Pie
                data={analyticsData.audienceSegments}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#374151' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed}%`
                          }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Demographic Breakdown */}
        {analyticsData.demographicBreakdown && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-primary-600" />
              Demographic Breakdown
            </h3>
            <p className="text-gray-600 mb-4">Generational analysis from Qloo demographic intelligence</p>
            <div className="chart-container">
              <Bar
                data={analyticsData.demographicBreakdown}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#374151' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed.y}%`
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%'
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Location Affinity */}
        {analyticsData.locationAffinity && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" />
              Location Affinity Analysis
            </h3>
            <p className="text-gray-600 mb-4">Geographic cultural affinity from Qloo geospatial intelligence</p>
            <div className="chart-container">
              <Doughnut
                data={analyticsData.locationAffinity}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#374151' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed}%`
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Cultural Heatmap */}
        {analyticsData.culturalHeatmap && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Cultural Heatmap
            </h3>
            <p className="text-gray-600 mb-4">Cultural affinity distribution from Qloo geospatial analysis</p>
            <div className="chart-container">
              <Bar
                data={analyticsData.culturalHeatmap}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#374151' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed.y}%`
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%'
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Engagement Levels */}
        {analyticsData.engagementLevels && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-600" />
              Audience Engagement Levels
            </h3>
            <p className="text-gray-600 mb-4">Engagement analysis from Qloo audience intelligence</p>
            <div className="chart-container">
              <Doughnut
                data={analyticsData.engagementLevels}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#374151' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed}%`
                        }
                      }
                    }
                  }
                }}
              />
                      </div>
                          </div>
        )}

        {/* Key Metrics */}
        {analyticsData.keyMetrics && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
              Key Performance Metrics
            </h3>
            <p className="text-gray-600 mb-4">Comprehensive metrics calculated from Qloo cultural intelligence and audience data</p>
            <div className="chart-container">
              <Bar
                data={analyticsData.keyMetrics}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#374151' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.dataset.label || ''
                          const value = context.parsed.y
                          if (label.includes('ROI')) {
                            return `${label}: ${value}%`
                          }
                          return `${label}: ${value}%`
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value + '%'
                        }
                      }
                    }
                  }
                }}
              />
                        </div>
                      </div>
        )}

        {/* Cultural Tags */}
        {analyticsData.topCulturalTags && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              Top Cultural Tags
            </h3>
            <p className="text-gray-600 mb-4">Key cultural characteristics identified from Qloo cultural intelligence</p>
            <div className="flex flex-wrap gap-2">
              {analyticsData.topCulturalTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-primary-100 to-purple-100 text-primary-800 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
                    </div>
                    </div>
        )}

        {/* Regional Insights */}
        {analyticsData.regionalInsights && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-primary-600" />
              Regional Cultural Insights
            </h3>
            <p className="text-gray-600 mb-4">Location-based cultural insights from Qloo geospatial analysis</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyticsData.regionalInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Psychographic Profiles */}
        {analyticsData.psychographicProfiles && (
          <div className="analytics-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              Psychographic Profiles
            </h3>
            <p className="text-gray-600 mb-4">Audience personality profiles from Qloo audience intelligence</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyticsData.psychographicProfiles.map((profile, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-800">{profile}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderRecommendations = () => (
    <div className="space-y-8">
      {/* Immediate Actions */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Immediate Actions (Next 30 Days)
        </h3>
        <div className="space-y-3">
          {analysis.recommendations?.immediate?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Short Term */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Short Term (1-3 Months)
        </h3>
        <div className="space-y-3">
          {analysis.recommendations?.shortTerm?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Long Term */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
          Long Term (3-12 Months)
        </h3>
        <div className="space-y-3">
          {analysis.recommendations?.longTerm?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risks & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Potential Risks
          </h3>
          <div className="space-y-3">
            {analysis.recommendations?.risks?.map((risk, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{risk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Opportunities
          </h3>
          <div className="space-y-3">
            {analysis.recommendations?.opportunities?.map((opportunity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{opportunity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'strategy':
        return renderStrategy()
      case 'implementation':
        return renderImplementation()
      case 'analytics':
        return renderAnalytics()
      case 'measurement':
        return renderMeasurement()
      case 'recommendations':
        return renderRecommendations()
      default:
        return renderOverview()
    }
  }

  const handleExport = () => {
    toast.success('Export feature coming soon!')
  }

  const handleShare = () => {
    toast.success('Share feature coming soon!')
  }

  const handleEdit = () => {
    navigate('/')
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Campaign Builder</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={handleEdit}
            className="btn-primary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Campaign</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PR Campaign Analysis Results
        </h1>
        <p className="text-gray-600 mb-4">
          Comprehensive strategy and recommendations for your campaign
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-2 text-blue-800">
            <Bot className="w-4 h-4" />
            <span className="text-sm font-medium">
              💡 Need help? Click the AI Assistant in the bottom-right corner to ask questions about your campaign!
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {renderContent()}
      </div>
      
      {/* AI Campaign Assistant Chatbot */}
      <Chatbot analysisData={analysis} analyticsData={analyticsData} />
    </div>
  )
}

export default AnalysisResults 