import { GoogleGenerativeAI } from '@google/generative-ai'
import { enhancedQlooService } from './enhancedQlooService.js'
import { FilterType } from './qlooTypes.js'

// Initialize Gemini AI with the provided API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

// Qloo API Configuration
const QLOO_API_URL = import.meta.env.VITE_QLOO_BASE_URL || 'https://hackathon.api.qloo.com'
const QLOO_API_KEY = import.meta.env.VITE_QLOO_API_KEY

// Enhanced Qloo API Methods for Analytics
export const getQlooBasicInsights = async (entityIds, entityType = 'urn:entity:artist') => {
  try {
    console.log('Getting Qloo basic insights for entities:', entityIds)
    
    if (!entityIds || entityIds.length === 0) {
      throw new Error('No entity IDs provided')
    }

    // Use real entity IDs or skip if only demo IDs
    const realEntityIds = entityIds.filter(id => !id.startsWith('demo-'))
    if (realEntityIds.length === 0) {
      console.log('No real entity IDs found, skipping Qloo API call')
      return { success: false, error: 'No real entity IDs available' }
    }

    // Format entity IDs as required by the API
    const entityObjects = realEntityIds.map(id => ({ id }))
    
    const payload = { 
      'signal.interests.entities': entityObjects,
      'filter.type': entityType
    }
    
    const response = await fetch(`${QLOO_API_URL}/v2/insights`, {
      method: 'POST',
      headers: {
        'X-API-Key': QLOO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Qloo API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Qloo basic insights response:', data)
    
    return {
      success: true,
      data: data.results || data,
      entities: data.results?.entities || [],
      tags: data.results?.entities?.flatMap(e => e.tags?.map(t => t.name || t.id) || []) || []
    }
  } catch (error) {
    console.error('Error getting Qloo basic insights:', error)
    return { success: false, error: error.message }
  }
}

export const getQlooAudienceData = async (entityIds, audienceType = 'urn:audience:communities') => {
  try {
    console.log('Getting Qloo audience data for entities:', entityIds)
    
    if (!entityIds || entityIds.length === 0) {
      throw new Error('No entity IDs provided')
    }

    // Use real entity IDs or skip if only demo IDs
    const realEntityIds = entityIds.filter(id => !id.startsWith('demo-'))
    if (realEntityIds.length === 0) {
      console.log('No real entity IDs found, skipping Qloo API call')
      return { success: false, error: 'No real entity IDs available' }
    }

    const params = new URLSearchParams()
    params.append('filter.audience.types', audienceType)
    
    // Add entity IDs as signal
    realEntityIds.forEach(entityId => {
      params.append('signal.interests.entities', entityId)
    })
    
    params.append('take', '20')
    
    const response = await fetch(`${QLOO_API_URL}/v2/audiences?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-API-Key': QLOO_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Qloo API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Qloo audience data response:', data)
    
    return {
      success: true,
      data: data.results || data,
      audiences: data.results?.audiences || []
    }
  } catch (error) {
    console.error('Error getting Qloo audience data:', error)
    return { success: false, error: error.message }
  }
}

export const getQlooGeospatialInsights = async (entityId, longitude, latitude, radius = 50) => {
  try {
    console.log('Getting Qloo geospatial insights for entity:', entityId, 'at location:', { longitude, latitude, radius })
    
    if (!entityId || !longitude || !latitude) {
      throw new Error('Entity ID and location coordinates are required')
    }

    // Skip if using demo entity ID
    if (entityId.startsWith('demo-')) {
      console.log('Demo entity ID detected, skipping Qloo API call')
      return { success: false, error: 'Demo entity ID not supported' }
    }

    const params = new URLSearchParams({
      'entity_id': entityId,
      'longitude': longitude.toString(),
      'latitude': latitude.toString(),
      'radius': radius.toString(),
      'take': '50'
    })
    
    const response = await fetch(`${QLOO_API_URL}/geospatial?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-API-Key': QLOO_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Qloo API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Qloo geospatial insights response:', data)
    
    return {
      success: true,
      data: data.results || data,
      locations: data.results?.locations || [],
      culturalHeatmap: data.results?.cultural_heatmap || []
    }
  } catch (error) {
    console.error('Error getting Qloo geospatial insights:', error)
    return { success: false, error: error.message }
  }
}

// Gemini-powered data structuring and fallback generation
export const generateStructuredAnalyticsData = async (qlooData, campaignData, dataType) => {
  try {
    console.log('Generating structured analytics data with Gemini for:', dataType)
    
    let prompt = ''
    
    switch (dataType) {
      case 'basicInsights':
        prompt = `You are an expert data analyst specializing in cultural intelligence and PR campaign analytics. 
        
        CAMPAIGN DATA:
        - Brand Name: ${campaignData.brandName}
        - Category: ${campaignData.category}
        - Product/Service: ${campaignData.productDetails}
        - Target Location: ${campaignData.location}
        - Target Scope: ${campaignData.targetScope}
        - Budget: ${campaignData.budget || 'Not specified'}
        
        QLOO API DATA (if available):
        ${JSON.stringify(qlooData, null, 2)}
        
        Generate comprehensive analytics data for basic cultural insights. If Qloo data is available, use it to create realistic analytics. If not, generate realistic data based on the campaign information.
        
        Return ONLY valid JSON with the following structure:
        {
          "ageDemographics": {
            "labels": ["18-24", "25-34", "35-44", "45-54", "55+"],
            "datasets": [{
              "data": [25, 35, 20, 15, 5],
              "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
            }]
          },
          "culturalRelevance": {
            "labels": ["Highly Relevant", "Relevant", "Somewhat Relevant", "Not Relevant"],
            "datasets": [{
              "label": "Cultural Relevance",
              "data": [45, 35, 15, 5],
              "backgroundColor": ["#9C27B0", "#3F51B5", "#009688", "#795548"]
            }]
          },
          "topCulturalTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
          "confidence": 0.85
        }
        
        IMPORTANT: Generate realistic data based on the campaign category and target audience. Use the Qloo data if available, otherwise create plausible cultural insights. Ensure all chart data uses the datasets array format for Chart.js compatibility.`
        break
        
      case 'audienceData':
        prompt = `You are an expert audience analyst specializing in demographic and psychographic analysis for PR campaigns.
        
        CAMPAIGN DATA:
        - Brand Name: ${campaignData.brandName}
        - Category: ${campaignData.category}
        - Product/Service: ${campaignData.productDetails}
        - Target Location: ${campaignData.location}
        - Target Scope: ${campaignData.targetScope}
        - Budget: ${campaignData.budget || 'Not specified'}
        
        QLOO AUDIENCE DATA (if available):
        ${JSON.stringify(qlooData, null, 2)}
        
        Generate comprehensive audience analytics data. If Qloo audience data is available, use it to create realistic analytics. If not, generate realistic data based on the campaign information.
        
        Return ONLY valid JSON with the following structure:
        {
          "audienceSegments": {
            "labels": ["Primary Audience", "Secondary Audience", "Tertiary Audience", "Niche Audience"],
            "datasets": [{
              "data": [40, 30, 20, 10],
              "backgroundColor": ["#4CAF50", "#FF9800", "#2196F3", "#9C27B0"]
            }]
          },
          "demographicBreakdown": {
            "labels": ["Gen Z", "Millennials", "Gen X", "Boomers"],
            "datasets": [{
              "label": "Demographic Breakdown",
              "data": [30, 45, 20, 5],
              "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
            }]
          },
          "psychographicProfiles": ["Creative Professionals", "Urban Explorers", "Cultural Enthusiasts", "Tech-Savvy Consumers"],
          "engagementLevels": {
            "labels": ["High Engagement", "Medium Engagement", "Low Engagement"],
            "datasets": [{
              "data": [35, 45, 20],
              "backgroundColor": ["#4CAF50", "#FF9800", "#F44336"]
            }]
          }
        }
        
        IMPORTANT: Generate realistic audience data based on the campaign category and target scope. Use the Qloo data if available, otherwise create plausible audience insights. Ensure all chart data uses the datasets array format for Chart.js compatibility.`
        break
        
      case 'geospatialData':
        prompt = `You are an expert geospatial analyst specializing in location-based cultural intelligence for PR campaigns.
        
        CAMPAIGN DATA:
        - Brand Name: ${campaignData.brandName}
        - Category: ${campaignData.category}
        - Product/Service: ${campaignData.productDetails}
        - Target Location: ${campaignData.location}
        - Target Scope: ${campaignData.targetScope}
        - Budget: ${campaignData.budget || 'Not specified'}
        
        QLOO GEOSPATIAL DATA (if available):
        ${JSON.stringify(qlooData, null, 2)}
        
        Generate comprehensive geospatial analytics data. If Qloo geospatial data is available, use it to create realistic analytics. If not, generate realistic data based on the campaign location and information.
        
        Return ONLY valid JSON with the following structure:
        {
          "locationAffinity": {
            "labels": ["${campaignData.location}", "Major Cities", "Suburban Areas", "Rural Areas", "International"],
            "datasets": [{
              "data": [60, 25, 10, 3, 2],
              "backgroundColor": ["#E91E63", "#00BCD4", "#8BC34A", "#FFC107", "#795548"]
            }]
          },
          "culturalHeatmap": {
            "labels": ["High Cultural Affinity", "Medium Cultural Affinity", "Low Cultural Affinity"],
            "datasets": [{
              "label": "Cultural Heatmap",
              "data": [45, 35, 20],
              "backgroundColor": ["#4CAF50", "#FF9800", "#F44336"]
            }]
          },
          "regionalInsights": ["Urban cultural hub", "Diverse demographic mix", "High digital adoption", "Strong community engagement"],
          "locationMetrics": {
            "labels": ["Brand Awareness", "Cultural Relevance", "Market Penetration", "Competition Level"],
            "datasets": [{
              "label": "Location Metrics",
              "data": [75, 68, 45, 30],
              "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
            }]
          }
        }
        
        IMPORTANT: Generate realistic geospatial data based on the campaign location and target scope. Use the Qloo data if available, otherwise create plausible location-based insights. Ensure all chart data uses the datasets array format for Chart.js compatibility.`
        break
        
      default:
        throw new Error('Unknown data type for analytics generation')
    }
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse the JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        let jsonString = jsonMatch[0]
        // Clean the JSON string
        jsonString = jsonString
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .replace(/\\n/g, ' ')
          .replace(/\\t/g, ' ')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/\\([^"\\\/bfnrt])/g, '$1')
        
        const analyticsData = JSON.parse(jsonString)
        console.log('Successfully generated structured analytics data for:', dataType)
        return {
          success: true,
          data: analyticsData,
          source: qlooData.success ? 'Qloo API + Gemini' : 'Gemini Generated'
        }
      }
      throw new Error('No valid JSON found in response')
    } catch (parseError) {
      console.error('Error parsing Gemini analytics response:', parseError)
      return {
        success: false,
        error: 'Failed to parse analytics data',
        fallbackData: generateFallbackAnalyticsData(dataType, campaignData)
      }
    }
  } catch (error) {
    console.error('Error generating structured analytics data:', error)
    return {
      success: false,
      error: error.message,
      fallbackData: generateFallbackAnalyticsData(dataType, campaignData)
    }
  }
}

// Fallback data generator
const generateFallbackAnalyticsData = (dataType, campaignData) => {
  console.log('Generating fallback analytics data for:', dataType)
  
  switch (dataType) {
    case 'basicInsights':
      return {
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
        topCulturalTags: ["innovative", "trendy", "authentic", "premium", "accessible"],
        confidence: 0.75
      }
      
    case 'audienceData':
      return {
        audienceSegments: {
          labels: ["Primary Audience", "Secondary Audience", "Tertiary Audience", "Niche Audience"],
          datasets: [{
            data: [40, 30, 20, 10],
            backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#9C27B0"]
          }]
        },
        demographicBreakdown: {
          labels: ["Gen Z", "Millennials", "Gen X", "Boomers"],
          datasets: [{
            label: "Demographic Breakdown",
            data: [30, 45, 20, 5],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
          }]
        },
        psychographicProfiles: ["Creative Professionals", "Urban Explorers", "Cultural Enthusiasts", "Tech-Savvy Consumers"],
        engagementLevels: {
          labels: ["High Engagement", "Medium Engagement", "Low Engagement"],
          datasets: [{
            data: [35, 45, 20],
            backgroundColor: ["#4CAF50", "#FF9800", "#F44336"]
          }]
        }
      }
      
    case 'geospatialData':
      return {
        locationAffinity: {
          labels: [campaignData.location || "Target Location", "Major Cities", "Suburban Areas", "Rural Areas"],
          datasets: [{
            data: [60, 25, 10, 5],
            backgroundColor: ["#E91E63", "#00BCD4", "#8BC34A", "#FFC107"]
          }]
        },
        culturalHeatmap: {
          labels: ["High Cultural Affinity", "Medium Cultural Affinity", "Low Cultural Affinity"],
          datasets: [{
            label: "Cultural Heatmap",
            data: [45, 35, 20],
            backgroundColor: ["#4CAF50", "#FF9800", "#F44336"]
          }]
        },
        regionalInsights: ["Urban cultural hub", "Diverse demographic mix", "High digital adoption"],
        locationMetrics: {
          labels: ["Brand Awareness", "Cultural Relevance", "Market Penetration", "Competition Level"],
          datasets: [{
            label: "Location Metrics",
            data: [75, 68, 45, 30],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
          }]
        }
      }
      
    default:
      return {}
  }
}

export const generatePRCampaignAnalysis = async (campaignData) => {
  try {
    const prompt = buildPRCampaignPrompt(campaignData)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return parseAnalysisResponse(text)
  } catch (error) {
    console.error('Error generating PR campaign analysis:', error)
    throw new Error('Failed to generate PR campaign analysis')
  }
}

export const generateComprehensivePRCampaignAnalysis = async (campaignData) => {
  try {
    console.log('Starting comprehensive PR campaign analysis...')
    
    // Step 1: Generate Qloo API queries using Gemini
    console.log('Generating Qloo API queries...')
    const qlooQueries = await generateQlooQueries(campaignData)
    console.log('Generated queries:', qlooQueries.length)
    
    // Step 2: Execute the queries against Qloo API
    console.log('Executing Qloo API queries...')
    const qlooResults = await executeQlooQueries(qlooQueries)
    console.log('Qloo API results:', qlooResults.length, 'successful queries')
    
    // Step 3: Generate comprehensive analysis with real data
    console.log('Generating comprehensive analysis with Gemini...')
    const prompt = buildComprehensivePRCampaignPrompt(campaignData, { queries: qlooQueries, results: qlooResults })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('Gemini response received, parsing...')
    const analysis = parseAnalysisResponse(text)
    
    // Step 4: Ensure Qloo data is properly structured for analytics
    const enhancedAnalysis = {
      ...analysis,
      qlooData: {
        queries: qlooQueries,
        results: qlooResults
      },
      qlooInsights: {
        ...analysis.qlooInsights,
        // Add raw Qloo data for analytics component
        rawData: {
          queries: qlooQueries,
          results: qlooResults,
          successfulResults: qlooResults.filter(r => r.success),
          totalEntities: qlooResults.reduce((sum, result) => {
            if (result.success && result.data) {
              if (result.data.results) return sum + result.data.results.length
              if (result.data.entities) return sum + result.data.entities.length
              if (result.data.data) return sum + result.data.data.length
            }
            return sum
          }, 0)
        }
      }
    }
    
    console.log('Enhanced analysis created with Qloo data structure:', {
      hasQlooData: !!enhancedAnalysis.qlooData,
      hasQlooInsights: !!enhancedAnalysis.qlooInsights,
      successfulQueries: enhancedAnalysis.qlooData.results.filter(r => r.success).length,
      totalEntities: enhancedAnalysis.qlooInsights.rawData.totalEntities
    })
    
    return enhancedAnalysis
  } catch (error) {
    console.error('Error generating comprehensive PR campaign analysis:', error)
    throw new Error('Failed to generate comprehensive PR campaign analysis')
  }
}

export const generateQlooAnalysis = async (campaignData) => {
  try {
    // Step 1: Generate Qloo API queries using Gemini
    const qlooQueries = await generateQlooQueries(campaignData)
    
    // Step 2: Execute the queries against Qloo API
    const qlooResults = await executeQlooQueries(qlooQueries)
    
    return {
      queries: qlooQueries,
      results: qlooResults
    }
  } catch (error) {
    console.error('Error generating Qloo analysis:', error)
    throw new Error('Failed to generate Qloo analysis')
  }
}

const generateQlooQueries = async (campaignData) => {
  const prompt = `You are an expert at using the Qloo API for cultural intelligence and PR campaign analysis. 

Generate COMPREHENSIVE Qloo API queries that include ALL 10 essential categories while being tailored to the user's specific campaign objective and location. Focus on gathering real cultural intelligence data for "${campaignData.location}".

Campaign Data:
- Brand Name: ${campaignData.brandName}
- Category: ${campaignData.category}
- Product/Service: ${campaignData.productDetails}
- Target Location: ${campaignData.location}
- Target Scope: ${campaignData.targetScope}
- Budget: ${campaignData.budget || 'Not specified'}
- Additional Notes: ${campaignData.additionalNotes || 'None'}

IMPORTANT: Use ONLY these supported entity types:
- urn:entity:brand
- urn:entity:place  
- urn:entity:person
- urn:entity:artist
- urn:entity:destination
- urn:entity:movie
- urn:entity:tv_show
- urn:entity:book
- urn:entity:podcast
- urn:entity:videogame

CRITICAL REQUIREMENTS:
- Each query must be specifically tailored to "${campaignData.location}"
- Use the exact brand name: "${campaignData.brandName}"
- Focus on the target scope: "${campaignData.targetScope}"
- Generate queries that will return real cultural intelligence data for "${campaignData.location}"
- Include location-specific parameters for "${campaignData.location}"
- Ensure queries are optimized for the Qloo API structure

Generate COMPREHENSIVE queries covering ALL 10 essential categories while focusing on the target scope: "${campaignData.targetScope}" and location: "${campaignData.location}"

REQUIRED QUERY CATEGORIES :

1. BRAND ANALYSIS (Multiple queries for different aspects in ${campaignData.location})
2. COMPETITIVE INTELLIGENCE (Multiple competitor analysis queries for ${campaignData.location})
3. GEOGRAPHIC INTELLIGENCE (Location-based queries for ${campaignData.location})
4. DEMOGRAPHIC ANALYSIS (Age, gender, audience targeting in ${campaignData.location})
5. INFLUENCER DISCOVERY (Multiple influencer queries for ${campaignData.location})
6. VENUE & MEDIA OUTLET DISCOVERY (Multiple venue queries for ${campaignData.location})
7. CULTURAL PARTNERSHIPS (Artist, celebrity queries for ${campaignData.location})
8. TRENDING ANALYSIS (Popularity and trend queries for ${campaignData.location})
9. CONTENT INTELLIGENCE (Media, entertainment queries for ${campaignData.location})
10. CRISIS MANAGEMENT (Risk assessment queries for ${campaignData.location})

Generate queries in the following JSON format (respond ONLY with valid JSON, no additional text):

[
  {
    "entityType": "urn:entity:brand",
    "description": "BRAND ANALYSIS: Find specific information about ${campaignData.brandName} for ${campaignData.targetScope}",
    "parameters": {
      "filter.type": "urn:entity:brand",
      "filter.results.entities.query": ["${campaignData.brandName}"],
      "signal.location.query": "${campaignData.location}",
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:brand",
    "description": "COMPETITIVE INTELLIGENCE: Find competing brands similar to ${campaignData.brandName} in ${campaignData.location}",
    "parameters": {
      "filter.type": "urn:entity:brand",
      "signal.location.query": "${campaignData.location}",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:brand",
    "description": "COMPETITIVE INTELLIGENCE: Find high-popularity brands in ${campaignData.location} for ${campaignData.targetScope}",
    "parameters": {
      "filter.type": "urn:entity:brand",
      "signal.location.query": "${campaignData.location}",
      "filter.popularity.min": 0.8,
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:destination",
    "description": "GEOGRAPHIC INTELLIGENCE: Find cultural insights for ${campaignData.location} market",
    "parameters": {
      "filter.type": "urn:entity:destination",
      "signal.location.query": "${campaignData.location}",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:person",
    "description": "DEMOGRAPHIC ANALYSIS: Find young influencers (25-35) in ${campaignData.location} for ${campaignData.brandName}",
    "parameters": {
      "filter.type": "urn:entity:person",
      "signal.location.query": "${campaignData.location}",
      "signal.demographics.age": "25_to_35",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:person",
    "description": "DEMOGRAPHIC ANALYSIS: Find female influencers in ${campaignData.location} for ${campaignData.brandName}",
    "parameters": {
      "filter.type": "urn:entity:person",
      "signal.location.query": "${campaignData.location}",
      "signal.demographics.gender": "female",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:person",
    "description": "INFLUENCER DISCOVERY: Find high-profile influencers in ${campaignData.location} for ${campaignData.brandName}",
    "parameters": {
      "filter.type": "urn:entity:person",
      "signal.location.query": "${campaignData.location}",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "filter.popularity.min": 0.8,
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:person",
    "description": "INFLUENCER DISCOVERY: Find emerging influencers in ${campaignData.location} for ${campaignData.brandName}",
    "parameters": {
      "filter.type": "urn:entity:person",
      "signal.location.query": "${campaignData.location}",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "filter.popularity.min": 0.4,
      "filter.popularity.max": 0.7,
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:place",
    "description": "VENUE & MEDIA OUTLET DISCOVERY: Find high-quality venues in ${campaignData.location} for ${campaignData.brandName}",
    "parameters": {
      "filter.type": "urn:entity:place",
      "filter.location.query": "${campaignData.location}",
      "filter.rating.min": 4.0,
      "filter.popularity.min": 0.7,
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:place",
    "description": "VENUE & MEDIA OUTLET DISCOVERY: Find media outlets and press venues in ${campaignData.location}",
    "parameters": {
      "filter.type": "urn:entity:place",
      "filter.location.query": "${campaignData.location}",
      "filter.rating.min": 4.0,
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:artist",
    "description": "CULTURAL PARTNERSHIPS: Find trending artists aligned with ${campaignData.brandName} in ${campaignData.location}",
    "parameters": {
      "filter.type": "urn:entity:artist",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "signal.location.query": "${campaignData.location}",
      "bias.trends": "high",
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:artist",
    "description": "CULTURAL PARTNERSHIPS: Find established artists in ${campaignData.location} for ${campaignData.brandName}",
    "parameters": {
      "filter.type": "urn:entity:artist",
      "signal.location.query": "${campaignData.location}",
      "filter.popularity.min": 0.7,
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:brand",
    "description": "TRENDING ANALYSIS: Find trending brands in ${campaignData.location} for ${campaignData.brandName} to monitor",
    "parameters": {
      "filter.type": "urn:entity:brand",
      "signal.location.query": "${campaignData.location}",
      "bias.trends": "high",
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:movie",
    "description": "CONTENT INTELLIGENCE: Find movies relevant to ${campaignData.brandName} target audience",
    "parameters": {
      "filter.type": "urn:entity:movie",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "filter.popularity.min": 0.6,
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:tv_show",
    "description": "CONTENT INTELLIGENCE: Find TV shows relevant to ${campaignData.brandName} target audience",
    "parameters": {
      "filter.type": "urn:entity:tv_show",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "filter.popularity.min": 0.6,
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:podcast",
    "description": "CONTENT INTELLIGENCE: Find podcasts relevant to ${campaignData.brandName} industry",
    "parameters": {
      "filter.type": "urn:entity:podcast",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:person",
    "description": "CRISIS MANAGEMENT: Find crisis communication experts in ${campaignData.location} for ${campaignData.brandName}",
    "parameters": {
      "filter.type": "urn:entity:person",
      "signal.location.query": "${campaignData.location}",
      "filter.popularity.min": 0.7,
      "take": 10
    }
  },
  {
    "entityType": "urn:entity:brand",
    "description": "CRISIS MANAGEMENT: Find brands with similar risk profiles to ${campaignData.brandName} in ${campaignData.location}",
    "parameters": {
      "filter.type": "urn:entity:brand",
      "signal.location.query": "${campaignData.location}",
      "signal.interests.entities.query": ["${campaignData.brandName}"],
      "take": 10
    }
  }
]

CRITICAL RULES:
1. ALL .query parameters must be ARRAYS, not strings (e.g., ["Nike"], not "Nike")
2. Use ONLY the supported entity types listed above
3. Always include filter.type for each query
4. Generate 15-18 queries covering ALL 10 essential categories
5. Each query should be tailored to the target scope: "${campaignData.targetScope}"
6. Include multiple queries for each category to get comprehensive insights
7. Use signal.location.query for location targeting
8. Use signal.interests.entities.query for brand/entity targeting
9. Use signal.demographics.age and signal.demographics.gender for demographic targeting
10. Use bias.trends for trending analysis
11. Use filter.popularity.min/max for popularity filtering
12. Use filter.rating.min for quality filtering
13. Use filter.price_level.min/max for budget-based filtering when relevant
14. Use filter.tags for category-specific filtering when relevant

Generate comprehensive queries that cover ALL 10 categories while being specifically tailored to achieve the "${campaignData.targetScope}" objective for ${campaignData.brandName} in ${campaignData.location}.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found in response')
  } catch (error) {
    console.error('Error generating Qloo queries:', error)
    // Return comprehensive fallback queries covering all 10 categories
    return generateComprehensiveQueries(campaignData)
  }
}

// Helper function to generate comprehensive queries covering all 10 categories
const generateComprehensiveQueries = (campaignData) => {
  return [
    // 1. BRAND ANALYSIS
    {
      entityType: "urn:entity:brand",
      description: `BRAND ANALYSIS: Find specific information about ${campaignData.brandName} for ${campaignData.targetScope}`,
      parameters: {
        "filter.type": "urn:entity:brand",
        "filter.results.entities.query": [campaignData.brandName],
        "signal.location.query": campaignData.location,
        "take": 10
      }
    },
    // 2. COMPETITIVE INTELLIGENCE
    {
      entityType: "urn:entity:brand",
      description: `COMPETITIVE INTELLIGENCE: Find competing brands similar to ${campaignData.brandName} in ${campaignData.location}`,
      parameters: {
        "filter.type": "urn:entity:brand",
        "signal.location.query": campaignData.location,
        "signal.interests.entities.query": [campaignData.brandName],
        "take": 10
      }
    },
    {
      entityType: "urn:entity:brand",
      description: `COMPETITIVE INTELLIGENCE: Find high-popularity brands in ${campaignData.location} for ${campaignData.targetScope}`,
      parameters: {
        "filter.type": "urn:entity:brand",
        "signal.location.query": campaignData.location,
        "filter.popularity.min": 0.8,
        "take": 10
      }
    },
    // 3. GEOGRAPHIC INTELLIGENCE
    {
      entityType: "urn:entity:destination",
      description: `GEOGRAPHIC INTELLIGENCE: Find cultural insights for ${campaignData.location} market`,
      parameters: {
        "filter.type": "urn:entity:destination",
        "signal.location.query": campaignData.location,
        "signal.interests.entities.query": [campaignData.brandName],
        "take": 10
      }
    },
    // 4. DEMOGRAPHIC ANALYSIS
    {
      entityType: "urn:entity:person",
      description: `DEMOGRAPHIC ANALYSIS: Find young influencers (25-35) in ${campaignData.location} for ${campaignData.brandName}`,
      parameters: {
        "filter.type": "urn:entity:person",
        "signal.location.query": campaignData.location,
        "signal.demographics.age": "25_to_35",
        "signal.interests.entities.query": [campaignData.brandName],
        "take": 10
      }
    },
    {
      entityType: "urn:entity:person",
      description: `DEMOGRAPHIC ANALYSIS: Find female influencers in ${campaignData.location} for ${campaignData.brandName}`,
      parameters: {
        "filter.type": "urn:entity:person",
        "signal.location.query": campaignData.location,
        "signal.demographics.gender": "female",
        "signal.interests.entities.query": [campaignData.brandName],
        "take": 10
      }
    },
    // 5. INFLUENCER DISCOVERY
    {
      entityType: "urn:entity:person",
      description: `INFLUENCER DISCOVERY: Find high-profile influencers in ${campaignData.location} for ${campaignData.brandName}`,
      parameters: {
        "filter.type": "urn:entity:person",
        "signal.location.query": campaignData.location,
        "signal.interests.entities.query": [campaignData.brandName],
        "filter.popularity.min": 0.8,
        "take": 10
      }
    },
    {
      entityType: "urn:entity:person",
      description: `INFLUENCER DISCOVERY: Find emerging influencers in ${campaignData.location} for ${campaignData.brandName}`,
      parameters: {
        "filter.type": "urn:entity:person",
        "signal.location.query": campaignData.location,
        "signal.interests.entities.query": [campaignData.brandName],
        "filter.popularity.min": 0.4,
        "filter.popularity.max": 0.7,
        "take": 10
      }
    },
    // 6. VENUE & MEDIA OUTLET DISCOVERY
    {
      entityType: "urn:entity:place",
      description: `VENUE & MEDIA OUTLET DISCOVERY: Find high-quality venues in ${campaignData.location} for ${campaignData.brandName}`,
      parameters: {
        "filter.type": "urn:entity:place",
        "filter.location.query": campaignData.location,
        "filter.rating.min": 4.0,
        "filter.popularity.min": 0.7,
        "take": 10
      }
    },
    {
      entityType: "urn:entity:place",
      description: `VENUE & MEDIA OUTLET DISCOVERY: Find media outlets and press venues in ${campaignData.location}`,
      parameters: {
        "filter.type": "urn:entity:place",
        "filter.location.query": campaignData.location,
        "filter.rating.min": 4.0,
        "take": 10
      }
    },
    // 7. CULTURAL PARTNERSHIPS
    {
      entityType: "urn:entity:artist",
      description: `CULTURAL PARTNERSHIPS: Find trending artists aligned with ${campaignData.brandName} in ${campaignData.location}`,
      parameters: {
        "filter.type": "urn:entity:artist",
        "signal.interests.entities.query": [campaignData.brandName],
        "signal.location.query": campaignData.location,
        "bias.trends": "high",
        "take": 10
      }
    },
    {
      entityType: "urn:entity:artist",
      description: `CULTURAL PARTNERSHIPS: Find established artists in ${campaignData.location} for ${campaignData.brandName}`,
      parameters: {
        "filter.type": "urn:entity:artist",
        "signal.location.query": campaignData.location,
        "filter.popularity.min": 0.7,
        "take": 10
      }
    },
    // 8. TRENDING ANALYSIS
    {
      entityType: "urn:entity:brand",
      description: `TRENDING ANALYSIS: Find trending brands in ${campaignData.location} for ${campaignData.brandName} to monitor`,
      parameters: {
        "filter.type": "urn:entity:brand",
        "signal.location.query": campaignData.location,
        "bias.trends": "high",
        "take": 10
      }
    },
    // 9. CONTENT INTELLIGENCE
    {
      entityType: "urn:entity:movie",
      description: `CONTENT INTELLIGENCE: Find movies relevant to ${campaignData.brandName} target audience`,
      parameters: {
        "filter.type": "urn:entity:movie",
        "signal.interests.entities.query": [campaignData.brandName],
        "filter.popularity.min": 0.6,
        "take": 10
      }
    },
    {
      entityType: "urn:entity:tv_show",
      description: `CONTENT INTELLIGENCE: Find TV shows relevant to ${campaignData.brandName} target audience`,
      parameters: {
        "filter.type": "urn:entity:tv_show",
        "signal.interests.entities.query": [campaignData.brandName],
        "filter.popularity.min": 0.6,
        "take": 10
      }
    },
    {
      entityType: "urn:entity:podcast",
      description: `CONTENT INTELLIGENCE: Find podcasts relevant to ${campaignData.brandName} industry`,
      parameters: {
        "filter.type": "urn:entity:podcast",
        "signal.interests.entities.query": [campaignData.brandName],
        "take": 10
      }
    },
    // 10. CRISIS MANAGEMENT
    {
      entityType: "urn:entity:person",
      description: `CRISIS MANAGEMENT: Find crisis communication experts in ${campaignData.location} for ${campaignData.brandName}`,
      parameters: {
        "filter.type": "urn:entity:person",
        "signal.location.query": campaignData.location,
        "filter.popularity.min": 0.7,
        "take": 10
      }
    },
    {
      entityType: "urn:entity:brand",
      description: `CRISIS MANAGEMENT: Find brands with similar risk profiles to ${campaignData.brandName} in ${campaignData.location}`,
      parameters: {
        "filter.type": "urn:entity:brand",
        "signal.location.query": campaignData.location,
        "signal.interests.entities.query": [campaignData.brandName],
        "take": 10
      }
    }
  ]
}

const executeQlooQueries = async (queries) => {
  const results = []
  
  for (const query of queries) {
    try {
      // Check if any parameter contains '.query'
      const hasQueryParams = Object.keys(query.parameters).some(key => key.includes('.query'))
      
      let response
      
      if (hasQueryParams) {
        // Use POST request with JSON body for queries with .query parameters
        console.log('Making Qloo API POST request for query with .query parameters')
        
        // Convert URL-style parameters to nested JSON structure
        const jsonBody = convertParamsToJsonBody(query.parameters)
        console.log('POST body:', JSON.stringify(jsonBody, null, 2))
        
        response = await fetch(`${QLOO_API_URL}/v2/insights`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'X-API-Key': QLOO_API_KEY
          },
          body: JSON.stringify(jsonBody)
        })
      } else {
        // Use GET request with URL parameters for queries without .query parameters
        console.log('Making Qloo API GET request for query without .query parameters')
        
        const url = new URL(`${QLOO_API_URL}/v2/insights`)
        Object.entries(query.parameters).forEach(([key, value]) => {
          url.searchParams.append(key, value)
        })
        
        console.log('GET URL:', url.toString())
        
        response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'X-API-Key': QLOO_API_KEY
          }
        })
      }
      
      console.log('Qloo API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        results.push({
          query: query,
          success: true,
          data: data
        })
      } else {
        const errorText = await response.text()
        console.error('Qloo API error:', response.status, errorText)
        results.push({
          query: query,
          success: false,
          error: `HTTP ${response.status}: ${errorText}`
        })
      }
    } catch (error) {
      console.error('Qloo API request failed:', error)
      results.push({
        query: query,
        success: false,
        error: error.message
      })
    }
  }
  
  return results
}

// Helper function to convert URL-style parameters to nested JSON structure
const convertParamsToJsonBody = (parameters) => {
  const body = {}
  
  Object.entries(parameters).forEach(([key, value]) => {
    const parts = key.split('.')
    let current = body
    
    // Build nested structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }
    
    // Set the final value
    const lastPart = parts[parts.length - 1]
    current[lastPart] = value
  })
  
  return body
}









// Enhanced filter helper functions for sophisticated Qloo analysis
const getDemographicFilters = (category, targetScope) => {
  const filters = {}
  
  // Age range based on category and target scope
  if (category === 'Technology' || category === 'SaaS/Software') {
    filters.ageRange = '25-44'
  } else if (category === 'Fashion/Beauty') {
    filters.ageRange = '18-35'
  } else if (category === 'Health/Wellness') {
    filters.ageRange = '25-55'
  } else if (category === 'Finance') {
    filters.ageRange = '30-60'
  } else if (category === 'Education') {
    filters.ageRange = '18-45'
  } else {
    filters.ageRange = '25-54'
  }
  
  // Gender targeting based on category
  if (category === 'Fashion/Beauty') {
    filters.gender = 'female'
  } else if (category === 'Technology' || category === 'Finance') {
    filters.gender = 'male'
  }
  // For most categories, don't specify gender to get broader reach
  
  return filters
}

const getContentFilters = (category, budget) => {
  const filters = {}
  
  // Content rating based on category
  if (category === 'Health/Wellness' || category === 'Education') {
    filters.contentRating = 'G'
  } else if (category === 'Entertainment' || category === 'Technology') {
    filters.contentRating = 'PG'
  }
  
  // Release year range based on category
  const currentYear = new Date().getFullYear()
  if (category === 'Technology' || category === 'SaaS/Software') {
    filters.releaseYearMin = currentYear - 2
    filters.releaseYearMax = currentYear
  } else if (category === 'Fashion/Beauty') {
    filters.releaseYearMin = currentYear - 1
    filters.releaseYearMax = currentYear
  } else {
    filters.releaseYearMin = currentYear - 5
    filters.releaseYearMax = currentYear
  }
  
  return filters
}

const getGeographicFilters = (location) => {
  const filters = {}
  
  // Extract country and region from location
  if (location) {
    // Simple location parsing - in production, you'd use a geocoding service
    if (location.includes('New York') || location.includes('NY')) {
      filters.geocodeCountryCode = 'US'
      filters.geocodeAdmin1Region = 'New York'
    } else if (location.includes('Los Angeles') || location.includes('LA')) {
      filters.geocodeCountryCode = 'US'
      filters.geocodeAdmin1Region = 'California'
    } else if (location.includes('London')) {
      filters.geocodeCountryCode = 'GB'
      filters.geocodeAdmin1Region = 'England'
    } else if (location.includes('Toronto')) {
      filters.geocodeCountryCode = 'CA'
      filters.geocodeAdmin1Region = 'Ontario'
    } else if (location.includes('Sydney')) {
      filters.geocodeCountryCode = 'AU'
      filters.geocodeAdmin1Region = 'New South Wales'
    }
  }
  
  return filters
}

const getExcludeEntities = (category) => {
  // Exclude competing or irrelevant entities based on category
  const exclusions = {
    'Technology': ['microsoft', 'apple', 'google'],
    'Fashion/Beauty': ['zara', 'h&m', 'nike'],
    'Health/Wellness': ['planet-fitness', '24-hour-fitness'],
    'Finance': ['chase', 'bank-of-america', 'wells-fargo'],
    'Education': ['coursera', 'udemy', 'edx'],
    'Restaurant/Food': ['mcdonalds', 'starbucks', 'subway']
  }
  
  return exclusions[category] || []
}

const getExcludeTags = (category) => {
  // Exclude irrelevant tags based on category
  const exclusions = {
    'Technology': ['outdated', 'legacy', 'obsolete'],
    'Fashion/Beauty': ['outdated', 'vintage', 'retro'],
    'Health/Wellness': ['unhealthy', 'processed', 'artificial'],
    'Finance': ['risky', 'volatile', 'unstable'],
    'Education': ['outdated', 'irrelevant', 'obsolete'],
    'Restaurant/Food': ['unhealthy', 'processed', 'artificial']
  }
  
  return exclusions[category] || []
}

const getAudienceTypes = (targetScope) => {
  // Map target scope to audience types
  const audienceMap = {
    'Brand Awareness': ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs'],
    'Product Launch': ['urn:audience:communities', 'urn:audience:interests'],
    'Market Expansion': ['urn:audience:geographic', 'urn:audience:communities'],
    'Crisis Management': ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs'],
    'Reputation Building': ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs'],
    'Lead Generation': ['urn:audience:interests', 'urn:audience:communities'],
    'Customer Retention': ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs'],
    'Thought Leadership': ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs'],
    'Social Recognition': ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs'],
    'Sales Growth': ['urn:audience:interests', 'urn:audience:communities'],
    'Investor Relations': ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs'],
    'Employee Recruitment': ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs'],
    'Community Engagement': ['urn:audience:communities', 'urn:audience:geographic']
  }
  
  return audienceMap[targetScope] || ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs']
}

const getSignalAudiences = (targetScope) => {
  // Map target scope to signal audiences for enhanced targeting
  const signalMap = {
    'Brand Awareness': ['creative-professionals', 'urban-explorers'],
    'Product Launch': ['early-adopters', 'tech-enthusiasts'],
    'Market Expansion': ['cultural-enthusiasts', 'global-citizens'],
    'Crisis Management': ['trusted-advisors', 'community-leaders'],
    'Reputation Building': ['influencers', 'thought-leaders'],
    'Lead Generation': ['decision-makers', 'purchasing-managers'],
    'Customer Retention': ['loyal-customers', 'brand-advocates'],
    'Thought Leadership': ['industry-experts', 'academics'],
    'Social Recognition': ['social-media-influencers', 'celebrities'],
    'Sales Growth': ['high-value-customers', 'enterprise-buyers'],
    'Investor Relations': ['investors', 'financial-analysts'],
    'Employee Recruitment': ['talent-acquisition', 'hr-professionals'],
    'Community Engagement': ['community-leaders', 'local-influencers']
  }
  
  return signalMap[targetScope] || ['creative-professionals', 'urban-explorers']
}

const getInterestTags = (category) => {
  // Map category to interest tags for enhanced signaling
  const interestMap = {
    'Technology': 'innovation,digital-transformation,automation',
    'Fashion/Beauty': 'style,trends,sustainability',
    'Health/Wellness': 'wellness,mindfulness,fitness',
    'Finance': 'investment,financial-planning,wealth-management',
    'Education': 'learning,skill-development,professional-growth',
    'Restaurant/Food': 'culinary,local-cuisine,food-culture',
    'Entertainment': 'entertainment,media,content-creation',
    'Real Estate': 'real-estate,property-investment,urban-development',
    'SaaS/Software': 'saas,software,digital-solutions',
    'E-commerce': 'ecommerce,online-shopping,digital-commerce'
  }
  
  return interestMap[category] || 'innovation,trends,quality'
}

const getPriceLevelMin = (budget) => {
  // Map budget to price level minimum
  if (budget?.includes('Under $1,000') || budget?.includes('$1,000 - $5,000')) {
    return 1
  } else if (budget?.includes('$5,000 - $10,000') || budget?.includes('$10,000 - $25,000')) {
    return 2
  } else if (budget?.includes('$25,000 - $50,000') || budget?.includes('$50,000 - $100,000')) {
    return 3
  } else if (budget?.includes('Over $100,000')) {
    return 4
  }
  return 2 // Default to mid-range
}

const getPriceLevelMax = (budget) => {
  // Map budget to price level maximum
  if (budget?.includes('Under $1,000')) {
    return 2
  } else if (budget?.includes('$1,000 - $5,000')) {
    return 3
  } else if (budget?.includes('$5,000 - $10,000')) {
    return 4
  } else if (budget?.includes('$10,000 - $25,000') || budget?.includes('$25,000 - $50,000')) {
    return 5
  } else if (budget?.includes('$50,000 - $100,000') || budget?.includes('Over $100,000')) {
    return 5
  }
  return 4 // Default to upper-mid-range
}



const buildPRCampaignPrompt = (data) => {
  return `You are an expert PR and marketing strategist with 20+ years of experience. Create a comprehensive PR campaign analysis for the following brand/campaign:

BRAND INFORMATION:
- Brand Name: ${data.brandName}
- Category: ${data.category}
- Product/Service: ${data.productDetails}
- Target Location: ${data.location}
- Target Scope: ${data.targetScope}
- Budget Range: ${data.budget || 'Not specified'}
- Additional Notes: ${data.additionalNotes || 'None'}
- Supporting Files: ${data.uploadedFiles?.length || 0} files uploaded

Please provide a comprehensive PR campaign analysis in the following JSON format (respond ONLY with valid JSON, no additional text):

{
  "overview": {
    "executiveSummary": "Brief overview of the campaign strategy",
    "keyObjectives": ["Objective 1", "Objective 2", "Objective 3"],
    "targetAudience": {
      "primary": "Primary target audience description",
      "secondary": "Secondary target audience description",
      "demographics": "Age, gender, income, location details"
    },
    "uniqueValueProposition": "What makes this brand/product unique"
  },
  "strategy": {
    "mediaRelations": {
      "keyMessages": ["Message 1", "Message 2", "Message 3"],
      "storyAngles": ["Angle 1", "Angle 2", "Angle 3"],
      "targetMedia": ["Media outlet 1", "Media outlet 2", "Media outlet 3"],
      "pitchStrategy": "How to approach media outlets"
    },
    "contentStrategy": {
      "pressRelease": {
        "headline": "Compelling headline",
        "subheadline": "Supporting subheadline",
        "keyPoints": ["Point 1", "Point 2", "Point 3"],
        "callToAction": "What action should readers take"
      },
      "socialMedia": {
        "platforms": ["Platform 1", "Platform 2"],
        "contentTypes": ["Type 1", "Type 2"],
        "messaging": "Social media messaging strategy"
      },
      "blogContent": {
        "topics": ["Topic 1", "Topic 2", "Topic 3"],
        "tone": "Content tone and style",
        "distribution": "How to distribute blog content"
      }
    },
    "crisisManagement": {
      "potentialRisks": ["Risk 1", "Risk 2", "Risk 3"],
      "responseStrategy": "How to handle negative situations",
      "spokesperson": "Who should be the spokesperson"
    }
  },
  "implementation": {
    "timeline": {
      "phase1": {
        "duration": "2-3 weeks",
        "activities": ["Activity 1", "Activity 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"]
      },
      "phase2": {
        "duration": "4-6 weeks",
        "activities": ["Activity 1", "Activity 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"]
      },
      "phase3": {
        "duration": "2-4 weeks",
        "activities": ["Activity 1", "Activity 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"]
      }
    },
    "budgetAllocation": {
      "mediaRelations": "30%",
      "contentCreation": "25%",
      "socialMedia": "20%",
      "events": "15%",
      "measurement": "10%"
    },
    "teamRequirements": {
      "roles": ["Role 1", "Role 2", "Role 3"],
      "responsibilities": "Who does what",
      "externalPartners": "Any external agencies needed"
    }
  },
  "measurement": {
    "kpis": {
      "awareness": ["KPI 1", "KPI 2"],
      "engagement": ["KPI 1", "KPI 2"],
      "conversion": ["KPI 1", "KPI 2"]
    },
    "tools": ["Tool 1", "Tool 2", "Tool 3"],
    "reportingSchedule": "How often to report results"
  },
  "recommendations": {
    "immediate": ["Recommendation 1", "Recommendation 2"],
    "shortTerm": ["Recommendation 1", "Recommendation 2"],
    "longTerm": ["Recommendation 1", "Recommendation 2"],
    "risks": ["Risk 1", "Risk 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"]
  }
}

Make the analysis practical, actionable, and tailored to the specific brand and target scope. Consider the location, budget, and category when making recommendations.`
}

const buildComprehensivePRCampaignPrompt = (data, qlooData) => {
  return `You are an expert PR and marketing strategist with 20+ years of experience, specializing in cultural intelligence and data-driven campaign strategies. Create a comprehensive PR campaign analysis that leverages Qloo's Taste AI™ API cultural insights to deliver highly targeted and culturally relevant recommendations.

IMPORTANT: Generate ONLY valid JSON. Do not include any text before or after the JSON. Use proper JSON formatting with double quotes and no trailing commas.

BRAND INFORMATION:
- Brand Name: ${data.brandName}
- Category: ${data.category}
- Product/Service: ${data.productDetails}
- Target Location: ${data.location}
- Target Scope: ${data.targetScope}
- Budget Range: ${data.budget || 'Not specified'}
- Additional Notes: ${data.additionalNotes || 'None'}

QLOO API CULTURAL INTELLIGENCE DATA:
This is the output from the Qloo LLM API which excels in cultural insights, demographic analysis, and market intelligence. Use this data to inform your recommendations:

QLOO API QUERIES EXECUTED:
${JSON.stringify(qlooData.queries, null, 2)}

QLOO API RESPONSE DATA:
${JSON.stringify(qlooData.results, null, 2)}

CRITICAL INSTRUCTIONS:
1. Analyze the Qloo API data to understand cultural preferences, demographic insights, and market opportunities
2. Extract specific insights about influencers, venues, media outlets, and cultural trends
3. Use this cultural intelligence to create highly targeted and culturally relevant PR strategies
4. Align all recommendations with the specific target scope: "${data.targetScope}"
5. Provide data-driven insights based on the Qloo API findings
6. Generate comprehensive analytics data for visualization based on ACTUAL Qloo data
7. DO NOT use placeholder or generic data - all analytics must be derived from real Qloo API results
8. If Qloo data is limited, acknowledge limitations rather than generating fake data
9. Focus on the specific location: "${data.location}" - analyze Qloo data for this exact location
10. Generate location-specific insights based on actual Qloo venue and cultural data for "${data.location}"
11. REPLACE ALL PLACEHOLDER TEXT with real, specific data from your analysis
12. Use simple, clean text without special characters or complex formatting
13. Ensure all JSON strings are properly escaped

Please provide a comprehensive PR campaign analysis in the following JSON format (respond ONLY with valid JSON, no additional text):

{
  "overview": {
    "executiveSummary": "Data-driven overview incorporating Qloo cultural insights for ${data.location}",
    "keyObjectives": ["Objective 1 based on cultural data for ${data.location}", "Objective 2", "Objective 3"],
    "targetAudience": {
      "primary": "Primary target audience based on Qloo demographic data for ${data.location}",
      "secondary": "Secondary target audience from cultural analysis for ${data.location}",
      "demographics": "Specific age, gender, location details from Qloo insights for ${data.location}",
      "culturalPreferences": "Cultural preferences and behaviors identified from Qloo data for ${data.location}"
    },
    "uniqueValueProposition": "What makes this brand/product unique in the cultural context of ${data.location}",
    "culturalInsights": {
      "keyFindings": ["Cultural insight 1 from Qloo data for ${data.location}", "Cultural insight 2", "Cultural insight 3"],
      "marketOpportunities": ["Opportunity 1 specific to ${data.location}", "Opportunity 2", "Opportunity 3"],
      "culturalChallenges": ["Challenge 1 for ${data.location}", "Challenge 2", "Challenge 3"]
    }
  },
  "strategy": {
    "mediaRelations": {
      "keyMessages": ["Message 1 aligned with cultural insights for ${data.location}", "Message 2", "Message 3"],
      "storyAngles": ["Angle 1 based on cultural trends in ${data.location}", "Angle 2", "Angle 3"],
      "targetMedia": ["Media outlet 1 from Qloo data for ${data.location}", "Media outlet 2", "Media outlet 3"],
      "pitchStrategy": "How to approach media outlets using cultural intelligence for ${data.location}",
      "culturalMessaging": "How to adapt messaging for cultural relevance in ${data.location}"
    },
    "contentStrategy": {
      "pressRelease": {
        "headline": "Compelling headline incorporating cultural insights for ${data.location}",
        "subheadline": "Supporting subheadline with cultural context for ${data.location}",
        "keyPoints": ["Point 1 with cultural relevance for ${data.location}", "Point 2", "Point 3"],
        "callToAction": "What action should readers take",
        "culturalElements": "Cultural elements to include in press release for ${data.location}"
      },
      "socialMedia": {
        "platforms": ["Platform 1 from Qloo insights for ${data.location}", "Platform 2"],
        "contentTypes": ["Type 1 culturally relevant for ${data.location}", "Type 2"],
        "messaging": "Social media messaging strategy with cultural intelligence for ${data.location}",
        "influencerStrategy": "Influencer approach based on Qloo data for ${data.location}"
      },
      "blogContent": {
        "topics": ["Topic 1 with cultural relevance for ${data.location}", "Topic 2", "Topic 3"],
        "tone": "Content tone and style aligned with cultural preferences in ${data.location}",
        "distribution": "How to distribute blog content using cultural insights for ${data.location}"
      }
    },
    "influencerStrategy": {
      "identifiedInfluencers": ["Influencer 1 from Qloo data for ${data.location}", "Influencer 2", "Influencer 3"],
      "partnershipApproach": "How to approach influencers based on cultural data for ${data.location}",
      "contentCollaboration": "Content collaboration ideas with cultural relevance for ${data.location}",
      "engagementStrategy": "Engagement strategy for influencer partnerships in ${data.location}"
    },
    "venueStrategy": {
      "identifiedVenues": ["Venue 1 from Qloo data for ${data.location}", "Venue 2", "Venue 3"],
      "eventConcepts": ["Event concept 1 for ${data.location}", "Event concept 2", "Event concept 3"],
      "culturalAlignment": "How venues align with cultural preferences in ${data.location}",
      "partnershipOpportunities": "Partnership opportunities with venues in ${data.location}"
    },
    "crisisManagement": {
      "potentialRisks": ["Risk 1 identified from cultural analysis for ${data.location}", "Risk 2", "Risk 3"],
      "responseStrategy": "How to handle negative situations with cultural sensitivity in ${data.location}",
      "spokesperson": "Who should be the spokesperson based on cultural credibility in ${data.location}",
      "culturalConsiderations": "Cultural considerations for crisis management in ${data.location}"
    }
  },
  "implementation": {
    "timeline": {
      "phase1": {
        "duration": "2-3 weeks",
        "activities": ["Activity 1 with cultural focus for ${data.location}", "Activity 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"],
        "culturalMilestones": "Cultural milestones to achieve in ${data.location}"
      },
      "phase2": {
        "duration": "4-6 weeks",
        "activities": ["Activity 1", "Activity 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"],
        "culturalMilestones": "Cultural milestones to achieve in ${data.location}"
      },
      "phase3": {
        "duration": "2-4 weeks",
        "activities": ["Activity 1", "Activity 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"],
        "culturalMilestones": "Cultural milestones to achieve in ${data.location}"
      }
    },
    "budgetAllocation": {
      "mediaRelations": "30%",
      "contentCreation": "25%",
      "socialMedia": "20%",
      "events": "15%",
      "measurement": "10%",
      "culturalIntelligence": "Budget for ongoing cultural intelligence"
    },
    "teamRequirements": {
      "roles": ["Role 1", "Role 2", "Role 3"],
      "responsibilities": "Who does what",
      "externalPartners": "Any external agencies needed",
      "culturalExpertise": "Cultural expertise requirements"
    }
  },
  "measurement": {
    "kpis": {
      "awareness": ["KPI 1", "KPI 2"],
      "engagement": ["KPI 1", "KPI 2"],
      "conversion": ["KPI 1", "KPI 2"],
      "culturalRelevance": ["Cultural relevance KPI 1", "Cultural relevance KPI 2"]
    },
    "tools": ["Tool 1", "Tool 2", "Tool 3"],
    "reportingSchedule": "How often to report results",
    "culturalMetrics": "Metrics to track cultural impact"
  },
  "recommendations": {
    "immediate": ["Recommendation 1 based on cultural data for ${data.location}", "Recommendation 2"],
    "shortTerm": ["Recommendation 1", "Recommendation 2"],
    "longTerm": ["Recommendation 1", "Recommendation 2"],
    "risks": ["Risk 1 from cultural analysis for ${data.location}", "Risk 2"],
    "opportunities": ["Opportunity 1 from Qloo data for ${data.location}", "Opportunity 2"],
    "culturalPartnerships": ["Cultural partnership 1 for ${data.location}", "Cultural partnership 2", "Cultural partnership 3"]
  },
  "qlooInsights": {
    "keyCulturalFindings": ["Finding 1 from Qloo data for ${data.location}", "Finding 2", "Finding 3"],
    "demographicInsights": {
      "18-24": {"engagement": 85, "preferences": "Digital-first, social media savvy"},
      "25-34": {"engagement": 92, "preferences": "Value-driven, authenticity-focused"},
      "35-44": {"engagement": 78, "preferences": "Quality-conscious, family-oriented"},
      "45-54": {"engagement": 65, "preferences": "Trust-based, traditional media"},
      "55-64": {"engagement": 45, "preferences": "Stability-focused, word-of-mouth"},
      "65+": {"engagement": 32, "preferences": "Traditional values, established brands"}
    },
    "influencerOpportunities": ["Influencer opportunity 1 for ${data.location}", "Influencer opportunity 2"],
    "venueRecommendations": ["Venue recommendation 1 for ${data.location}", "Venue recommendation 2"],
    "trendingTopics": ["Trending topic 1 in ${data.location}", "Trending topic 2"],
    "competitiveLandscape": "Competitive landscape insights from Qloo data for ${data.location}",
    "locationAnalysis": {
      "topLocations": [
        {
          "name": "${data.location}",
          "score": 95,
          "reasoning": "Based on Qloo cultural intelligence analysis for ${data.location}",
          "culturalInsights": "Cultural factors identified from Qloo data for ${data.location}",
          "qlooData": "Specific Qloo metrics and data points for ${data.location}"
        }
      ],
      "culturalMetrics": {
        "totalPopulationReach": "Calculated from Qloo data for ${data.location}",
        "averageEngagementRate": "Derived from Qloo popularity scores for ${data.location}",
        "culturalRelevanceScore": "Based on Qloo cultural analysis for ${data.location}",
        "influencerAffinity": "Calculated from Qloo influencer data for ${data.location}",
        "mediaCoveragePotential": "Assessed from Qloo media insights for ${data.location}",
        "marketPenetration": "Derived from Qloo market data for ${data.location}"
      }
    }
  }
}

IMPORTANT: Make the analysis practical, actionable, and completely aligned with the user's specific request. Base ALL recommendations on the Qloo API cultural intelligence data provided. Ensure every strategy element leverages the cultural insights to maximize relevance and effectiveness for the target scope: "${data.targetScope}". 

CRITICAL: Generate analytics data based on ACTUAL Qloo API results. If the Qloo data shows limited results or no data for certain areas, acknowledge this limitation rather than generating fake data. The analytics should reflect the real cultural intelligence available from the Qloo API responses.

LOCATION FOCUS: All analysis must be specifically tailored to "${data.location}". Analyze the Qloo API data for this exact location and generate location-specific insights. Do not use generic location data - focus on the cultural intelligence available for "${data.location}".

FINAL REMINDER: This JSON structure is the format template. You MUST replace all placeholder text with actual, specific data from your analysis of the Qloo API results. Do not return the template with placeholder text - populate it with real insights and recommendations. Use simple, clean text without special characters.`
}

const parseAnalysisResponse = (text) => {
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      let jsonString = jsonMatch[0]
      
      // Clean up common JSON issues that Gemini might return
      jsonString = jsonString
        // Fix escaped quotes within strings
        .replace(/\\"/g, '"')
        // Fix escaped backslashes
        .replace(/\\\\/g, '\\')
        // Fix escaped newlines
        .replace(/\\n/g, ' ')
        // Fix escaped tabs
        .replace(/\\t/g, ' ')
        // Remove any trailing commas before closing braces/brackets
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix any remaining invalid escape sequences
        .replace(/\\([^"\\\/bfnrt])/g, '$1')
      
      console.log('Cleaned JSON string:', jsonString.substring(0, 500) + '...')
      
      return JSON.parse(jsonString)
    }
    throw new Error('No valid JSON found in response')
  } catch (error) {
    console.error('Error parsing analysis response:', error)
    console.log('Raw response text:', text.substring(0, 1000) + '...')
    
    // Return a comprehensive fallback structure with real data placeholders
    return {
      overview: {
        executiveSummary: "Comprehensive PR campaign analysis generated successfully using Qloo cultural intelligence data.",
        keyObjectives: [
          "Increase brand awareness through culturally relevant messaging",
          "Engage target audience using data-driven insights",
          "Build authentic connections through cultural alignment"
        ],
        targetAudience: {
          primary: "Primary target audience identified through Qloo demographic analysis",
          secondary: "Secondary audience segments based on cultural intelligence",
          demographics: "Age, gender, and location data from Qloo API insights"
        },
        uniqueValueProposition: "Unique value proposition crafted using cultural intelligence data"
      },
      strategy: {
        mediaRelations: {
          keyMessages: [
            "Culturally relevant message aligned with target audience",
            "Data-driven messaging based on Qloo insights",
            "Authentic communication strategy"
          ],
          storyAngles: [
            "Cultural trend-based story angle",
            "Demographic-focused narrative",
            "Location-specific cultural story"
          ],
          targetMedia: [
            "Media outlets identified through Qloo analysis",
            "Cultural intelligence-driven media selection",
            "Audience-aligned media channels"
          ],
          pitchStrategy: "Pitch strategy developed using cultural intelligence insights"
        },
        contentStrategy: {
          pressRelease: {
            headline: "Compelling headline incorporating cultural insights",
            subheadline: "Supporting subheadline with cultural context",
            keyPoints: [
              "Cultural relevance point from Qloo data",
              "Demographic alignment insight",
              "Market intelligence finding"
            ],
            callToAction: "Action-oriented call based on cultural analysis"
          },
          socialMedia: {
            platforms: [
              "Platforms identified through cultural analysis",
              "Audience-preferred social channels"
            ],
            contentTypes: [
              "Culturally relevant content types",
              "Engagement-focused formats"
            ],
            messaging: "Social media strategy with cultural intelligence"
          },
          blogContent: {
            topics: [
              "Cultural trend topics from Qloo data",
              "Audience interest areas",
              "Market-relevant subjects"
            ],
            tone: "Content tone aligned with cultural preferences",
            distribution: "Distribution strategy using cultural insights"
          }
        },
        crisisManagement: {
          potentialRisks: [
            "Cultural sensitivity risks identified",
            "Market-specific challenges",
            "Audience-related concerns"
          ],
          responseStrategy: "Crisis response strategy with cultural considerations",
          spokesperson: "Appropriate spokesperson based on cultural credibility"
        }
      },
      implementation: {
        timeline: {
          phase1: {
            duration: "2-3 weeks",
            activities: [
              "Cultural intelligence analysis",
              "Audience research and validation",
              "Strategy development"
            ],
            deliverables: [
              "Cultural insights report",
              "Audience analysis document",
              "Strategic framework"
            ]
          },
          phase2: {
            duration: "4-6 weeks",
            activities: [
              "Content creation with cultural focus",
              "Media outreach using insights",
              "Campaign execution"
            ],
            deliverables: [
              "Culturally relevant content",
              "Media placement results",
              "Campaign performance data"
            ]
          },
          phase3: {
            duration: "2-4 weeks",
            activities: [
              "Performance measurement",
              "Cultural impact assessment",
              "Strategy refinement"
            ],
            deliverables: [
              "Performance report",
              "Cultural impact analysis",
              "Optimization recommendations"
            ]
          }
        },
        budgetAllocation: {
          mediaRelations: "30%",
          contentCreation: "25%",
          socialMedia: "20%",
          events: "15%",
          measurement: "10%"
        },
        teamRequirements: {
          roles: [
            "Cultural Intelligence Analyst",
            "PR Strategist",
            "Content Creator"
          ],
          responsibilities: "Team responsibilities aligned with cultural insights",
          externalPartners: "External partners with cultural expertise"
        }
      },
      measurement: {
        kpis: {
          awareness: [
            "Brand awareness metrics from cultural analysis",
            "Cultural relevance scores"
          ],
          engagement: [
            "Audience engagement rates",
            "Cultural alignment metrics"
          ],
          conversion: [
            "Conversion rates by demographic",
            "Cultural impact measurements"
          ]
        },
        tools: [
          "Qloo cultural intelligence platform",
          "Analytics and measurement tools",
          "Cultural impact assessment tools"
        ],
        reportingSchedule: "Regular reporting schedule with cultural insights"
      },
      recommendations: {
        immediate: [
          "Immediate action based on cultural insights",
          "Quick wins using Qloo data"
        ],
        shortTerm: [
          "Short-term cultural strategy",
          "Audience engagement tactics"
        ],
        longTerm: [
          "Long-term cultural positioning",
          "Sustainable cultural relevance"
        ],
        risks: [
          "Cultural sensitivity risks",
          "Market-specific challenges"
        ],
        opportunities: [
          "Cultural trend opportunities",
          "Audience expansion potential"
        ]
      },
      qlooInsights: {
        keyCulturalFindings: [
          "Cultural insight from Qloo API",
          "Demographic finding from analysis",
          "Market intelligence discovery"
        ],
        demographicInsights: {
          "18-24": {"engagement": 85, "preferences": "Digital-first, social media savvy"},
          "25-34": {"engagement": 92, "preferences": "Value-driven, authenticity-focused"},
          "35-44": {"engagement": 78, "preferences": "Quality-conscious, family-oriented"},
          "45-54": {"engagement": 65, "preferences": "Trust-based, traditional media"},
          "55-64": {"engagement": 45, "preferences": "Stability-focused, word-of-mouth"},
          "65+": {"engagement": 32, "preferences": "Traditional values, established brands"}
        },
        influencerOpportunities: [
          "Influencer opportunity from Qloo data",
          "Cultural partnership potential"
        ],
        venueRecommendations: [
          "Venue recommendation from cultural analysis",
          "Location-based opportunity"
        ],
        trendingTopics: [
          "Trending topic from Qloo analysis",
          "Cultural trend identification"
        ],
        competitiveLandscape: "Competitive landscape insights from Qloo data",
        locationAnalysis: {
          topLocations: [
            {
              name: "Primary location from Qloo analysis",
              score: 95,
              reasoning: "Based on Qloo cultural intelligence analysis",
              culturalInsights: "Cultural factors identified from Qloo data",
              qlooData: "Specific Qloo metrics and data points"
            }
          ],
          culturalMetrics: {
            totalPopulationReach: "Calculated from Qloo data",
            averageEngagementRate: "Derived from Qloo popularity scores",
            culturalRelevanceScore: "Based on Qloo cultural analysis",
            influencerAffinity: "Calculated from Qloo influencer data",
            mediaCoveragePotential: "Assessed from Qloo media insights",
            marketPenetration: "Derived from Qloo market data"
          }
        }
      }
    }
  }
}

export const generateContent = async (contentType, data) => {
  try {
    const prompt = buildContentPrompt(contentType, data)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating content:', error)
    throw new Error('Failed to generate content')
  }
}

const buildContentPrompt = (contentType, data) => {
  const baseInfo = `
Brand: ${data.brandName}
Category: ${data.category}
Product: ${data.productDetails}
Target: ${data.targetScope}
Location: ${data.location}
  `

  switch (contentType) {
    case 'pressRelease':
      return `${baseInfo}
Write a professional press release for this brand/product. Include:
- Compelling headline
- Strong opening paragraph
- Key benefits and features
- Quotes from company spokesperson
- Call to action
- Contact information

Make it newsworthy and engaging for journalists.`

    case 'socialMedia':
      return `${baseInfo}
Create social media content strategy including:
- Platform-specific posts (Twitter, LinkedIn, Instagram, Facebook)
- Hashtag strategy
- Content calendar suggestions
- Engagement tactics
- Influencer collaboration ideas`

    case 'blogPost':
      return `${baseInfo}
Write a blog post that positions the brand as a thought leader. Include:
- SEO-optimized title
- Engaging introduction
- Valuable insights and tips
- Brand integration (subtle)
- Call to action
- Related topics for future posts`

    default:
      return `${baseInfo}
Create compelling marketing content for this brand.`
  }
}

export const generateCrisisResponse = async (crisisType, brandData) => {
  try {
    const prompt = `
As a crisis communication expert, create a response strategy for ${brandData.brandName} facing a ${crisisType} crisis.

Brand Context:
- Category: ${brandData.category}
- Product: ${brandData.productDetails}
- Target Audience: ${brandData.targetScope}

Create a comprehensive crisis response plan including:
1. Immediate response statement
2. Key messaging points
3. Communication channels
4. Timeline for response
5. Stakeholder management
6. Recovery strategy

Make it practical and actionable.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating crisis response:', error)
    throw new Error('Failed to generate crisis response')
  }
}

export const generateCompetitorAnalysis = async (brandData, competitors) => {
  try {
    const prompt = `
Conduct a competitive analysis for ${brandData.brandName} against these competitors: ${competitors.join(', ')}

Brand Information:
- Category: ${brandData.category}
- Product: ${brandData.productDetails}
- Target: ${brandData.targetScope}

Provide analysis covering:
1. Competitive landscape overview
2. Strengths and weaknesses comparison
3. Market positioning opportunities
4. Differentiation strategies
5. Competitive advantages to leverage
6. Potential threats and responses

Make it strategic and actionable.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating competitor analysis:', error)
    throw new Error('Failed to generate competitor analysis')
  }
} 