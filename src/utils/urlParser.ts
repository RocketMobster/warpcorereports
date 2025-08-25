import { Report } from "../types";

/**
 * Parse the URL parameters to check if this is a shared report link
 * Returns the report ID if found, otherwise null
 */
export const parseSharedReportUrl = (): { reportId?: string, format?: string } => {
  // Check if we're on a shared report URL pattern
  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);
  
  // Extract report ID from path - with hash-based routing
  let reportId: string | undefined;
  if (hash.startsWith('#/shared-report/')) {
    reportId = hash.split('#/shared-report/')[1];
    
    // If there's a query string in the hash part, remove it
    if (reportId.includes('?')) {
      reportId = reportId.split('?')[0];
    }
  }
  
  // Extract format from query params
  const format = params.get('format') as "pdf" | "docx" | "txt" | null;
  
  return { 
    reportId,
    format: format || undefined
  };
};

/**
 * Decode a shared report ID and extract the embedded information
 * In a real app, this would fetch the report data from a server
 * For this demo, we extract basic info from the encoded ID
 */
export const decodeSharedReportId = (reportId: string): any | null => {
  try {
    // Try to decode as JSON first (new format)
    const decoded = atob(reportId);
    
    try {
      // Try to parse as JSON (new format)
      const jsonData = JSON.parse(decoded);
      return jsonData;
    } catch (jsonError) {
      console.warn("Failed to parse as JSON, falling back to legacy format", jsonError);
      
      // Fall back to the old format (hyphen-separated string)
      const parts = decoded.split('-');
      
      if (parts.length >= 2) {
        const result: { 
          title: string, 
          stardate: string, 
          vessel?: string,
          originalSeed?: string // Add seed to legacy format too
        } = {
          title: parts[0],
          stardate: parts[1],
          // Store the reportId as the seed to ensure consistent regeneration
          originalSeed: reportId
        };
        
        // Extract vessel if available (parts[2])
        if (parts.length >= 3) {
          result.vessel = parts[2];
        }
        
        return result;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to decode shared report ID:', error);
    return null;
  }
};
