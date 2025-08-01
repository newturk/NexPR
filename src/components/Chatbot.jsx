import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, X, Minimize2, Maximize2, Image, FileText, Palette, Video, Sparkles, Wand2, History, Trash2 } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const Chatbot = ({ analysisData, analyticsData }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [awaitingUserPreference, setAwaitingUserPreference] = useState(false)
  const [currentAction, setCurrentAction] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatbot_history')
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setChatHistory(parsedHistory)
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }
  }, [])

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatbot_history', JSON.stringify(chatHistory))
    }
  }, [chatHistory])

  // Create new session when chatbot opens
  useEffect(() => {
    if (isOpen && !currentSessionId) {
      const sessionId = `session_${Date.now()}`
      setCurrentSessionId(sessionId)
    }
  }, [isOpen, currentSessionId])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Quick action buttons with specific prompts
  const quickActions = [
    {
      id: 'poster',
      title: 'Generate Posters',
      description: 'Create visual posters for your campaign',
      icon: Image,
      color: 'from-pink-500 to-rose-500',
      prompt: 'Generate creative poster designs for my PR campaign. Include visual concepts, color schemes, and layout ideas that would work well for my campaign type.'
    },
    {
      id: 'script',
      title: 'Generate Scripts',
      description: 'Create video and audio scripts',
      icon: Video,
      color: 'from-blue-500 to-cyan-500',
      prompt: 'Generate compelling video and audio scripts for my PR campaign. Include different formats like TV ads, social media videos, and podcast content.'
    },
    {
      id: 'theme',
      title: 'Generate Theme',
      description: 'Create campaign theme and messaging',
      icon: Palette,
      color: 'from-purple-500 to-indigo-500',
      prompt: 'Generate a comprehensive campaign theme and messaging strategy. Include taglines, key messages, tone of voice, and brand positioning.'
    },
    {
      id: 'content',
      title: 'Generate Content',
      description: 'Create social media and blog content',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      prompt: 'Generate engaging social media posts, blog content, and press releases for my PR campaign. Include different content types and posting schedules.'
    },
    {
      id: 'strategy',
      title: 'Generate Strategy',
      description: 'Create detailed campaign strategy',
      icon: Sparkles,
      color: 'from-orange-500 to-red-500',
      prompt: 'Generate a comprehensive PR campaign strategy with detailed tactics, timeline, budget allocation, and success metrics.'
    },
    {
      id: 'ideas',
      title: 'Generate Ideas',
      description: 'Create creative campaign ideas',
      icon: Wand2,
      color: 'from-yellow-500 to-amber-500',
      prompt: 'Generate innovative and creative campaign ideas that would make my PR campaign stand out. Include viral concepts, partnerships, and unique approaches.'
    }
  ]

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const hasAnalysisData = analysisData && analyticsData
      
      setMessages([
        {
          id: 1,
          type: 'bot',
                     content: hasAnalysisData 
             ? `🤖 Hello! I'm your AI PR Campaign Assistant with access to the complete Qloo & Gemini analysis response!

**📊 Complete Data Available:**
• **Campaign Details**: ${analysisData?.campaignData?.campaignType || 'N/A'} campaign targeting ${analysisData?.campaignData?.targetAudience || 'N/A'}
• **Qloo API Data**: ${analysisData?.qlooData?.results?.filter(r => r.success)?.length || 0} successful cultural intelligence responses
• **Gemini Analysis**: Complete AI-generated strategy, implementation, and recommendations
• **Analytics**: ${Object.keys(analyticsData || {}).length} comprehensive data visualizations
• **Key Insights**: ${analysisData?.qlooInsights?.finalAnalysis?.keyInsights?.length || 0} cultural insights
• **Strategic Recommendations**: ${analysisData?.qlooInsights?.finalAnalysis?.recommendations?.length || 0} data-driven recommendations

**💡 I can help you with:**
• **Data-Driven Content** - Generate content based on exact Qloo cultural insights
• **Strategic Planning** - Using complete Gemini analysis and recommendations
• **Budget Optimization** - Based on your ${analysisData?.campaignData?.budgetRange || 'specified'} budget and analysis
• **Audience Targeting** - Leveraging exact demographic and psychographic data
• **Performance Analysis** - Interpreting analytics with full context
• **Cultural Intelligence** - Using Qloo API data for cultural relevance
• **Implementation Guidance** - Based on complete strategy and timeline analysis

**🚀 Quick Actions Available:**
Use the buttons below to generate specific campaign materials, or ask me anything about your complete analysis!`
            : `🤖 Hello! I'm your AI PR Campaign Assistant. I can help you with general PR campaign guidance while you build your campaign.

I can help you with:
• Campaign planning - Best practices for PR campaigns
• Budget guidance - Typical costs for different campaign types
• Strategy advice - Effective PR strategies and approaches
• Target audience - How to identify and reach your audience
• Channel selection - Best platforms for different campaigns
• Content ideas - Types of content that work well
• Timeline planning - How long campaigns typically take
• Risk management - Common challenges and solutions

**Quick Actions Available:**
Use the buttons below to generate campaign materials, or ask me anything about PR campaigns in general!`
        }
      ])
    }
  }, [isOpen, messages.length, analysisData, analyticsData])

  const handleQuickAction = async (action) => {
    setIsGenerating(true)
    
    // Add user message
    const userMessage = `Generate ${action.title.toLowerCase()} for my campaign`
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage
    }
    
    setMessages(prev => [...prev, newUserMessage])

    // Ask for user preferences first
    const preferenceMessage = generatePreferenceQuestion(action)
    const preferenceBotMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: preferenceMessage
    }
    
    setMessages(prev => [...prev, preferenceBotMessage])
    setAwaitingUserPreference(true)
    setCurrentAction(action)
    setIsGenerating(false)
  }

  const generatePreferenceQuestion = (action) => {
    const hasAnalysisData = analysisData && analyticsData
    
    if (!hasAnalysisData) {
      return `I'd be happy to help you generate ${action.title.toLowerCase()}! 

Do you have any specific preferences for:
• Style or tone you'd like to use?
• Target audience focus?
• Budget considerations?
• Timeline requirements?

Or would you like me to generate based on general best practices?`
    }

    // Extract campaign data for personalized questions
    const campaignType = analysisData?.campaignData?.campaignType || 'campaign'
    const targetAudience = analysisData?.campaignData?.targetAudience || 'your audience'
    const budgetRange = analysisData?.campaignData?.budgetRange || 'your budget'
    const location = analysisData?.campaignData?.location || 'your target location'
    const brandName = analysisData?.campaignData?.brandName || 'your brand'
    
    switch (action.id) {
      case 'poster':
        return `Perfect! I have your complete ${campaignType} analysis data for ${brandName} targeting ${location}. 

For your poster designs targeting ${targetAudience} in ${location} with a ${budgetRange} budget, do you have any specific preferences for:

• **Visual Style**: Modern/minimal, bold/colorful, professional/corporate, creative/artistic?
• **Color Palette**: Any specific colors or brand guidelines to follow?
• **Messaging Focus**: Primary message or call-to-action you want to emphasize?
• **Format**: Digital only, print-ready, or both?
• **Tone**: Serious/professional, fun/engaging, inspirational, or urgent?
• **Location-Specific Elements**: Any local cultural elements from ${location} to incorporate?

Or would you like me to generate based on your Qloo cultural insights and analytics data for ${location}?`
        
      case 'script':
        return `Excellent! I have your complete ${campaignType} analysis data for ${brandName} targeting ${location}.

For your video/audio scripts targeting ${targetAudience} in ${location} with a ${budgetRange} budget, do you have any specific preferences for:

• **Format Priority**: TV commercial, social media video, podcast, radio, or all?
• **Duration**: Short (15-30s), medium (30-60s), or long (60s+)?
• **Tone**: Professional, conversational, humorous, emotional, or inspirational?
• **Call-to-Action**: What specific action do you want viewers/listeners to take?
• **Platform Focus**: Any specific platforms or channels?
• **Location-Specific Elements**: Any local cultural elements from ${location} to incorporate?

Or would you like me to generate based on your Qloo cultural insights and analytics data for ${location}?`
        
      case 'theme':
        return `Great! I have your complete ${campaignType} analysis data for ${brandName} targeting ${location}.

For your campaign theme and messaging targeting ${targetAudience} in ${location} with a ${budgetRange} budget, do you have any specific preferences for:

• **Brand Voice**: Professional, friendly, authoritative, innovative, or trustworthy?
• **Emotional Appeal**: What emotion do you want to evoke (trust, excitement, urgency, etc.)?
• **Key Message**: Any specific message or value proposition to emphasize?
• **Differentiation**: What makes your campaign unique?
• **Tone**: Serious, lighthearted, inspirational, or urgent?
• **Location-Specific Elements**: Any local cultural elements from ${location} to incorporate?

Or would you like me to generate based on your Qloo cultural insights and analytics data for ${location}?`
        
      case 'content':
        return `Perfect! I have your complete ${campaignType} analysis data for ${brandName} targeting ${location}.

For your social media and blog content targeting ${targetAudience} in ${location} with a ${budgetRange} budget, do you have any specific preferences for:

• **Platform Focus**: Instagram, LinkedIn, Twitter, Facebook, or all?
• **Content Type**: Educational, entertaining, promotional, or storytelling?
• **Posting Frequency**: Daily, weekly, or specific schedule?
• **Tone**: Professional, casual, humorous, or inspirational?
• **Hashtag Strategy**: Any specific hashtags or themes to include?
• **Location-Specific Elements**: Any local cultural elements from ${location} to incorporate?

Or would you like me to generate based on your Qloo cultural insights and analytics data for ${location}?`
        
      case 'strategy':
        return `Excellent! I have your complete ${campaignType} analysis data for ${brandName} targeting ${location}.

For your campaign strategy targeting ${targetAudience} in ${location} with a ${budgetRange} budget, do you have any specific preferences for:

• **Focus Areas**: Digital marketing, traditional media, events, partnerships, or all?
• **Timeline**: Aggressive (quick launch) or gradual (phased approach)?
• **Budget Allocation**: Any specific channels or tactics to prioritize?
• **Success Metrics**: What's most important (awareness, engagement, conversions)?
• **Risk Tolerance**: Conservative or aggressive approach?
• **Location-Specific Elements**: Any local cultural elements from ${location} to incorporate?

Or would you like me to generate based on your Qloo cultural insights and analytics data for ${location}?`
        
      case 'ideas':
        return `Great! I have your complete ${campaignType} analysis data for ${brandName} targeting ${location}.

For your creative campaign ideas targeting ${targetAudience} in ${location} with a ${budgetRange} budget, do you have any specific preferences for:

• **Idea Type**: Viral/social media, events, partnerships, technology, or influencer?
• **Budget Level**: Low-cost, medium, or high-budget ideas?
• **Timeline**: Quick wins, medium-term, or long-term concepts?
• **Risk Level**: Safe/conservative, moderate, or high-risk/high-reward?
• **Platform Focus**: Digital, offline, or integrated approaches?
• **Location-Specific Elements**: Any local cultural elements from ${location} to incorporate?

Or would you like me to generate based on your Qloo cultural insights and analytics data for ${location}?`
        
      default:
        return `I'd be happy to help you generate ${action.title.toLowerCase()}! 

Do you have any specific preferences or requirements?

Or would you like me to generate based on your analysis data?`
    }
  }

  const generateDataDrivenPrompt = (action, userPreference = '') => {
    const hasAnalysisData = analysisData && analyticsData
    
    if (!hasAnalysisData) {
      return action.prompt // Fallback to original prompt if no data
    }

    // Extract specific data points for content generation
    const campaignType = analysisData?.campaignData?.campaignType || 'PR campaign'
    const targetAudience = analysisData?.campaignData?.targetAudience || 'target audience'
    const budgetRange = analysisData?.campaignData?.budgetRange || 'specified budget'
    const timeline = analysisData?.campaignData?.timeline || 'campaign timeline'
    
    // Extract location data from campaign
    const location = analysisData?.campaignData?.location || 'target location'
    const targetScope = analysisData?.campaignData?.targetScope || 'target scope'
    const brandName = analysisData?.campaignData?.brandName || 'brand'
    const category = analysisData?.campaignData?.category || 'category'
    const productDetails = analysisData?.campaignData?.productDetails || 'product/service'
    
    // Extract Qloo cultural insights
    const qlooInsights = analysisData?.qlooInsights?.finalAnalysis?.keyInsights || []
    const qlooRecommendations = analysisData?.qlooInsights?.finalAnalysis?.recommendations || []
    const qlooStrategy = analysisData?.qlooInsights?.finalAnalysis?.strategy || {}
    const qlooContent = analysisData?.qlooInsights?.finalAnalysis?.content || {}
    
    // Extract specific Qloo data
    const qlooBasicInsights = analysisData?.qlooData?.basicInsights || {}
    const qlooAudienceData = analysisData?.qlooData?.audienceData || {}
    const qlooGeospatialData = analysisData?.qlooData?.geospatialData || {}
    
    // Extract analytics data
    const analyticsCharts = analyticsData || {}
    
    // Generate specific prompts based on action type
    switch (action.id) {
      case 'poster':
        return `Generate EXCLUSIVE poster designs specifically for this ${campaignType} targeting ${targetAudience}.

ACTUAL CAMPAIGN DATA:
- Brand Name: "${brandName}"
- Category: "${category}"
- Product/Service: "${productDetails}"
- Campaign Type: "${campaignType}"
- Target Audience: "${targetAudience}"
- Target Location: "${location}"
- Target Scope: "${targetScope}"
- Budget Range: "${budgetRange}"
- Timeline: "${timeline}"

USER PREFERENCES: ${userPreference || 'Generate based on Qloo cultural insights and analytics data'}

QLOO CULTURAL INSIGHTS TO INCORPORATE:
${qlooInsights.map(insight => `• ${insight}`).join('\n')}

QLOO RECOMMENDATIONS:
${qlooRecommendations.map(rec => `• ${rec.title || rec}`).join('\n')}

QLOO GEOSPATIAL DATA:
${JSON.stringify(qlooGeospatialData, null, 2)}

ANALYTICS DATA:
${Object.keys(analyticsCharts).map(chart => `• ${chart}: ${JSON.stringify(analyticsCharts[chart])}`).join('\n')}

CRITICAL REQUIREMENTS:
1. Use the EXACT brand name: "${brandName}"
2. Use the EXACT category: "${category}"
3. Use the EXACT product/service: "${productDetails}"
4. Use the EXACT target location: "${location}"
5. Use the EXACT target scope: "${targetScope}"
6. Use the EXACT budget range: "${budgetRange}"
7. Use the EXACT timeline: "${timeline}"
8. NEVER use generic examples or placeholder text
9. ALWAYS reference the specific campaign data provided above

Generate 3-5 specific poster concepts that:
1. Use the exact cultural insights from Qloo data for "${location}"
2. Incorporate the target audience demographics from "${location}"
3. Match the campaign budget and timeline
4. Include specific visual elements, color schemes, and messaging relevant to "${location}"
5. Reference the analytics data for visual appeal
6. Be highly specific to this campaign for "${location}", not generic
7. Incorporate user preferences: ${userPreference}
8. Consider local cultural elements and preferences from "${location}"
9. ALWAYS use the exact brand name "${brandName}" and category "${category}"

Provide detailed descriptions for each poster concept including layout, colors, typography, and messaging specific to "${location}". Use the exact campaign details provided above.`

      case 'script':
        return `Generate EXCLUSIVE video and audio scripts specifically for this ${campaignType} targeting ${targetAudience}.

ACTUAL CAMPAIGN DATA:
- Brand Name: "${brandName}"
- Category: "${category}"
- Product/Service: "${productDetails}"
- Campaign Type: "${campaignType}"
- Target Audience: "${targetAudience}"
- Target Location: "${location}"
- Target Scope: "${targetScope}"
- Budget Range: "${budgetRange}"
- Timeline: "${timeline}"

USER PREFERENCES: ${userPreference || 'Generate based on Qloo cultural insights and analytics data'}

QLOO CULTURAL INSIGHTS TO INCORPORATE:
${qlooInsights.map(insight => `• ${insight}`).join('\n')}

QLOO CONTENT STRATEGY:
${JSON.stringify(qlooContent, null, 2)}

QLOO GEOSPATIAL DATA:
${JSON.stringify(qlooGeospatialData, null, 2)}

ANALYTICS DATA:
${Object.keys(analyticsCharts).map(chart => `• ${chart}: ${JSON.stringify(analyticsCharts[chart])}`).join('\n')}

CRITICAL REQUIREMENTS:
1. Use the EXACT brand name: "${brandName}"
2. Use the EXACT category: "${category}"
3. Use the EXACT product/service: "${productDetails}"
4. Use the EXACT target location: "${location}"
5. Use the EXACT target scope: "${targetScope}"
6. Use the EXACT budget range: "${budgetRange}"
7. Use the EXACT timeline: "${timeline}"
8. NEVER use generic examples or placeholder text
9. ALWAYS reference the specific campaign data provided above

Generate 3-4 specific script formats:
1. 30-second TV commercial script
2. 60-second social media video script
3. 2-minute podcast segment script
4. Radio advertisement script

Each script should:
- Use the exact cultural insights from Qloo data for "${location}"
- Target the specific audience demographics from "${location}"
- Match the campaign budget and timeline
- Include specific dialogue, tone, and messaging relevant to "${location}"
- Reference the analytics data for effectiveness
- Be highly specific to this campaign for "${location}", not generic
- Incorporate user preferences: ${userPreference}
- Consider local cultural elements and preferences from "${location}"
- ALWAYS use the exact brand name "${brandName}" and category "${category}"

Provide complete scripts with dialogue, stage directions, and timing specific to "${location}". Use the exact campaign details provided above.`

      case 'theme':
        return `Generate EXCLUSIVE campaign theme and messaging strategy specifically for this ${campaignType} targeting ${targetAudience}.

ACTUAL CAMPAIGN DATA:
- Brand Name: "${brandName}"
- Category: "${category}"
- Product/Service: "${productDetails}"
- Campaign Type: "${campaignType}"
- Target Audience: "${targetAudience}"
- Target Location: "${location}"
- Target Scope: "${targetScope}"
- Budget Range: "${budgetRange}"
- Timeline: "${timeline}"

USER PREFERENCES: ${userPreference || 'Generate based on Qloo cultural insights and analytics data'}

QLOO CULTURAL INSIGHTS TO INCORPORATE:
${qlooInsights.map(insight => `• ${insight}`).join('\n')}

QLOO STRATEGY DATA:
${JSON.stringify(qlooStrategy, null, 2)}

QLOO RECOMMENDATIONS:
${qlooRecommendations.map(rec => `• ${rec.title || rec}`).join('\n')}

QLOO GEOSPATIAL DATA:
${JSON.stringify(qlooGeospatialData, null, 2)}

ANALYTICS DATA:
${Object.keys(analyticsCharts).map(chart => `• ${chart}: ${JSON.stringify(analyticsCharts[chart])}`).join('\n')}

CRITICAL REQUIREMENTS:
1. Use the EXACT brand name: "${brandName}"
2. Use the EXACT category: "${category}"
3. Use the EXACT product/service: "${productDetails}"
4. Use the EXACT target location: "${location}"
5. Use the EXACT target scope: "${targetScope}"
6. Use the EXACT budget range: "${budgetRange}"
7. Use the EXACT timeline: "${timeline}"
8. NEVER use generic examples or placeholder text
9. ALWAYS reference the specific campaign data provided above

Generate a comprehensive theme strategy including:
1. Main Campaign Tagline (3-5 options)
2. Key Messages (5-7 specific messages)
3. Tone of Voice Guidelines
4. Brand Positioning Statement
5. Visual Identity Guidelines
6. Messaging Hierarchy

Each element should:
- Be based on the exact cultural insights from Qloo data for "${location}"
- Target the specific audience demographics from "${location}"
- Match the campaign budget and timeline
- Reference the analytics data for effectiveness
- Be highly specific to this campaign for "${location}", not generic
- Incorporate user preferences: ${userPreference}
- Consider local cultural elements and preferences from "${location}"
- ALWAYS use the exact brand name "${brandName}" and category "${category}"

Provide detailed explanations for each element and how it connects to the analysis data for "${location}". Use the exact campaign details provided above.`

      case 'content':
        return `Generate EXCLUSIVE social media and blog content specifically for this ${campaignType} targeting ${targetAudience}.

ACTUAL CAMPAIGN DATA:
- Brand Name: "${brandName}"
- Category: "${category}"
- Product/Service: "${productDetails}"
- Campaign Type: "${campaignType}"
- Target Audience: "${targetAudience}"
- Target Location: "${location}"
- Target Scope: "${targetScope}"
- Budget Range: "${budgetRange}"
- Timeline: "${timeline}"

USER PREFERENCES: ${userPreference || 'Generate based on Qloo cultural insights and analytics data'}

QLOO CULTURAL INSIGHTS TO INCORPORATE:
${qlooInsights.map(insight => `• ${insight}`).join('\n')}

QLOO CONTENT STRATEGY:
${JSON.stringify(qlooContent, null, 2)}

QLOO RECOMMENDATIONS:
${qlooRecommendations.map(rec => `• ${rec.title || rec}`).join('\n')}

QLOO GEOSPATIAL DATA:
${JSON.stringify(qlooGeospatialData, null, 2)}

ANALYTICS DATA:
${Object.keys(analyticsCharts).map(chart => `• ${chart}: ${JSON.stringify(analyticsCharts[chart])}`).join('\n')}

CRITICAL REQUIREMENTS:
1. Use the EXACT brand name: "${brandName}"
2. Use the EXACT category: "${category}"
3. Use the EXACT product/service: "${productDetails}"
4. Use the EXACT target location: "${location}"
5. Use the EXACT target scope: "${targetScope}"
6. Use the EXACT budget range: "${budgetRange}"
7. Use the EXACT timeline: "${timeline}"
8. NEVER use generic examples or placeholder text
9. ALWAYS reference the specific campaign data provided above

Generate specific content pieces:
1. 5 Social Media Posts (different platforms)
2. 1 Blog Post (500-800 words)
3. 1 Press Release
4. 3 Email Newsletter Templates
5. Content Calendar (2-week schedule)

Each piece should:
- Use the exact cultural insights from Qloo data for "${location}"
- Target the specific audience demographics from "${location}"
- Match the campaign budget and timeline
- Include specific hashtags, CTAs, and messaging relevant to "${location}"
- Reference the analytics data for engagement
- Be highly specific to this campaign for "${location}", not generic
- Incorporate user preferences: ${userPreference}
- Consider local cultural elements and preferences from "${location}"
- ALWAYS use the exact brand name "${brandName}" and category "${category}"

Provide complete content with exact copy, hashtags, and posting recommendations specific to "${location}". Use the exact campaign details provided above.`

      case 'strategy':
        return `Generate EXCLUSIVE campaign strategy specifically for this ${campaignType} targeting ${targetAudience}.

ACTUAL CAMPAIGN DATA:
- Brand Name: "${brandName}"
- Category: "${category}"
- Product/Service: "${productDetails}"
- Campaign Type: "${campaignType}"
- Target Audience: "${targetAudience}"
- Target Location: "${location}"
- Target Scope: "${targetScope}"
- Budget Range: "${budgetRange}"
- Timeline: "${timeline}"

USER PREFERENCES: ${userPreference || 'Generate based on Qloo cultural insights and analytics data'}

QLOO CULTURAL INSIGHTS TO INCORPORATE:
${qlooInsights.map(insight => `• ${insight}`).join('\n')}

QLOO STRATEGY DATA:
${JSON.stringify(qlooStrategy, null, 2)}

QLOO RECOMMENDATIONS:
${qlooRecommendations.map(rec => `• ${rec.title || rec}`).join('\n')}

QLOO AUDIENCE DATA:
${JSON.stringify(qlooAudienceData, null, 2)}

QLOO GEOSPATIAL DATA:
${JSON.stringify(qlooGeospatialData, null, 2)}

ANALYTICS DATA:
${Object.keys(analyticsCharts).map(chart => `• ${chart}: ${JSON.stringify(analyticsCharts[chart])}`).join('\n')}

CRITICAL REQUIREMENTS:
1. Use the EXACT brand name: "${brandName}"
2. Use the EXACT category: "${category}"
3. Use the EXACT product/service: "${productDetails}"
4. Use the EXACT target location: "${location}"
5. Use the EXACT target scope: "${targetScope}"
6. Use the EXACT budget range: "${budgetRange}"
7. Use the EXACT timeline: "${timeline}"
8. NEVER use generic examples or placeholder text
9. ALWAYS reference the specific campaign data provided above

Generate a comprehensive strategy including:
1. Detailed Tactics (10-15 specific tactics)
2. Timeline with milestones
3. Budget allocation breakdown
4. Success metrics and KPIs
5. Risk management plan
6. Implementation roadmap

Each element should:
- Be based on the exact cultural insights from Qloo data for "${location}"
- Target the specific audience demographics from "${location}"
- Match the campaign budget and timeline
- Reference the analytics data for effectiveness
- Include specific tactics and timelines
- Be highly specific to this campaign for "${location}", not generic
- Incorporate user preferences: ${userPreference}
- Consider local cultural elements and preferences from "${location}"
- ALWAYS use the exact brand name "${brandName}" and category "${category}"

Provide detailed explanations for each element and how it connects to the analysis data for "${location}". Use the exact campaign details provided above.`

      case 'ideas':
        return `Generate EXCLUSIVE creative campaign ideas specifically for this ${campaignType} targeting ${targetAudience}.

ACTUAL CAMPAIGN DATA:
- Brand Name: "${brandName}"
- Category: "${category}"
- Product/Service: "${productDetails}"
- Campaign Type: "${campaignType}"
- Target Audience: "${targetAudience}"
- Target Location: "${location}"
- Target Scope: "${targetScope}"
- Budget Range: "${budgetRange}"
- Timeline: "${timeline}"

USER PREFERENCES: ${userPreference || 'Generate based on Qloo cultural insights and analytics data'}

QLOO CULTURAL INSIGHTS TO INCORPORATE:
${qlooInsights.map(insight => `• ${insight}`).join('\n')}

QLOO RECOMMENDATIONS:
${qlooRecommendations.map(rec => `• ${rec.title || rec}`).join('\n')}

QLOO AUDIENCE DATA:
${JSON.stringify(qlooAudienceData, null, 2)}

QLOO GEOSPATIAL DATA:
${JSON.stringify(qlooGeospatialData, null, 2)}

ANALYTICS DATA:
${Object.keys(analyticsCharts).map(chart => `• ${chart}: ${JSON.stringify(analyticsCharts[chart])}`).join('\n')}

CRITICAL REQUIREMENTS:
1. Use the EXACT brand name: "${brandName}"
2. Use the EXACT category: "${category}"
3. Use the EXACT product/service: "${productDetails}"
4. Use the EXACT target location: "${location}"
5. Use the EXACT target scope: "${targetScope}"
6. Use the EXACT budget range: "${budgetRange}"
7. Use the EXACT timeline: "${timeline}"
8. NEVER use generic examples or placeholder text
9. ALWAYS reference the specific campaign data provided above

Generate 5-7 innovative campaign ideas including:
1. Viral/Shareable Concepts
2. Partnership Opportunities
3. Unique Event Ideas
4. Interactive Campaign Elements
5. Technology Integration Ideas
6. Influencer Collaboration Concepts

Each idea should:
- Be based on the exact cultural insights from Qloo data for "${location}"
- Target the specific audience demographics from "${location}"
- Match the campaign budget and timeline
- Include specific implementation details
- Reference the analytics data for virality potential
- Be highly specific to this campaign for "${location}", not generic
- Incorporate user preferences: ${userPreference}
- Consider local cultural elements and preferences from "${location}"
- ALWAYS use the exact brand name "${brandName}" and category "${category}"

Provide detailed descriptions for each idea including concept, implementation, expected outcomes, and budget considerations specific to "${location}". Use the exact campaign details provided above.`

      default:
        return action.prompt
    }
  }

  const generateResponse = async (userMessage) => {
    setIsLoading(true)
    
    try {
      console.log('🔍 Chatbot Debug:', {
        hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
        userMessage,
        hasAnalysisData: !!(analysisData && analyticsData)
      })
      
      const hasAnalysisData = analysisData && analyticsData
      
             if (hasAnalysisData) {
         // Prepare comprehensive context data for the AI when analysis data is available
         const contextData = {
           // Complete analysis object with all Qloo and Gemini data
           completeAnalysis: analysisData || {},
           
           // Campaign details
           campaign: analysisData?.campaignData || {},
           
           // Complete Qloo insights and data
           qlooInsights: analysisData?.qlooInsights || {},
           qlooData: analysisData?.qlooData || {},
           rawQlooData: analysisData?.qlooData?.results || [],
           
           // Final analysis from Gemini
           finalAnalysis: analysisData?.qlooInsights?.finalAnalysis || {},
           
           // All analytics data
           analytics: analyticsData || {},
           
           // Structured sections from the analysis
           strategy: analysisData?.qlooInsights?.finalAnalysis?.strategy || {},
           implementation: analysisData?.qlooInsights?.finalAnalysis?.implementation || {},
           measurement: analysisData?.qlooInsights?.finalAnalysis?.measurement || {},
           content: analysisData?.qlooInsights?.finalAnalysis?.content || {},
           recommendations: analysisData?.qlooInsights?.finalAnalysis?.recommendations || [],
           
           // Additional analysis components
           keyInsights: analysisData?.qlooInsights?.finalAnalysis?.keyInsights || [],
           overview: analysisData?.qlooInsights?.finalAnalysis?.overview || {},
           executiveSummary: analysisData?.qlooInsights?.finalAnalysis?.executiveSummary || {},
           
           // Raw Qloo API responses
           qlooBasicInsights: analysisData?.qlooData?.basicInsights || {},
           qlooAudienceData: analysisData?.qlooData?.audienceData || {},
           qlooGeospatialData: analysisData?.qlooData?.geospatialData || {},
           
           // Analytics source information
           analyticsSource: analyticsData?.source || 'Generated',
           dataPoints: analysisData?.qlooData?.results?.filter(r => r.success)?.length || 0
         }

         // Get recent conversation context (last 5 messages)
         const recentMessages = messages.slice(-5).map(msg => 
           `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
         ).join('\n')

                   const prompt = `You are an expert PR campaign consultant with access to the complete Qloo and Gemini analysis response. You have full context of the entire analysis and can provide highly accurate, data-driven recommendations.

COMPLETE ANALYSIS CONTEXT:

CAMPAIGN DETAILS:
- Brand Name: ${contextData.campaign?.brandName || 'N/A'}
- Category: ${contextData.campaign?.category || 'N/A'}
- Product/Service: ${contextData.campaign?.productDetails || 'N/A'}
- Campaign Type: ${contextData.campaign?.campaignType || 'N/A'}
- Target Audience: ${contextData.campaign?.targetAudience || 'N/A'}
- Target Location: ${contextData.campaign?.location || 'N/A'}
- Target Scope: ${contextData.campaign?.targetScope || 'N/A'}
- Budget Range: ${contextData.campaign?.budgetRange || 'N/A'}
- Timeline: ${contextData.campaign?.timeline || 'N/A'}

QLOO CULTURAL INSIGHTS:
${contextData.keyInsights?.map(insight => `• ${insight}`).join('\n') || 'No insights available'}

QLOO RECOMMENDATIONS:
${contextData.recommendations?.map(rec => `• ${rec.title || rec}`).join('\n') || 'No recommendations available'}

QLOO STRATEGY DATA:
${JSON.stringify(contextData.strategy, null, 2)}

QLOO CONTENT STRATEGY:
${JSON.stringify(contextData.content, null, 2)}

QLOO AUDIENCE DATA:
${JSON.stringify(contextData.qlooAudienceData, null, 2)}

QLOO GEOSPATIAL DATA:
${JSON.stringify(contextData.qlooGeospatialData, null, 2)}

ANALYTICS DATA:
${Object.keys(contextData.analytics).map(chart => `• ${chart}: ${JSON.stringify(contextData.analytics[chart])}`).join('\n')}

RECENT CONVERSATION CONTEXT:
${recentMessages}

USER REQUEST: "${userMessage}"

Based on the EXACT Qloo and Gemini analysis data above, provide a highly specific, data-driven response to the user's request. 

CRITICAL REQUIREMENTS:
1. ALWAYS reference specific data points from the analysis (e.g., "Based on your Qloo cultural insights showing [specific insight], I recommend...")
2. Use the EXACT campaign details in your response:
   - Brand Name: "${contextData.campaign?.brandName || 'N/A'}"
   - Category: "${contextData.campaign?.category || 'N/A'}"
   - Product/Service: "${contextData.campaign?.productDetails || 'N/A'}"
   - Target Location: "${contextData.campaign?.location || 'N/A'}"
   - Target Scope: "${contextData.campaign?.targetScope || 'N/A'}"
   - Budget Range: "${contextData.campaign?.budgetRange || 'N/A'}"
   - Timeline: "${contextData.campaign?.timeline || 'N/A'}"
3. Reference specific analytics data when relevant
4. Include concrete examples based on the actual analysis data
5. Provide actionable recommendations that are specific to this campaign for "${contextData.campaign?.location || 'your target location'}"
6. Use the exact cultural insights and recommendations from Qloo
7. Reference the strategy and content data when applicable
8. Be highly specific - avoid generic advice
9. ALWAYS consider the target location ("${contextData.campaign?.location || 'N/A'}") in your recommendations
10. Use geospatial data when available to provide location-specific insights
11. NEVER use generic examples - always use the specific brand, category, and location data provided
12. If the user asks about location, use the exact location data: "${contextData.campaign?.location || 'N/A'}"
13. If the user asks about brand, use the exact brand name: "${contextData.campaign?.brandName || 'N/A'}"
14. If the user asks about category, use the exact category: "${contextData.campaign?.category || 'N/A'}"
15. If the user asks about target scope, use the exact scope: "${contextData.campaign?.targetScope || 'N/A'}"

RESPONSE FORMAT:
- Start with a direct answer to the user's question
- Reference specific data points from the analysis
- Provide concrete, actionable recommendations
- Include specific examples based on the actual campaign data
- Keep it concise but comprehensive (2-3 paragraphs max)
- Always consider the target location in your recommendations
- ALWAYS use the exact brand name, category, location, and target scope provided
- NEVER use placeholder text or generic examples

Remember: This response should be EXCLUSIVE to this specific campaign based on the actual Qloo and Gemini analysis data, not generic PR advice. Use the exact campaign details provided above.

Answer:`

                 const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
        const result = await model.generateContent(prompt)
        const response = await result.response.text()
        
        return response
              } else {
                     // Provide general PR campaign guidance when no analysis data is available
           const prompt = `You are an expert PR campaign consultant providing concise, actionable guidance.

USER REQUEST: "${userMessage}"

Provide a brief, helpful response (2-3 sentences max for simple questions, 1-2 paragraphs max for complex requests).

Guidelines:
- Be conversational and concise
- Give specific, actionable advice
- Include brief examples when relevant
- Keep responses short and to the point
- For simple greetings, just welcome them warmly

Answer:`

                 const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
        const result = await model.generateContent(prompt)
        const response = await result.response.text()
        
        return response
      }
    } catch (error) {
      console.error('Error generating chatbot response:', error)
      
      // More specific error messages based on the error type
      if (error.message?.includes('API_KEY')) {
        return "❌ API Key Error: Please check your Gemini API key configuration."
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        return "⚠️ Rate Limit: Too many requests. Please wait a moment and try again."
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        return "🌐 Network Error: Please check your internet connection and try again."
      } else if (error.message?.includes('timeout')) {
        return "⏰ Timeout: The request took too long. Please try again."
      } else {
        return `❌ Error: ${error.message || 'Unknown error occurred'}. Please try again.`
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    
    // Add user message
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage
    }
    
    setMessages(prev => [...prev, newUserMessage])

    // Check if we're awaiting user preference for a quick action
    if (awaitingUserPreference && currentAction) {
      // Generate content based on user preference and action
      const enhancedPrompt = generateDataDrivenPrompt(currentAction, userMessage)
      const botResponse = await generateResponse(enhancedPrompt)
      
      const newBotMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse
      }
      
      setMessages(prev => [...prev, newBotMessage])
      setAwaitingUserPreference(false)
      setCurrentAction(null)
    } else {
      // Regular conversation
      const botResponse = await generateResponse(userMessage)
      
      const newBotMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse
      }
      
      setMessages(prev => [...prev, newBotMessage])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleChatbot = () => {
    if (isOpen) {
      // Save current session when closing
      saveCurrentSession()
    }
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions)
  }

  // Save current session to history
  const saveCurrentSession = () => {
    if (messages.length > 1) { // More than just the welcome message
      const sessionData = {
        id: currentSessionId,
        timestamp: new Date().toISOString(),
        messages: messages,
        analysisData: analysisData,
        analyticsData: analyticsData,
        campaignType: analysisData?.campaignData?.campaignType || 'General PR',
        summary: `Session with ${messages.length - 1} exchanges`
      }
      
      setChatHistory(prev => {
        const updated = [sessionData, ...prev.filter(session => session.id !== currentSessionId)]
        return updated.slice(0, 10) // Keep only last 10 sessions
      })
    }
  }

  // Load a previous session
  const loadSession = (session) => {
    setMessages(session.messages)
    setCurrentSessionId(session.id)
    setShowHistory(false)
  }

  // Clear all chat history
  const clearHistory = () => {
    setChatHistory([])
    localStorage.removeItem('chatbot_history')
  }

  // Get session summary for display
  const getSessionSummary = (session) => {
    const date = new Date(session.timestamp).toLocaleDateString()
    const time = new Date(session.timestamp).toLocaleTimeString()
    return `${date} at ${time} - ${session.summary}`
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleChatbot}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : 'w-[500px] h-[600px]'
      }`}>
                 {/* Header */}
         <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
           <div className="flex items-center space-x-2">
             <Bot className="w-5 h-5" />
             <span className="font-semibold">AI Campaign Assistant</span>
           </div>
           <div className="flex items-center space-x-2">
             <button
               onClick={() => setShowHistory(!showHistory)}
               className="text-white hover:text-gray-200 transition-colors"
               title="Chat History"
             >
               <History className="w-4 h-4" />
             </button>
             <button
               onClick={toggleMinimize}
               className="text-white hover:text-gray-200 transition-colors"
             >
               {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
             </button>
             <button
               onClick={toggleChatbot}
               className="text-white hover:text-gray-200 transition-colors"
             >
               <X className="w-4 h-4" />
             </button>
           </div>
         </div>

                 {!isMinimized && (
           <>
             {/* History Panel */}
             {showHistory && (
               <div className="p-4 border-b border-gray-200 bg-gray-50">
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="text-sm font-semibold text-gray-700">Chat History</h3>
                   <button
                     onClick={clearHistory}
                     className="text-red-500 hover:text-red-700 text-xs flex items-center space-x-1"
                     title="Clear all history"
                   >
                     <Trash2 className="w-3 h-3" />
                     <span>Clear All</span>
                   </button>
                 </div>
                 <div className="space-y-2 max-h-32 overflow-y-auto">
                   {chatHistory.length === 0 ? (
                     <p className="text-xs text-gray-500 text-center py-2">No previous conversations</p>
                   ) : (
                     chatHistory.map((session) => (
                       <button
                         key={session.id}
                         onClick={() => loadSession(session)}
                         className="w-full text-left p-2 rounded-lg bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                       >
                         <div className="text-xs font-medium text-gray-800 truncate">
                           {session.campaignType}
                         </div>
                         <div className="text-xs text-gray-500 truncate">
                           {getSessionSummary(session)}
                         </div>
                       </button>
                     ))
                   )}
                 </div>
               </div>
             )}
             
             {/* Messages */}
             <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[380px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                      )}
                      <div className="whitespace-pre-wrap text-sm leading-relaxed space-y-2">
                        {message.content.split('\n').map((line, index) => {
                          if (line.trim().startsWith('•')) {
                            return (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="text-primary-600 font-bold mt-1">•</span>
                                <span className="flex-1">{line.replace('•', '').trim()}</span>
                              </div>
                            )
                          }
                          return <div key={index}>{line}</div>
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
                             {/* Session Info */}
               {analysisData && analyticsData && messages.length === 1 && (
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                   <div className="text-xs font-medium text-blue-800 mb-2">
                     📊 Complete Qloo & Gemini Analysis Available
                   </div>
                   <div className="text-xs text-blue-700 space-y-1">
                     <div>• Campaign Type: {analysisData?.campaignData?.campaignType || 'N/A'}</div>
                     <div>• Target Audience: {analysisData?.campaignData?.targetAudience || 'N/A'}</div>
                     <div>• Budget Range: {analysisData?.campaignData?.budgetRange || 'N/A'}</div>
                     <div>• Timeline: {analysisData?.campaignData?.timeline || 'N/A'}</div>
                     <div>• Qloo Data Points: {analysisData?.qlooData?.results?.filter(r => r.success)?.length || 0} successful API responses</div>
                     <div>• Analytics Charts: {Object.keys(analyticsData || {}).length} data visualizations</div>
                     <div>• Strategic Recommendations: {analysisData?.qlooInsights?.finalAnalysis?.recommendations?.length || 0} data-driven recommendations</div>
                     <div>• Key Insights: {analysisData?.qlooInsights?.finalAnalysis?.keyInsights?.length || 0} cultural insights</div>
                     <div>• Complete Analysis: Full Qloo API + Gemini AI response available</div>
                   </div>
                   
                   {/* Key Insights Preview */}
                   {analysisData?.qlooInsights?.finalAnalysis?.keyInsights && (
                     <div className="mt-3 pt-3 border-t border-blue-200">
                       <div className="text-xs font-medium text-blue-800 mb-1">🔍 Key Insights:</div>
                       <div className="text-xs text-blue-700">
                         {analysisData.qlooInsights.finalAnalysis.keyInsights.slice(0, 2).map((insight, index) => (
                           <div key={index} className="truncate">• {insight}</div>
                         ))}
                         {analysisData.qlooInsights.finalAnalysis.keyInsights.length > 2 && (
                           <div className="text-blue-600">+{analysisData.qlooInsights.finalAnalysis.keyInsights.length - 2} more insights</div>
                         )}
                       </div>
                     </div>
                   )}
                   
                   {/* Top Recommendations Preview */}
                   {analysisData?.qlooInsights?.finalAnalysis?.recommendations && analysisData.qlooInsights.finalAnalysis.recommendations.length > 0 && (
                     <div className="mt-3 pt-3 border-t border-blue-200">
                       <div className="text-xs font-medium text-blue-800 mb-1">💡 Top Recommendations:</div>
                       <div className="text-xs text-blue-700">
                         {analysisData.qlooInsights.finalAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                           <div key={index} className="truncate">• {rec.title || rec}</div>
                         ))}
                         {analysisData.qlooInsights.finalAnalysis.recommendations.length > 2 && (
                           <div className="text-blue-600">+{analysisData.qlooInsights.finalAnalysis.recommendations.length - 2} more recommendations</div>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               )}
               
                               {/* Quick Actions */}
                {showQuickActions && (
                 <div className="space-y-3">
                   <div className="text-center text-sm text-gray-600 font-medium">
                     🚀 Quick Campaign Generation
                   </div>
                                     <div className="grid grid-cols-2 gap-2">
                     {quickActions.map((action) => {
                       const Icon = action.icon
                       return (
                         <button
                           key={action.id}
                           onClick={() => handleQuickAction(action)}
                           disabled={isGenerating}
                           className="group relative px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden bg-white"
                         >
                                                       {/* Snake-like moving border */}
                            <div className="absolute inset-0 rounded-full animate-snake-border">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-pink-500 animate-snake-move"></div>
                            </div>
                            
                            {/* Content */}
                            <div className="relative flex flex-col items-center space-y-1 px-2 py-1 z-10">
                              <Icon className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
                              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors leading-tight text-center">
                                {action.title}
                              </span>
                            </div>
                         </button>
                       )
                     })}
                   </div>
                  <button
                    onClick={toggleQuickActions}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Hide Quick Actions
                  </button>
                </div>
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-800 p-4 rounded-2xl shadow-sm max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-primary-500" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your campaign..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-3 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
                             {/* Show Quick Actions Toggle */}
               {!showQuickActions && messages.length > 1 && (
                 <button
                   onClick={toggleQuickActions}
                   className="w-full mt-2 text-xs text-primary-600 hover:text-primary-700 transition-colors"
                 >
                   Show Quick Actions
                 </button>
               )}
               
                               {/* Suggested Questions */}
                {analysisData && analyticsData && (
                 <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                   <div className="text-xs font-medium text-gray-700 mb-2">💭 Suggested Questions:</div>
                   <div className="space-y-1">
                                           <button
                        onClick={async () => {
                          const userMessage = "Based on my Qloo cultural insights, what specific content would resonate most with my target audience?"
                          const newUserMessage = {
                            id: Date.now(),
                            type: 'user',
                            content: userMessage
                          }
                          setMessages(prev => [...prev, newUserMessage])
                          const response = await generateResponse(userMessage)
                          const newBotMessage = {
                            id: Date.now() + 1,
                            type: 'bot',
                            content: response
                          }
                          setMessages(prev => [...prev, newBotMessage])
                        }}
                        className="w-full text-left text-xs text-primary-600 hover:text-primary-700 transition-colors truncate"
                      >
                        • What content would resonate with my audience based on Qloo insights?
                      </button>
                      <button
                        onClick={async () => {
                          const userMessage = "How should I allocate my budget based on the analytics and Qloo data?"
                          const newUserMessage = {
                            id: Date.now(),
                            type: 'user',
                            content: userMessage
                          }
                          setMessages(prev => [...prev, newUserMessage])
                          const response = await generateResponse(userMessage)
                          const newBotMessage = {
                            id: Date.now() + 1,
                            type: 'bot',
                            content: response
                          }
                          setMessages(prev => [...prev, newBotMessage])
                        }}
                        className="w-full text-left text-xs text-primary-600 hover:text-primary-700 transition-colors truncate"
                      >
                        • How should I allocate my budget based on the analytics data?
                      </button>
                      <button
                        onClick={async () => {
                          const userMessage = "What specific tactics from my Gemini strategy should I prioritize first?"
                          const newUserMessage = {
                            id: Date.now(),
                            type: 'user',
                            content: userMessage
                          }
                          setMessages(prev => [...prev, newUserMessage])
                          const response = await generateResponse(userMessage)
                          const newBotMessage = {
                            id: Date.now() + 1,
                            type: 'bot',
                            content: response
                          }
                          setMessages(prev => [...prev, newBotMessage])
                        }}
                        className="w-full text-left text-xs text-primary-600 hover:text-primary-700 transition-colors truncate"
                      >
                        • Which tactics from my strategy should I prioritize first?
                      </button>
                      <button
                        onClick={async () => {
                          const userMessage = "Generate a social media campaign based on my Qloo audience data and cultural insights"
                          const newUserMessage = {
                            id: Date.now(),
                            type: 'user',
                            content: userMessage
                          }
                          setMessages(prev => [...prev, newUserMessage])
                          const response = await generateResponse(userMessage)
                          const newBotMessage = {
                            id: Date.now() + 1,
                            type: 'bot',
                            content: response
                          }
                          setMessages(prev => [...prev, newBotMessage])
                        }}
                        className="w-full text-left text-xs text-primary-600 hover:text-primary-700 transition-colors truncate"
                      >
                        • Generate social media campaign based on my Qloo data
                      </button>
                      <button
                        onClick={async () => {
                          const userMessage = "What are the key performance indicators I should track based on my analytics?"
                          const newUserMessage = {
                            id: Date.now(),
                            type: 'user',
                            content: userMessage
                          }
                          setMessages(prev => [...prev, newUserMessage])
                          const response = await generateResponse(userMessage)
                          const newBotMessage = {
                            id: Date.now() + 1,
                            type: 'bot',
                            content: response
                          }
                          setMessages(prev => [...prev, newBotMessage])
                        }}
                        className="w-full text-left text-xs text-primary-600 hover:text-primary-700 transition-colors truncate"
                      >
                        • What KPIs should I track based on my analytics?
                      </button>
                   </div>
                 </div>
               )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Chatbot