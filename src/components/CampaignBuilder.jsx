import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Building2, MapPin, Target, DollarSign, FileText, Send, Sparkles } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { generateComprehensivePRCampaignAnalysis } from '../services/geminiService'
import RobotLoader from './RobotLoader'
import Chatbot from './Chatbot'

const CampaignBuilder = ({ setCurrentAnalysis }) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    brandName: '',
    productDetails: '',
    category: '',
    location: '',
    targetScope: '',
    budget: '',
    additionalNotes: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    onDrop: (acceptedFiles) => {
      setUploadedFiles(prev => [...prev, ...acceptedFiles])
      toast.success(`${acceptedFiles.length} file(s) uploaded successfully!`)
    }
  })

  const categories = [
    'Website/App', 'E-commerce', 'SaaS/Software', 'Physical Product', 
    'Service Business', 'Restaurant/Food', 'Fashion/Beauty', 'Health/Wellness',
    'Education', 'Finance', 'Real Estate', 'Entertainment', 'Technology', 'Other'
  ]

  const targetScopes = [
    'Brand Awareness', 'Product Launch', 'Market Expansion', 'Crisis Management',
    'Reputation Building', 'Lead Generation', 'Customer Retention', 'Thought Leadership',
    'Social Recognition', 'Sales Growth', 'Investor Relations', 'Employee Recruitment',
    'Community Engagement', 'Other'
  ]

  const budgetOptions = [
    'Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $25,000',
    '$25,000 - $50,000', '$50,000 - $100,000', 'Over $100,000'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const campaignData = {
        ...formData,
        uploadedFiles: uploadedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
        // Enhanced Qloo service will be automatically called by generateComprehensivePRCampaignAnalysis
      }

      console.log('Generating comprehensive PR campaign analysis...')
      const analysis = await generateComprehensivePRCampaignAnalysis(campaignData)
      
      // Add campaign data to the analysis object so analytics can access it
      const enhancedAnalysis = {
        ...analysis,
        campaignData: campaignData
      }
      
      console.log('Analysis generated successfully:', enhancedAnalysis)
      setCurrentAnalysis(enhancedAnalysis)
      navigate('/results')
      toast.success('Comprehensive PR Campaign Analysis with Enhanced Qloo Intelligence generated successfully!')
    } catch (error) {
      console.error('Error generating analysis:', error)
      toast.error('Failed to generate analysis. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }



  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-purple-50 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">AI-Powered PR Campaign Analysis</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Create Your PR Campaign Strategy
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Replace your marketing team with AI. Generate comprehensive PR campaigns, media strategies, and content plans in minutes.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Campaign Information</h2>
          <p className="text-primary-100 mt-1">Fill in your brand details and campaign requirements</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Brand Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Brand Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your brand name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product/Service Description *
              </label>
              <textarea
                name="productDetails"
                value={formData.productDetails}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Describe your product, service, or what you want to promote..."
                required
              />
            </div>
          </div>

          {/* Target & Location */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Target & Location</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Location *
                </label>
                                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter ANY location worldwide - e.g., Tokyo, Brazil, California, Mumbai, London, Paris, etc."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Search for ANY location worldwide - no restrictions! Enter city names, countries, regions, or any geographic location.
                  </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Scope *
                </label>
                <select
                  name="targetScope"
                  value={formData.targetScope}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select target scope</option>
                  {targetScopes.map(scope => (
                    <option key={scope} value={scope}>{scope}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Budget & Resources */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Budget & Resources</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select budget range</option>
                  {budgetOptions.map(budget => (
                    <option key={budget} value={budget}>{budget}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Any additional context, competitors, or specific requirements..."
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Supporting Materials</h3>
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-primary-600 font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2 font-medium">
                    Drag & drop files here, or click to select files
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: Images, PDFs, Documents (Max 10MB each)
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Generate Enhanced PR Campaign Analysis Button */}
          <div className="flex justify-center pt-8">
            {isLoading ? (
              <RobotLoader message="Generating Enhanced PR Campaign Analysis..." />
            ) : (
              <button
                type="submit"
                className="btn-primary flex items-center space-x-3 px-8 py-4 text-lg font-semibold"
              >
                <Send className="w-5 h-5" />
                <span>Generate Enhanced PR Campaign Analysis</span>
              </button>
            )}
          </div>
        </form>
      </div>



      {/* Info Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🤖 AI-Powered PR Campaign Analysis
            </h3>
            <p className="text-gray-700 mb-4">
              Our AI will analyze your input and generate a comprehensive PR campaign strategy including:
              media relations, content strategy, crisis management, measurement KPIs, and actionable recommendations.
            </p>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">🚀 AI-Powered Real Qloo Intelligence (Automatically Included)</h4>
              <p className="text-gray-700 text-sm">
                Every PR campaign analysis now uses AI to determine the optimal Qloo filters and generate real cultural intelligence:
              </p>
              <ul className="text-gray-700 text-sm mt-2 space-y-1">
                <li>• <strong>AI Filter Selection:</strong> Gemini suggests optimal Qloo filters based on your campaign</li>
                <li>• <strong>Real Qloo API Queries:</strong> Executes suggested filters to get actual cultural data</li>
                <li>• <strong>AI Final Analysis:</strong> Gemini analyzes real Qloo responses for strategic insights</li>
                <li>• <strong>Dynamic Analytics:</strong> Charts and metrics generated from real Qloo data</li>
                <li>• <strong>No Mock Data:</strong> Everything is based on actual cultural intelligence</li>
                <li>• <strong>Campaign-Specific:</strong> Filters tailored to your brand, category, and target scope</li>
                <li>• <strong>Real-Time Intelligence:</strong> Fresh cultural insights for your specific request</li>
              </ul>
              <p className="text-gray-700 text-sm mt-2">
                This provides you with genuine cultural data and market intelligence powered by Qloo's Taste AI™ API, with AI-driven filter optimization for maximum relevance to your campaign.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Campaign Assistant Chatbot */}
      <Chatbot analysisData={null} analyticsData={null} />
    </div>
  )
}

export default CampaignBuilder 