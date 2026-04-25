import { post, get, patch, del } from './client';
import type {
  Job,
  JobStatus,
  GPSCoordinates,
  Quote,
  Photo,
  PhotoType,
  LocksmithApplication,
  Review,
  ApiResponse,
} from '../../types';

// ==========================================
// Job API Types
// ==========================================

export interface JobListResponse {
  success: boolean;
  jobs: Job[];
  total?: number;
}

export interface JobDetailResponse {
  success: boolean;
  job: Job;
}

export interface ApplicationsResponse {
  success: boolean;
  applications: LocksmithApplication[];
}

export interface SubmitQuoteRequest {
  lockType: string;
  defect: string;
  difficulty: string;
  parts: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  labourCost: number;
  labourTime: number;
  gps?: GPSCoordinates;
}

export interface QuoteResponse {
  success: boolean;
  quote: Quote;
}

// ==========================================
// Job API Functions
// ==========================================

/**
 * Get job by ID
 */
export async function getJob(jobId: string): Promise<JobDetailResponse> {
  return get<JobDetailResponse>(`/api/jobs/${jobId}`);
}

/**
 * Get jobs for a locksmith
 */
export async function getLocksmithJobs(
  locksmithId: string,
  status?: JobStatus
): Promise<JobListResponse> {
  const params = new URLSearchParams({ locksmithId });
  if (status) params.append('status', status);
  return get<JobListResponse>(`/api/jobs?${params.toString()}`);
}

/**
 * Get available jobs for a locksmith (within coverage area)
 */
export async function getAvailableJobs(
  locksmithId: string
): Promise<JobListResponse & { jobs: (Job & { distanceMiles?: number })[] }> {
  return get(`/api/jobs?availableForLocksmith=${locksmithId}&status=PENDING`);
}

/**
 * Update job status (Locksmith)
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  gps?: GPSCoordinates
): Promise<ApiResponse<Job>> {
  return patch<ApiResponse<Job>>(`/api/jobs/${jobId}/status`, { status, gpsData: gps });
}

/**
 * Submit application for a job (Locksmith)
 */
export async function submitApplication(
  jobId: string,
  data: {
    locksmithId: string;
    assessmentFee: number;
    eta: number; // minutes
    message?: string;
  }
): Promise<ApiResponse<LocksmithApplication>> {
  return post<ApiResponse<LocksmithApplication>>(
    `/api/jobs/${jobId}/applications`,
    data
  );
}

/**
 * Get applications for a job
 */
export async function getJobApplications(
  jobId: string
): Promise<ApplicationsResponse> {
  return get<ApplicationsResponse>(`/api/jobs/${jobId}/applications`);
}

/**
 * Get locksmith's own applications
 */
export async function getLocksmithApplications(
  locksmithId: string
): Promise<{ success: boolean; applications: LocksmithApplication[] }> {
  return get(`/api/locksmith/applications?locksmithId=${locksmithId}`);
}

/**
 * Upload a photo for a job (Locksmith)
 */
export async function uploadJobPhoto(
  jobId: string,
  data: {
    url: string; // Base64 or URL
    type: PhotoType;
    caption?: string;
    gpsLat?: number;
    gpsLng?: number;
  }
): Promise<ApiResponse<Photo>> {
  return post<ApiResponse<Photo>>(`/api/jobs/${jobId}/photos`, data);
}

/**
 * Get photos for a job
 */
export async function getJobPhotos(
  jobId: string
): Promise<{ success: boolean; photos: Photo[] }> {
  return get(`/api/jobs/${jobId}/photos`);
}

/**
 * Delete a photo
 */
export async function deleteJobPhoto(
  jobId: string,
  photoId: string
): Promise<ApiResponse> {
  return del<ApiResponse>(`/api/jobs/${jobId}/photos/${photoId}`);
}

/**
 * Submit a quote for a job (Locksmith)
 */
export async function submitQuote(
  jobId: string,
  data: SubmitQuoteRequest
): Promise<QuoteResponse> {
  return post<QuoteResponse>(`/api/jobs/${jobId}/quote`, {
    lockType: data.lockType,
    defect: data.defect,
    difficulty: data.difficulty,
    parts: data.parts.map((p) => ({
      name: p.name,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
    })),
    labourCost: data.labourCost,
    labourTime: data.labourTime,
    gps: data.gps,
  });
}

/**
 * Get quote for a job
 */
export async function getJobQuote(
  jobId: string
): Promise<{ success: boolean; quote: Quote | null }> {
  return get(`/api/jobs/${jobId}/quote`);
}

/**
 * Get locksmith reviews
 */
export async function getLocksmithReviews(
  locksmithId: string
): Promise<{ success: boolean; reviews: Review[]; averageRating: number }> {
  return get(`/api/locksmiths/${locksmithId}/reviews`);
}
