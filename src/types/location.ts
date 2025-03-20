export interface Location {
  id: string;
  latitude: number;
  longitude: number;
}

export interface LocationMetadata {
  id: string;
  type: string;
  rating: number;
  reviews: number;
}

export interface LocationWithMetadata extends Location {
  metadata?: LocationMetadata;
}

export interface AnalysisResult {
  type: string;
  count: number;
  averageRating: number;
  totalReviews: number;
} 