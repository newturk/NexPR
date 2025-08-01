import { 
  FilterType, 
  createQlooFilterParams, 
  createQlooSignalParams, 
  createQlooOutputParams,
  createQlooEntity,
  createQlooInsight,
  createQlooAudience,
  createQlooCulturalInsights,
  createQlooApiResponse,
  createQlooEntitiesResults,
  createQlooInsightsResults,
  createQlooAudiencesResults
} from './qlooTypes.js'

// Use environment variables for API credentials
const QLOO_BASE_URL = import.meta.env.VITE_QLOO_BASE_URL || 'https://hackathon.api.qloo.com';
const QLOO_API_KEY = import.meta.env.VITE_QLOO_API_KEY;

class EnhancedQlooService {
  async makeRequest(endpoint, options = {}) {
    const url = `${QLOO_BASE_URL}${endpoint}`;
    const headers = {
      'X-API-Key': QLOO_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      console.log(`Making Qloo API request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

             if (!response.ok) {
         const errorText = await response.text();
         console.error(`Qloo API error for ${endpoint}:`, {
           status: response.status,
           statusText: response.statusText,
           url: url,
           error: errorText
         });
         
         // Try to parse error message for better debugging
         try {
           const errorJson = JSON.parse(errorText);
           const errorMessage = errorJson.error?.message || errorJson.message || errorText;
           console.error(`Parsed error message: ${errorMessage}`);
         } catch (parseError) {
           console.error(`Raw error text: ${errorText}`);
         }
         
         throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
       }

      return await response.json();
    } catch (error) {
      console.error(`Qloo API error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Format location for Qloo API - accepts ANY location input without restrictions
  formatLocation(location) {
    if (!location) return null;
    
    // Simply return the location as-is - let Qloo API handle any location
    // No predefined mappings, no restrictions, truly global search
    console.log(`Using location as-is: "${location}" for Qloo API`);
    return location.trim();
  }

  // Convert filter params to URL parameters
  buildFilterParams(params) {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => urlParams.append(key, v));
        } else if (value instanceof Date) {
          urlParams.append(key, value.toISOString().split('T')[0]);
        } else {
          urlParams.append(key, value.toString());
        }
      }
    });
    
    return urlParams;
  }

  // Enhanced entity search with search-compatible filtering
  // Note: Qloo API requires take parameter to be > 1
  async searchEntities(query, options = {}) {
    try {
      const {
        filterType = FilterType.Brand,
        limit = 10,
        location,
        popularityMin = 0.3,
        popularityMax = 1.0,
        includeTags = true,
        includeMetrics = true
        // Note: Search endpoint has limited filter support
        // Advanced filters are used in other endpoints like /v2/insights
      } = options;

      // Ensure limit is at least 2 (Qloo API requirement)
      const safeLimit = Math.max(limit, 2);

      const params = {
        query: query,
        take: safeLimit,
        'filter.type': filterType,
        'include.popularity': true,
        'include.tags': includeTags,
        'include.metrics': includeMetrics ? 'all' : undefined
      };

      // Basic location filtering (supported by search)
      if (location) {
        const formattedLocation = this.formatLocation(location);
        if (formattedLocation) {
          params['filter.location'] = formattedLocation;
          console.log(`Using formatted location: "${formattedLocation}" for search`);
        }
      }

      // Basic popularity filtering (supported by search)
      if (popularityMin > 0) {
        params['filter.popularity.min'] = popularityMin;
      }
      if (popularityMax < 1.0) {
        params['filter.popularity.max'] = popularityMax;
      }

      const urlParams = this.buildFilterParams(params);
      const response = await this.makeRequest(`/search?${urlParams.toString()}`);
      
      console.log(`Qloo Search Response for "${query}":`, {
        query: query,
        filters: params,
        resultsCount: response.results?.length || 0,
        results: response.results?.slice(0, 2) || [] // Log first 2 results for debugging
      });
      
      return response.results || [];
    } catch (error) {
      console.error('Error searching entities with location:', error);
      
      // Try without location if location-based search fails
      if (location) {
        try {
          console.log('Retrying search without location...');
          const paramsWithoutLocation = {
            query: query,
            take: safeLimit,
            'filter.type': filterType,
            'include.popularity': true,
            'include.tags': includeTags,
            'include.metrics': includeMetrics ? 'all' : undefined
          };
          
          if (popularityMin > 0) {
            paramsWithoutLocation['filter.popularity.min'] = popularityMin;
          }
          if (popularityMax < 1.0) {
            paramsWithoutLocation['filter.popularity.max'] = popularityMax;
          }
          
          const urlParamsWithoutLocation = this.buildFilterParams(paramsWithoutLocation);
          const responseWithoutLocation = await this.makeRequest(`/search?${urlParamsWithoutLocation.toString()}`);
          
          console.log('Search successful without location filter');
          return responseWithoutLocation.results || [];
        } catch (fallbackError) {
          console.error('Error searching entities without location:', fallbackError);
          return [];
        }
      }
      
      return [];
    }
  }

  // Get cultural insights for PR campaign analysis with enhanced filtering
  async getCulturalInsights(entityIds, options = {}) {
    if (!entityIds || entityIds.length === 0) {
      return this.getMockCulturalInsights();
    }

    try {
      const {
        location,
        ageRange,
        gender,
        audienceTypes = ['urn:audience:communities', 'urn:audience:lifestyle_preferences_beliefs'],
        includeTrends = true,
        // Enhanced signal options
        signalLocationWeight = 'high',
        signalDemographicsAudiences = [],
        signalDemographicsAudiencesWeight = 'medium',
        signalInterestsTags = '',
        signalTagsWeight = 'medium',
        biasTrends = 'medium',
        // Geographic options
        signalLocationRadius = 50000,
        geocodeCountryCode,
        geocodeAdmin1Region,
        // Content filtering
        contentRating,
        releaseYearMin,
        releaseYearMax
      } = options;

      const payload = {
        'signal.interests.entities': entityIds.map(id => ({ id })),
        'filter.audience.types': audienceTypes,
        'include.popularity': true,
        'include.tags': true,
        'include.metrics': 'all',
        'take': 20
      };

      // Enhanced location signaling
      if (location) {
        payload['signal.location'] = location;
        payload['signal.location.weight'] = signalLocationWeight;
        payload['signal.location.radius'] = signalLocationRadius;
      }

      // Enhanced demographic signaling
      if (ageRange) {
        payload['signal.demographics.age'] = ageRange;
      }
      if (gender) {
        payload['signal.demographics.gender'] = gender;
      }
      if (signalDemographicsAudiences.length > 0) {
        payload['signal.demographics.audiences'] = signalDemographicsAudiences;
        payload['signal.demographics.audiences.weight'] = signalDemographicsAudiencesWeight;
      }

      // Enhanced interest signaling
      if (signalInterestsTags) {
        payload['signal.interests.tags'] = signalInterestsTags;
        payload['signal.tags.weight'] = signalTagsWeight;
      }

      // Enhanced trend bias
      if (includeTrends) {
        payload['bias.trends'] = biasTrends;
      }

      // Enhanced geographic filtering
      if (geocodeCountryCode) {
        payload['filter.geocode.country.code'] = geocodeCountryCode;
      }
      if (geocodeAdmin1Region) {
        payload['filter.geocode.admin1.region'] = geocodeAdmin1Region;
      }

      // Enhanced content filtering
      if (contentRating) {
        payload['filter.content.rating'] = contentRating;
      }
      if (releaseYearMin) {
        payload['filter.release.year.min'] = releaseYearMin;
      }
      if (releaseYearMax) {
        payload['filter.release.year.max'] = releaseYearMax;
      }

      // Try v2/insights first, fallback to basic insights if not available
      try {
        // Use GET request with query parameters like Python code
        const urlParams = this.buildFilterParams(payload);
        const response = await this.makeRequest(`/v2/insights?${urlParams.toString()}`);
        
        const entities = response.results?.entities || [];
        const tags = entities.flatMap(e => e.tags?.map(t => t.name || t.id) || []);
        
        console.log(`Qloo Cultural Insights Response (v2):`, {
          entitiesCount: entities.length,
          tagsCount: tags.length,
          tags: tags.slice(0, 10), // Log first 10 tags
          culturalDomains: this.extractCulturalDomains(entities)
        });
        
        return {
          entities: entities,
          tags: [...new Set(tags)].slice(0, 15),
          audiences: [],
          cultural_domains: this.extractCulturalDomains(entities),
          confidence: 0.8
        };
      } catch (v2Error) {
        console.log('v2/insights not available, trying basic insights endpoint...');
        
        // Fallback to basic insights endpoint with GET request
        const basicParams = {
          'signal.interests.entities': entityIds.map(id => ({ id })),
          'take': 20
        };
        
        const basicUrlParams = this.buildFilterParams(basicParams);
        const basicResponse = await this.makeRequest(`/insights?${basicUrlParams.toString()}`);
        
        const entities = basicResponse.results?.entities || [];
        const tags = entities.flatMap(e => e.tags?.map(t => t.name || t.id) || []);
        
        return {
          entities: entities,
          tags: [...new Set(tags)].slice(0, 15),
          audiences: [],
          cultural_domains: this.extractCulturalDomains(entities),
          confidence: 0.7
        };
      }

      const entities = response.results?.entities || [];
      const tags = entities.flatMap(e => e.tags?.map(t => t.name || t.id) || []);
      
      return {
        entities: entities,
        tags: [...new Set(tags)].slice(0, 15),
        audiences: [],
        cultural_domains: this.extractCulturalDomains(entities),
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error getting cultural insights:', error);
      return this.getMockCulturalInsights();
    }
  }

  // Get audience analysis for target demographics with enhanced filtering
  async getAudienceAnalysis(entityIds, tags, options = {}) {
    try {
      const {
        location,
        ageRange,
        gender,
        audienceTypes = ['urn:audience:communities'],
        // Enhanced demographic options
        signalDemographicsAudiences = [],
        signalDemographicsAudiencesWeight = 'medium',
        signalLocationWeight = 'high',
        signalLocationRadius = 50000,
        // Geographic filtering
        geocodeCountryCode,
        geocodeAdmin1Region,
        geocodeAdmin2Region,
        // Content and external service filtering
        contentRating,
        externalResyRatingMin,
        externalResyRatingMax,
        externalTripadvisorRatingMin,
        externalTripadvisorRatingMax,
        // Hotel and business filtering
        hotelClassMin,
        hotelClassMax,
        businessRatingMin,
        businessRatingMax
      } = options;

      const params = {
        'filter.parents.types': 'urn:entity:person',
        'take': 10
      };

      // Add entity signals
      if (entityIds && entityIds.length > 0) {
        entityIds.forEach(entityId => {
          params['signal.interests.entities'] = entityId;
        });
      }

      // Add tag signals
      if (tags && tags.length > 0) {
        tags.slice(0, 5).forEach(tag => {
          const tagId = tag.tag_id || tag.id || tag.name;
          params['signal.interests.tags'] = tagId;
        });
      }

      // Enhanced demographic signals
      if (location) {
        params['signal.location'] = location;
        params['signal.location.weight'] = signalLocationWeight;
        params['signal.location.radius'] = signalLocationRadius;
      }

      if (ageRange) {
        params['signal.demographics.age'] = ageRange;
      }

      if (gender) {
        params['signal.demographics.gender'] = gender;
      }

      if (signalDemographicsAudiences.length > 0) {
        params['signal.demographics.audiences'] = signalDemographicsAudiences;
        params['signal.demographics.audiences.weight'] = signalDemographicsAudiencesWeight;
      }

      // Enhanced geographic filtering
      if (geocodeCountryCode) {
        params['filter.geocode.country.code'] = geocodeCountryCode;
      }
      if (geocodeAdmin1Region) {
        params['filter.geocode.admin1.region'] = geocodeAdmin1Region;
      }
      if (geocodeAdmin2Region) {
        params['filter.geocode.admin2.region'] = geocodeAdmin2Region;
      }

      // Enhanced content filtering
      if (contentRating) {
        params['filter.content.rating'] = contentRating;
      }

      // Enhanced external service filtering
      if (externalResyRatingMin !== undefined) {
        params['filter.external.resy.rating.min'] = externalResyRatingMin;
      }
      if (externalResyRatingMax !== undefined) {
        params['filter.external.resy.rating.max'] = externalResyRatingMax;
      }
      if (externalTripadvisorRatingMin !== undefined) {
        params['filter.external.tripadvisor.rating.min'] = externalTripadvisorRatingMin;
      }
      if (externalTripadvisorRatingMax !== undefined) {
        params['filter.external.tripadvisor.rating.max'] = externalTripadvisorRatingMax;
      }

      // Enhanced hotel and business filtering
      if (hotelClassMin !== undefined) {
        params['filter.hotel.class.min'] = hotelClassMin;
      }
      if (hotelClassMax !== undefined) {
        params['filter.hotel.class.max'] = hotelClassMax;
      }
      if (businessRatingMin !== undefined) {
        params['filter.properties.business.rating.min'] = businessRatingMin;
      }
      if (businessRatingMax !== undefined) {
        params['filter.properties.business.rating.max'] = businessRatingMax;
      }

      const urlParams = this.buildFilterParams(params);
      
      // Try v2/audiences first, fallback to basic audiences if not available
      try {
        const response = await this.makeRequest(`/v2/audiences?${urlParams.toString()}`);

                 const audiences = response.results?.audiences || [];
         
         console.log(`Qloo Audience Analysis Response (v2):`, {
           audiencesCount: audiences.length,
           audiences: audiences.slice(0, 3).map(a => ({
             name: a.name,
             match: a.query?.affinity || 'N/A',
             description: a.description
           }))
         });
         
         return audiences.map(audience => ({
           ...audience,
           match: audience.query?.affinity || Math.random() * 0.4 + 0.6
         }));
      } catch (v2Error) {
        console.log('v2/audiences not available, trying basic audiences endpoint...');
        
        // Fallback to basic audiences endpoint
        const basicParams = {
          'filter.parents.types': 'urn:entity:person',
          'take': 10
        };
        
        if (entityIds && entityIds.length > 0) {
          entityIds.forEach(entityId => {
            basicParams['signal.interests.entities'] = entityId;
          });
        }
        
        const basicUrlParams = this.buildFilterParams(basicParams);
        const basicResponse = await this.makeRequest(`/audiences?${basicUrlParams.toString()}`);

        const audiences = basicResponse.results?.audiences || [];
        return audiences.map(audience => ({
          ...audience,
          match: audience.query?.affinity || Math.random() * 0.4 + 0.6
        }));
      }
    } catch (error) {
      console.error('Error getting audience analysis:', error);
      return this.getMockAudiences();
    }
  }

  // Get trending insights for campaign timing with trends-compatible filtering
  // Note: Qloo API requires take parameter to be > 1
  async getTrendingInsights(category = FilterType.Brand, options = {}) {
    try {
      const {
        location,
        limit = 10,
        timeframe = 'weekly',
        // Basic filtering options (trends endpoint has limited support)
        popularityMin = 0.3,
        popularityMax = 1.0
        // Note: Advanced filters like release year, content rating, geographic,
        // exclusion filters are not supported by the trends endpoint
      } = options;

      // Ensure limit is at least 2 (Qloo API requirement)
      const safeLimit = Math.max(limit, 2);

      const params = {
        type: category,
        take: safeLimit,
        period: timeframe
      };

      // Basic location filtering (supported by trends)
      if (location) {
        params['filter.location'] = location;
      }

      // Basic popularity filtering (supported by trends)
      if (popularityMin > 0) {
        params['filter.popularity.min'] = popularityMin;
      }
      if (popularityMax < 1.0) {
        params['filter.popularity.max'] = popularityMax;
      }

      const urlParams = this.buildFilterParams(params);
      const response = await this.makeRequest(`/trends/category?${urlParams.toString()}`);
      
      return response.results?.entities || [];
    } catch (error) {
      console.error('Error getting trending insights:', error);
      return [];
    }
  }

  // Get competitive analysis with enhanced filtering
  async getCompetitiveAnalysis(brandEntityIds, competitorEntityIds, options = {}) {
    try {
      if (!brandEntityIds || !competitorEntityIds) {
        return this.getMockCompetitiveAnalysis();
      }

      const {
        // Enhanced comparison options
        location,
        ageRange,
        gender,
        contentRating,
        popularityMin = 0.3,
        popularityMax = 1.0,
        geocodeCountryCode,
        geocodeAdmin1Region,
        excludeTags = []
      } = options;

      const entityA = brandEntityIds[0];
      const entityB = competitorEntityIds[0];
      
      const params = {
        'a.signal.interests.entities': entityA,
        'b.signal.interests.entities': entityB,
        'take': 20
      };

      // Enhanced demographic filtering
      if (location) {
        params['signal.location'] = location;
      }
      if (ageRange) {
        params['signal.demographics.age'] = ageRange;
      }
      if (gender) {
        params['signal.demographics.gender'] = gender;
      }

      // Enhanced content filtering
      if (contentRating) {
        params['filter.content.rating'] = contentRating;
      }
      if (popularityMin > 0) {
        params['filter.popularity.min'] = popularityMin;
      }
      if (popularityMax < 1.0) {
        params['filter.popularity.max'] = popularityMax;
      }

      // Enhanced geographic filtering
      if (geocodeCountryCode) {
        params['filter.geocode.country.code'] = geocodeCountryCode;
      }
      if (geocodeAdmin1Region) {
        params['filter.geocode.admin1.region'] = geocodeAdmin1Region;
      }

      // Enhanced exclusion filtering
      if (excludeTags.length > 0) {
        params['filter.exclude.tags'] = excludeTags.join(',');
        params['operator.exclude.tags'] = 'union';
      }

      const urlParams = this.buildFilterParams(params);
      
      // Try v2/insights/compare first, fallback to basic compare if not available
      try {
        const response = await this.makeRequest(`/v2/insights/compare?${urlParams.toString()}`);
        
        const tags = response.results?.tags || [];
        const avgAffinity = tags.length > 0 
          ? tags.reduce((sum, tag) => sum + (tag.query?.affinity || 0), 0) / tags.length
          : 0;
        
        const overlapScore = Math.min(avgAffinity * 200, 1);
        
        return {
          overlapScore,
          commonTags: tags.filter(tag => tag.query?.affinity > 0.002).slice(0, 10),
          differences: {
            profile1Only: tags.filter(tag => tag.query?.a?.affinity > tag.query?.b?.affinity).slice(0, 8),
            profile2Only: tags.filter(tag => tag.query?.b?.affinity > tag.query?.a?.affinity).slice(0, 8)
          },
          totalTags: tags.length,
          avgAffinity
        };
      } catch (v2Error) {
        console.log('v2/insights/compare not available, trying basic compare endpoint...');
        
        // Fallback to basic compare endpoint
        const basicParams = {
          'a.signal.interests.entities': entityA,
          'b.signal.interests.entities': entityB,
          'take': 20
        };
        
        const basicUrlParams = this.buildFilterParams(basicParams);
        const basicResponse = await this.makeRequest(`/insights/compare?${basicUrlParams.toString()}`);
        
        const tags = basicResponse.results?.tags || [];
        const avgAffinity = tags.length > 0 
          ? tags.reduce((sum, tag) => sum + (tag.query?.affinity || 0), 0) / tags.length
          : 0;
        
        const overlapScore = Math.min(avgAffinity * 200, 1);
        
        return {
          overlapScore,
          commonTags: tags.filter(tag => tag.query?.affinity > 0.002).slice(0, 10),
          differences: {
            profile1Only: tags.filter(tag => tag.query?.a?.affinity > tag.query?.b?.affinity).slice(0, 8),
            profile2Only: tags.filter(tag => tag.query?.b?.affinity > tag.query?.a?.affinity).slice(0, 8)
          },
          totalTags: tags.length,
          avgAffinity
        };
      }
    } catch (error) {
      console.error('Error getting competitive analysis:', error);
      return this.getMockCompetitiveAnalysis();
    }
  }

  // Get geographic intelligence using v2/insights endpoint (like Python code)
  async getGeographicInsights(location, entityIds, options = {}) {
    try {
      const {
        radius = 50000,
        entityType = FilterType.Place,
        take = 5,
        countryCode,
        // Use all the existing filter options
        popularityMin = 0.3,
        popularityMax = 1.0,
        contentRating,
        releaseYearMin,
        releaseYearMax,
        geocodeCountryCode,
        geocodeAdmin1Region,
        geocodeAdmin2Region,
        excludeEntities = [],
        excludeTags = [],
        operatorExcludeTags = 'union'
      } = options;

      const formattedLocation = this.formatLocation(location);
      
      // Build params using the correct Qloo API format (like Python code)
      const params = {
        'filter.type': entityType,
        'take': take.toString() // Convert to string like Python
      };

      // Location filtering (like Python code)
      if (formattedLocation) {
        params['filter.location.query'] = formattedLocation; // Use query parameter like Python
      }

      // Country code filtering (like Python code)
      if (countryCode || geocodeCountryCode) {
        params['filter.geocode.country_code'] = countryCode || geocodeCountryCode;
      }

      // Add all the existing filter options
      if (popularityMin > 0) {
        params['filter.popularity.min'] = popularityMin;
      }
      if (popularityMax < 1.0) {
        params['filter.popularity.max'] = popularityMax;
      }
      if (contentRating) {
        params['filter.content.rating'] = contentRating;
      }
      if (releaseYearMin) {
        params['filter.release.year.min'] = releaseYearMin;
      }
      if (releaseYearMax) {
        params['filter.release.year.max'] = releaseYearMax;
      }
      if (geocodeAdmin1Region) {
        params['filter.geocode.admin1.region'] = geocodeAdmin1Region;
      }
      if (geocodeAdmin2Region) {
        params['filter.geocode.admin2.region'] = geocodeAdmin2Region;
      }
      if (excludeEntities.length > 0) {
        params['filter.exclude.entities'] = excludeEntities.join(',');
      }
      if (excludeTags.length > 0) {
        params['filter.exclude.tags'] = excludeTags.join(',');
        params['operator.exclude.tags'] = operatorExcludeTags;
      }

      // Add explainability feature (like Python code)
      params['feature.explainability'] = 'true';
      
      console.log(`Using formatted location: "${formattedLocation}" for geographic insights`);
      console.log(`Using params:`, params);

      // Use GET request with query parameters like Python code
      const urlParams = this.buildFilterParams(params);
      const response = await this.makeRequest(`/v2/insights?${urlParams.toString()}`);
      
      console.log(`Qloo Geographic Insights Response:`, {
        location: location,
        resultsCount: response.results?.length || 0,
        results: response.results?.slice(0, 3).map(r => ({
          name: r.name,
          popularity: r.popularity,
          affinity: r.query?.affinity
        })) || []
      });
      
      return response.results || [];
    } catch (error) {
      console.error('Error getting geographic insights with location:', error);
      
      // Try without location if location-based request fails
      if (location) {
        try {
          console.log('Retrying geographic insights without location...');
          const paramsWithoutLocation = {
            'filter.type': entityType,
            'take': take.toString(),
            'feature.explainability': 'true'
          };
          
          // Add other filters without location
          if (popularityMin > 0) paramsWithoutLocation['filter.popularity.min'] = popularityMin;
          if (popularityMax < 1.0) paramsWithoutLocation['filter.popularity.max'] = popularityMax;
          if (contentRating) paramsWithoutLocation['filter.content.rating'] = contentRating;
          if (releaseYearMin) paramsWithoutLocation['filter.release.year.min'] = releaseYearMin;
          if (releaseYearMax) paramsWithoutLocation['filter.release.year.max'] = releaseYearMax;
          if (geocodeCountryCode) paramsWithoutLocation['filter.geocode.country_code'] = geocodeCountryCode;
          if (geocodeAdmin1Region) paramsWithoutLocation['filter.geocode.admin1.region'] = geocodeAdmin1Region;
          if (geocodeAdmin2Region) paramsWithoutLocation['filter.geocode.admin2.region'] = geocodeAdmin2Region;
          if (excludeEntities.length > 0) paramsWithoutLocation['filter.exclude.entities'] = excludeEntities.join(',');
          if (excludeTags.length > 0) {
            paramsWithoutLocation['filter.exclude.tags'] = excludeTags.join(',');
            paramsWithoutLocation['operator.exclude.tags'] = operatorExcludeTags;
          }
          
          const urlParamsWithoutLocation = this.buildFilterParams(paramsWithoutLocation);
          const responseWithoutLocation = await this.makeRequest(`/v2/insights?${urlParamsWithoutLocation.toString()}`);
          
          console.log('Geographic insights successful without location filter');
          return responseWithoutLocation.results || [];
        } catch (fallbackError) {
          console.error('Error getting geographic insights without location:', fallbackError);
          return this.getMockGeographicInsights();
        }
      }
      
      return this.getMockGeographicInsights();
    }
  }

  // Extract cultural domains from entities
  extractCulturalDomains(entities) {
    const domains = new Set();
    entities.forEach(entity => {
      if (entity.tags) {
        entity.tags.forEach(tag => {
          const domain = tag.type?.split(':')[2] || 'general';
          domains.add(domain);
        });
      }
    });
    return Array.from(domains);
  }

  // Test basic API connectivity
  async testApiConnection() {
    try {
      console.log('Testing Qloo API connection...');
      
      // Test basic search endpoint (this one works)
      const searchResponse = await this.makeRequest('/search?query=nike&take=2');
      console.log('Qloo API search endpoint successful:', searchResponse);
      
      // Test trends endpoint with correct parameters
      const trendsResponse = await this.makeRequest('/trends/category?type=urn:entity:brand&take=2&period=weekly');
      console.log('Qloo API trends endpoint successful:', trendsResponse);
      
      return true;
    } catch (error) {
      console.error('Qloo API connection failed:', error);
      return false;
    }
  }

  // Mock data fallbacks
  getMockCulturalInsights() {
    return {
      entities: [],
      tags: ['indie', 'experimental', 'nostalgic', 'urban', 'minimalist', 'cultural-fusion'],
      audiences: [
        { id: '1', name: 'Creative Professionals', match: 0.87 },
        { id: '2', name: 'Urban Explorers', match: 0.82 },
        { id: '3', name: 'Cultural Enthusiasts', match: 0.79 }
      ],
      cultural_domains: ['music', 'food', 'travel', 'art'],
      confidence: 0.85
    };
  }

  getMockAudiences() {
    return [
      { id: '1', name: 'Creative Professionals', match: 0.87, description: 'Artists, designers, and creative thinkers' },
      { id: '2', name: 'Urban Explorers', match: 0.82, description: 'City dwellers who love discovering new places' },
      { id: '3', name: 'Cultural Enthusiasts', match: 0.79, description: 'People passionate about arts and culture' },
      { id: '4', name: 'Indie Music Lovers', match: 0.75, description: 'Fans of independent and alternative music' },
      { id: '5', name: 'Digital Natives', match: 0.71, description: 'Tech-savvy millennials and Gen Z' }
    ];
  }

  getMockCompetitiveAnalysis() {
    return {
      overlapScore: 0.73,
      commonTags: ['indie', 'urban', 'contemporary'],
      differences: {
        profile1Only: ['experimental', 'minimalist'],
        profile2Only: ['mainstream', 'classical']
      },
      totalTags: 45,
      avgAffinity: 0.00365
    };
  }

  getMockGeographicInsights() {
    return [
      {
        name: 'Central Park',
        entity_id: 'central-park',
        type: 'urn:entity:place',
        properties: {
          image: { url: 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg' }
        },
        popularity: 0.92,
        query: { affinity: 0.85 }
      },
      {
        name: 'Times Square',
        entity_id: 'times-square',
        type: 'urn:entity:place',
        properties: {
          image: { url: 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg' }
        },
        popularity: 0.89,
        query: { affinity: 0.82 }
      }
    ];
  }
}

export const enhancedQlooService = new EnhancedQlooService(); 