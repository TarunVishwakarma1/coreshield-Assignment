'use client';

import { useState } from 'react';
import { LocationWithMetadata, AnalysisResult } from '../types/location';
import { mergeLocationData, analyzeLocations, findLocationWithMostReviews, findIncompleteData } from '../utils/analysis';
import { ModeToggle } from '@/components/theme-toggle';
import { Upload, AlertCircle } from 'lucide-react';

interface ValidationError {
  message: string;
  field: 'locations' | 'metadata';
}

interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
}

interface MetadataData {
  id: string;
  type: string;
  rating: number;
  reviews: number;
}

export default function Home() {
  const [locationsJson, setLocationsJson] = useState('');
  const [metadataJson, setMetadataJson] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([]);
  const [mostReviewed, setMostReviewed] = useState<LocationWithMetadata | null>(null);
  const [incompleteData, setIncompleteData] = useState<LocationWithMetadata[]>([]);
  const [error, setError] = useState<ValidationError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateLocationData = (data: unknown[]): data is LocationData[] => {
    return data.every(item => 
      typeof (item as LocationData).id === 'string' &&
      typeof (item as LocationData).latitude === 'number' &&
      typeof (item as LocationData).longitude === 'number'
    );
  };

  const validateMetadataData = (data: unknown[]): data is MetadataData[] => {
    return data.every(item => 
      typeof (item as MetadataData).id === 'string' &&
      typeof (item as MetadataData).type === 'string' &&
      typeof (item as MetadataData).rating === 'number' &&
      typeof (item as MetadataData).reviews === 'number'
    );
  };

  const processData = () => {
    setIsProcessing(true);
    setError(null);

    try {
      let locationsData, metadataData;
      try {
        locationsData = JSON.parse(locationsJson);
      } catch (error) {
        console.error(error);
        setError({
          message: 'Invalid JSON format in locations data',
          field: 'locations'
        });
        return;
      }

      try {
        metadataData = JSON.parse(metadataJson);
      } catch (error) {
        console.error(error);
        setError({
          message: 'Invalid JSON format in metadata data',
          field: 'metadata'
        });
        return;
      }

      // Validate array structure
      if (!Array.isArray(locationsData)) {
        setError({
          message: 'Locations data must be an array',
          field: 'locations'
        });
        return;
      }

      if (!Array.isArray(metadataData)) {
        setError({
          message: 'Metadata data must be an array',
          field: 'metadata'
        });
        return;
      }

      // Validate data structure
      if (!validateLocationData(locationsData)) {
        setError({
          message: 'Invalid location data structure. Each item must have id (string), latitude (number), and longitude (number)',
          field: 'locations'
        });
        return;
      }

      if (!validateMetadataData(metadataData)) {
        setError({
          message: 'Invalid metadata data structure. Each item must have id (string), type (string), rating (number), and reviews (number)',
          field: 'metadata'
        });
        return;
      }

      const mergedData = mergeLocationData(locationsData, metadataData);
      setAnalysis(analyzeLocations(mergedData));
      setMostReviewed(findLocationWithMostReviews(mergedData));
      setIncompleteData(findIncompleteData(mergedData));
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
        field: 'locations' // Default to locations if we can't determine the source
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Location Analysis Dashboard</h1>
          <ModeToggle />
        </div>
        
        {/* JSON Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Input Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Locations JSON
              </label>
              <textarea
                value={locationsJson}
                onChange={(e) => {
                  setLocationsJson(e.target.value);
                  if (error?.field === 'locations') {
                    setError(null);
                  }
                }}
                className={`w-full h-48 p-3 border rounded-md font-mono text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ${
                  error?.field === 'locations' ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Paste locations JSON here..."
              />
              {error?.field === 'locations' && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Metadata JSON
              </label>
              <textarea
                value={metadataJson}
                onChange={(e) => {
                  setMetadataJson(e.target.value);
                  if (error?.field === 'metadata') {
                    setError(null);
                  }
                }}
                className={`w-full h-48 p-3 border rounded-md font-mono text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ${
                  error?.field === 'metadata' ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Paste metadata JSON here..."
              />
              {error?.field === 'metadata' && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={processData}
              disabled={isProcessing || !locationsJson || !metadataJson}
              className={`px-6 py-2 rounded-md text-white font-medium flex items-center gap-2 transition-colors ${
                isProcessing || !locationsJson || !metadataJson
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            >
              {isProcessing ? (
                <>
                  <Upload className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Process Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {analysis.length > 0 && (
          <>
            {/* Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {analysis.map((item) => (
                <div key={item.type} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize mb-4">{item.type}</h2>
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-300">Count: <span className="font-medium">{item.count}</span></p>
                    <p className="text-gray-600 dark:text-gray-300">Average Rating: <span className="font-medium">{item.averageRating} ⭐</span></p>
                    <p className="text-gray-600 dark:text-gray-300">Total Reviews: <span className="font-medium">{item.totalReviews}</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Most Reviewed Location */}
            {mostReviewed && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Most Reviewed Location</h2>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">ID: <span className="font-medium">{mostReviewed.id}</span></p>
                  <p className="text-gray-600 dark:text-gray-300">Type: <span className="font-medium capitalize">{mostReviewed.metadata?.type}</span></p>
                  <p className="text-gray-600 dark:text-gray-300">Rating: <span className="font-medium">{mostReviewed.metadata?.rating} ⭐</span></p>
                  <p className="text-gray-600 dark:text-gray-300">Reviews: <span className="font-medium">{mostReviewed.metadata?.reviews}</span></p>
                  <p className="text-gray-600 dark:text-gray-300">Coordinates: <span className="font-medium">{mostReviewed.latitude}, {mostReviewed.longitude}</span></p>
                </div>
              </div>
            )}

            {/* Incomplete Data */}
            {incompleteData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Locations with Incomplete Data</h2>
                <div className="space-y-2">
                  {incompleteData.map((location) => (
                    <div key={location.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                      <p className="text-gray-600 dark:text-gray-300">ID: <span className="font-medium">{location.id}</span></p>
                      <p className="text-gray-600 dark:text-gray-300">Coordinates: <span className="font-medium">{location.latitude}, {location.longitude}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
