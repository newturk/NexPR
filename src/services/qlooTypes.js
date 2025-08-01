// Qloo API Types for PR Campaign Analysis

// Supporting Types
export const DATE_FORMAT = "yyyy-MM-dd";

export const LogicOperator = {
  Union: "union",
  Intersection: "intersection",
};

export const FilterType = {
  Artist: "urn:entity:artist",
  Book: "urn:entity:book",
  Brand: "urn:entity:brand",
  Destination: "urn:entity:destination",
  Movie: "urn:entity:movie",
  Person: "urn:entity:person",
  Place: "urn:entity:place",
  Podcast: "urn:entity:podcast",
  TVShow: "urn:entity:tv_show",
  VideoGame: "urn:entity:videogame",
  Heatmap: "urn:heatmap",
};

export const Gender = {
  Male: "male",
  Female: "female",
};

export const SignalWeight = {
  VeryLow: "very_low",
  Low: "low",
  Mid: "mid",
  Medium: "medium",
  High: "high",
  VeryHigh: "very_high",
};

// Signal Parameters
export const createQlooSignalParams = (params = {}) => ({
  biasTrends: params.biasTrends,
  signalDemographicsAudiences: params.signalDemographicsAudiences,
  signalDemographicsAudiencesWeight: params.signalDemographicsAudiencesWeight,
  signalDemographicsAge: params.signalDemographicsAge,
  signalDemographicsGender: params.signalDemographicsGender,
  signalInterestsEntities: params.signalInterestsEntities,
  signalInterestsEntitiesQuery: params.signalInterestsEntitiesQuery,
  signalInterestsTags: params.signalInterestsTags,
  operatorSignalInterestsTags: params.operatorSignalInterestsTags,
  signalLocation: params.signalLocation,
  signalLocationQuery: params.signalLocationQuery,
  signalLocationWeight: params.signalLocationWeight,
  signalLocationRadius: params.signalLocationRadius,
  signalTagsWeight: params.signalTagsWeight,
});

// Filter Parameters
export const createQlooFilterParams = (params = {}) => ({
  filterType: params.filterType,
  filterAddress: params.filterAddress,
  filterAudienceTypes: params.filterAudienceTypes,
  filterContentRating: params.filterContentRating,
  filterDateOfBirthMax: params.filterDateOfBirthMax,
  filterDateOfBirthMin: params.filterDateOfBirthMin,
  filterDateOfDeathMax: params.filterDateOfDeathMax,
  filterDateOfDeathMin: params.filterDateOfDeathMin,
  filterEntities: params.filterEntities,
  filterExcludeEntities: params.filterExcludeEntities,
  filterExcludeEntitiesQuery: params.filterExcludeEntitiesQuery,
  filterExcludeTags: params.filterExcludeTags,
  operatorExcludeTags: params.operatorExcludeTags,
  filterExternalExists: params.filterExternalExists,
  operatorFilterExternalExists: params.operatorFilterExternalExists,
  filterExternalResyCountMax: params.filterExternalResyCountMax,
  filterExternalResyCountMin: params.filterExternalResyCountMin,
  filterExternalResyPartySizeMax: params.filterExternalResyPartySizeMax,
  filterExternalResyPartySizeMin: params.filterExternalResyPartySizeMin,
  filterExternalResyRatingMax: params.filterExternalResyRatingMax,
  filterExternalResyRatingMin: params.filterExternalResyRatingMin,
  filterExternalTripadvisorRatingCountMax: params.filterExternalTripadvisorRatingCountMax,
  filterExternalTripadvisorRatingCountMin: params.filterExternalTripadvisorRatingCountMin,
  filterExternalTripadvisorRatingMax: params.filterExternalTripadvisorRatingMax,
  filterExternalTripadvisorRatingMin: params.filterExternalTripadvisorRatingMin,
  filterFinaleYearMax: params.filterFinaleYearMax,
  filterFinaleYearMin: params.filterFinaleYearMin,
  filterGender: params.filterGender,
  filterGeocodeAdmin1Region: params.filterGeocodeAdmin1Region,
  filterGeocodeAdmin2Region: params.filterGeocodeAdmin2Region,
  filterGeocodeCountryCode: params.filterGeocodeCountryCode,
  filterGeocodeName: params.filterGeocodeName,
  filterHotelClassMax: params.filterHotelClassMax,
  filterHotelClassMin: params.filterHotelClassMin,
  filterHours: params.filterHours,
  filterIds: params.filterIds,
  filterLatestKnownYearMax: params.filterLatestKnownYearMax,
  filterLatestKnownYearMin: params.filterLatestKnownYearMin,
  filterLocation: params.filterLocation,
  filterExcludeLocation: params.filterExcludeLocation,
  filterLocationQuery: params.filterLocationQuery,
  filterExcludeLocationQuery: params.filterExcludeLocationQuery,
  filterLocationGeohash: params.filterLocationGeohash,
  filterExcludeLocationGeohash: params.filterExcludeLocationGeohash,
  filterLocationRadius: params.filterLocationRadius,
  filterParentsTypes: params.filterParentsTypes,
  filterPopularityMax: params.filterPopularityMax,
  filterPopularityMin: params.filterPopularityMin,
  filterPriceLevelMax: params.filterPriceLevelMax,
  filterPriceLevelMin: params.filterPriceLevelMin,
  filterPriceRangeFrom: params.filterPriceRangeFrom,
  filterPriceRangeTo: params.filterPriceRangeTo,
  filterPropertiesBusinessRatingMax: params.filterPropertiesBusinessRatingMax,
  filterPropertiesBusinessRatingMin: params.filterPropertiesBusinessRatingMin,
  filterPublicationYearMax: params.filterPublicationYearMax,
  filterPublicationYearMin: params.filterPublicationYearMin,
  filterRatingMax: params.filterRatingMax,
  filterRatingMin: params.filterRatingMin,
  filterReferencesBrand: params.filterReferencesBrand,
  filterReleaseCountry: params.filterReleaseCountry,
  filterResultsEntities: params.filterResultsEntities,
  filterResultsEntitiesQuery: params.filterResultsEntitiesQuery,
  operatorFilterReleaseCountry: params.operatorFilterReleaseCountry,
  filterReleaseDateMax: params.filterReleaseDateMax,
  filterReleaseDateMin: params.filterReleaseDateMin,
  filterReleaseYearMax: params.filterReleaseYearMax,
  filterReleaseYearMin: params.filterReleaseYearMin,
  filterTagTypes: params.filterTagTypes,
  filterTags: params.filterTags,
  operatorFilterTags: params.operatorFilterTags,
});

// Output Parameters
export const createQlooOutputParams = (params = {}) => ({
  take: params.take,
  page: params.page,
  offset: params.offset,
  sort_by: params.sort_by,
  'feature.explainability': params['feature.explainability'],
  'include.popularity': params['include.popularity'],
  'include.tags': params['include.tags'],
  'include.metrics': params['include.metrics'],
  ...params
});

// Entity Types
export const createQlooExternalService = (data = {}) => ({
  id: data.id,
  ...data
});

export const createQlooNetflixInfo = (data = {}) => ({
  id: data.id,
  ...data
});

export const createQlooImdbInfo = (data = {}) => ({
  id: data.id,
  user_rating: data.user_rating,
  user_rating_count: data.user_rating_count,
  ...data
});

export const createQlooMetacriticInfo = (data = {}) => ({
  id: data.id,
  critic_rating: data.critic_rating,
  user_rating: data.user_rating,
  ...data
});

export const createQlooRottenTomatoesInfo = (data = {}) => ({
  id: data.id,
  critic_rating: data.critic_rating,
  critic_rating_count: data.critic_rating_count,
  user_rating: data.user_rating,
  user_rating_count: data.user_rating_count,
  ...data
});

export const createQlooSpotifyInfo = (data = {}) => ({
  id: data.id,
  verified: data.verified,
  followers: data.followers,
  monthly_listeners: data.monthly_listeners,
  last_release: data.last_release,
  first_release: data.first_release,
  artist_type: data.artist_type,
  ...data
});

export const createQlooLastfmInfo = (data = {}) => ({
  id: data.id,
  listeners: data.listeners,
  scrobbles: data.scrobbles,
  ...data
});

export const createQlooMusicbrainzInfo = (data = {}) => ({
  id: data.id,
  artist_type: data.artist_type,
  ...data
});

export const createQlooExternalServices = (data = {}) => ({
  netflix: data.netflix,
  wikidata: data.wikidata,
  twitter: data.twitter,
  facebook: data.facebook,
  instagram: data.instagram,
  letterboxd: data.letterboxd,
  metacritic: data.metacritic,
  rottentomatoes: data.rottentomatoes,
  imdb: data.imdb,
  spotify: data.spotify,
  lastfm: data.lastfm,
  musicbrainz: data.musicbrainz,
  goodreads: data.goodreads,
  ...data
});

export const createQlooTag = (data = {}) => ({
  id: data.id,
  name: data.name,
  type: data.type,
  score: data.score,
});

export const createQlooEntity = (data = {}) => ({
  name: data.name,
  entity_id: data.entity_id,
  type: data.type,
  subtype: data.subtype,
  properties: data.properties,
  popularity: data.popularity,
  tags: data.tags,
  disambiguation: data.disambiguation,
  external: data.external,
  query: data.query,
  references: data.references,
});

export const createQlooInsight = (data = {}) => ({
  name: data.name,
  entity_id: data.entity_id,
  type: data.type,
  subtype: data.subtype,
  properties: data.properties,
  popularity: data.popularity,
  tags: data.tags,
  score: data.score,
  external: data.external,
  query: data.query,
  disambiguation: data.disambiguation,
});

export const createQlooAudience = (data = {}) => ({
  id: data.id,
  name: data.name,
  match: data.match,
  description: data.description,
});

// API Response Types
export const createQlooApiResponse = (data = {}) => ({
  success: data.success,
  duration: data.duration,
  totalRequestDuration: data.totalRequestDuration,
  results: data.results,
});

export const createQlooEntitiesResults = (data = {}) => ({
  entities: data.entities,
  entity: data.entity,
});

export const createQlooInsightsResults = (data = {}) => ({
  entities: data.entities,
});

export const createQlooAudiencesResults = (data = {}) => ({
  audiences: data.audiences,
});

// Enhanced Analysis Types for PR Campaigns
export const createQlooCulturalInsights = (data = {}) => ({
  entities: data.entities,
  tags: data.tags,
  audiences: data.audiences,
  cultural_domains: data.cultural_domains,
  confidence: data.confidence,
});

export const createQlooAnalysisResult = (data = {}) => ({
  entity: data.entity,
  tags: data.tags,
  audiences: data.audiences,
  related_entities: data.related_entities,
});

export const createQlooCompareResult = (data = {}) => ({
  overlapScore: data.overlapScore,
  commonTags: data.commonTags,
  differences: data.differences,
  audienceOverlap: data.audienceOverlap,
});

// Legacy interfaces for backward compatibility
export const createEntity = (data = {}) => ({
  id: data.id,
  domain: data.domain,
  score: data.score,
  ...createQlooEntity(data)
});

export const createAudience = (data = {}) => createQlooAudience(data);

export const createInsightData = (data = {}) => ({
  entities: data.entities,
  tags: data.tags,
  audiences: data.audiences,
  cultural_domains: data.cultural_domains,
  confidence: data.confidence,
}); 