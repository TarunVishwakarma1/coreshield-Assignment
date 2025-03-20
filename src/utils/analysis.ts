import { Location, LocationMetadata, LocationWithMetadata, AnalysisResult } from '../types/location';

export function mergeLocationData(locations: Location[], metadata: LocationMetadata[]): LocationWithMetadata[] {
  return locations.map(location => ({
    ...location,
    metadata: metadata.find(m => m.id === location.id)
  }));
}

export function analyzeLocations(locations: LocationWithMetadata[]): AnalysisResult[] {
  const typeMap = new Map<string, { count: number; totalRating: number; totalReviews: number }>();

  locations.forEach(location => {
    if (!location.metadata) return;

    const { type, rating, reviews } = location.metadata;
    const current = typeMap.get(type) || { count: 0, totalRating: 0, totalReviews: 0 };

    typeMap.set(type, {
      count: current.count + 1,
      totalRating: current.totalRating + rating,
      totalReviews: current.totalReviews + reviews
    });
  });

  return Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    averageRating: Number((data.totalRating / data.count).toFixed(1)),
    totalReviews: data.totalReviews
  }));
}

export function findLocationWithMostReviews(locations: LocationWithMetadata[]): LocationWithMetadata | null {
  return locations.reduce((max, current) => {
    if (!current.metadata) return max;
    if (!max?.metadata) return current;
    return current.metadata.reviews > max.metadata.reviews ? current : max;
  }, null as LocationWithMetadata | null);
}

export function findIncompleteData(locations: LocationWithMetadata[]): LocationWithMetadata[] {
  return locations.filter(location => !location.metadata);
} 