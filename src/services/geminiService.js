import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI with the provided API key
const genAI = new GoogleGenerativeAI('AIzaSyAzOO1YxLxXCX5ulLlbTQW7-EdBkKm4zSg')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

// Qloo API Configuration
const QLOO_API_URL = 'https://hackathon.api.qloo.com'
const QLOO_API_KEY = 'IRSNQzMzLHXJ9KxiVTJ1Jr7TIcc_ZtY726AmN2hVKVs'

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
    const prompt = buildComprehensivePRCampaignPrompt(campaignData)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return parseAnalysisResponse(text)
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

const buildComprehensivePRCampaignPrompt = (data) => {
  return `You are an expert PR and marketing strategist with 20+ years of experience, specializing in cultural intelligence and data-driven campaign strategies. Create a comprehensive PR campaign analysis that leverages Qloo's Taste AI™ API cultural insights to deliver highly targeted and culturally relevant recommendations.

BRAND INFORMATION:
- Brand Name: ${data.brandName}
- Category: ${data.category}
- Product/Service: ${data.productDetails}
- Target Location: ${data.location}
- Target Scope: ${data.targetScope}
- Budget Range: ${data.budget || 'Not specified'}
- Additional Notes: ${data.additionalNotes || 'None'}
- Supporting Files: ${data.uploadedFiles?.length || 0} files uploaded

QLOO API CULTURAL INTELLIGENCE DATA:
This is the output from the Qloo LLM API which excels in cultural insights, demographic analysis, and market intelligence. Use this data to inform your recommendations:

QLOO API QUERIES EXECUTED:
${JSON.stringify(data.qlooData.queries, null, 2)}

QLOO API RESPONSE DATA:
${JSON.stringify(data.qlooData.results, null, 2)}

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

LOCATION FOCUS: All analysis must be specifically tailored to "${data.location}". Analyze the Qloo API data for this exact location and generate location-specific insights. Do not use generic location data - focus on the cultural intelligence available for "${data.location}".`
}

const parseAnalysisResponse = (text) => {
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found in response')
  } catch (error) {
    console.error('Error parsing analysis response:', error)
    // Return a fallback structure
    return {
      overview: {
        executiveSummary: "Analysis generated successfully",
        keyObjectives: ["Objective 1", "Objective 2"],
        targetAudience: {
          primary: "Primary audience",
          secondary: "Secondary audience",
          demographics: "Demographic details"
        },
        uniqueValueProposition: "Unique value proposition"
      },
      strategy: {
        mediaRelations: {
          keyMessages: ["Message 1", "Message 2"],
          storyAngles: ["Angle 1", "Angle 2"],
          targetMedia: ["Media 1", "Media 2"],
          pitchStrategy: "Pitch strategy"
        },
        contentStrategy: {
          pressRelease: {
            headline: "Press release headline",
            subheadline: "Subheadline",
            keyPoints: ["Point 1", "Point 2"],
            callToAction: "Call to action"
          },
          socialMedia: {
            platforms: ["Platform 1", "Platform 2"],
            contentTypes: ["Type 1", "Type 2"],
            messaging: "Social media strategy"
          },
          blogContent: {
            topics: ["Topic 1", "Topic 2"],
            tone: "Content tone",
            distribution: "Distribution strategy"
          }
        },
        crisisManagement: {
          potentialRisks: ["Risk 1", "Risk 2"],
          responseStrategy: "Response strategy",
          spokesperson: "Spokesperson"
        }
      },
      implementation: {
        timeline: {
          phase1: {
            duration: "2-3 weeks",
            activities: ["Activity 1", "Activity 2"],
            deliverables: ["Deliverable 1", "Deliverable 2"]
          },
          phase2: {
            duration: "4-6 weeks",
            activities: ["Activity 1", "Activity 2"],
            deliverables: ["Deliverable 1", "Deliverable 2"]
          },
          phase3: {
            duration: "2-4 weeks",
            activities: ["Activity 1", "Activity 2"],
            deliverables: ["Deliverable 1", "Deliverable 2"]
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
          roles: ["Role 1", "Role 2"],
          responsibilities: "Team responsibilities",
          externalPartners: "External partners"
        }
      },
      measurement: {
        kpis: {
          awareness: ["KPI 1", "KPI 2"],
          engagement: ["KPI 1", "KPI 2"],
          conversion: ["KPI 1", "KPI 2"]
        },
        tools: ["Tool 1", "Tool 2"],
        reportingSchedule: "Reporting schedule"
      },
      recommendations: {
        immediate: ["Recommendation 1", "Recommendation 2"],
        shortTerm: ["Recommendation 1", "Recommendation 2"],
        longTerm: ["Recommendation 1", "Recommendation 2"],
        risks: ["Risk 1", "Risk 2"],
        opportunities: ["Opportunity 1", "Opportunity 2"]
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