// ==========================================
// User Types
// ==========================================

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  emailVerified: boolean;
  termsAcceptedAt?: string;
  onboardingCompleted: boolean;
  oneSignalPlayerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Locksmith {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  profileImage?: string;
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  isVerified: boolean;
  isActive: boolean;
  licenseNumber?: string;
  insuranceNumber?: string;
  coverageAreas: string[];
  services: string[];
  yearsExperience: number;
  baseLat?: number;
  baseLng?: number;
  baseAddress?: string;
  coverageRadius: number;
  defaultAssessmentFee?: number;
  stripeConnectId?: string;
  stripeConnectOnboarded: boolean;
  stripeConnectVerified: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  isAvailable: boolean;
  lastAvailabilityChange?: string;
  scheduleEnabled: boolean;
  scheduleTimezone: string;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  scheduleDays: string[];
  oneSignalPlayerId?: string;
  termsAcceptedAt?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Job Types
// ==========================================

export type JobStatus =
  | 'PHONE_INITIATED'
  | 'PENDING'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'DIAGNOSING'
  | 'QUOTED'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_DECLINED'
  | 'IN_PROGRESS'
  | 'PENDING_CUSTOMER_CONFIRMATION'
  | 'COMPLETED'
  | 'SIGNED'
  | 'CANCELLED';

export type ProblemType =
  | 'lockout'
  | 'broken'
  | 'key-stuck'
  | 'snapped-key'
  | 'lock-change'
  | 'burglary'
  | 'safe'
  | 'car'
  | 'other';

export type PropertyType =
  | 'house'
  | 'flat'
  | 'commercial'
  | 'car'
  | 'garage'
  | 'shed'
  | 'other';

export interface GPSCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface Job {
  id: string;
  jobNumber: string;
  status: JobStatus;
  createdVia: 'web' | 'phone' | 'app';
  customerId: string;
  customer?: Customer;
  locksmithId?: string;
  locksmith?: Locksmith;
  problemType: ProblemType;
  propertyType: PropertyType;
  description?: string;
  postcode: string;
  address: string;
  latitude?: number;
  longitude?: number;
  assessmentFee: number;
  assessmentPaid: boolean;
  acceptedEta?: number;
  createdAt: string;
  acceptedAt?: string;
  enRouteAt?: string;
  estimatedArrival?: string;
  arrivedAt?: string;
  diagnosedAt?: string;
  workStartedAt?: string;
  workCompletedAt?: string;
  signedAt?: string;
  requestGps?: GPSCoordinates;
  acceptedGps?: GPSCoordinates;
  arrivalGps?: GPSCoordinates;
  quoteGps?: GPSCoordinates;
  workStartedGps?: GPSCoordinates;
  completionGps?: GPSCoordinates;
  signatureGps?: GPSCoordinates;
  photos?: Photo[];
  quote?: Quote;
  signature?: Signature;
  applications?: LocksmithApplication[];
  payments?: Payment[];
  review?: Review;
  distanceMiles?: number;
  _count?: {
    applications: number;
  };
  updatedAt: string;
}

export interface LocksmithApplication {
  id: string;
  jobId: string;
  locksmithId: string;
  locksmith?: Locksmith;
  assessmentFee: number;
  eta: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Quote Types
// ==========================================

export type LockType =
  | 'cylinder'
  | 'mortice'
  | 'multipoint'
  | 'rim'
  | 'padlock'
  | 'car';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'specialist';

export interface QuotePart {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  jobId: string;
  locksmithId: string;
  locksmith?: Locksmith;
  lockType: LockType;
  defect: string;
  difficulty: Difficulty;
  parts: QuotePart[];
  labourCost: number;
  labourTime: number;
  partsTotal: number;
  subtotal: number;
  vat: number;
  total: number;
  accepted: boolean;
  acceptedAt?: string;
  declinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Photo Types
// ==========================================

export type PhotoType =
  | 'BEFORE'
  | 'DURING'
  | 'AFTER'
  | 'LOCK_SERIAL'
  | 'DAMAGE'
  | 'OTHER';

export interface Photo {
  id: string;
  jobId: string;
  type: PhotoType;
  url: string;
  caption?: string;
  takenAt: string;
  gpsLat?: number;
  gpsLng?: number;
}

// ==========================================
// Payment Types
// ==========================================

export type PaymentType = 'assessment' | 'quote' | 'tip';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  jobId: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  stripePaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Signature Types
// ==========================================

export interface Signature {
  id: string;
  jobId: string;
  signatureData: string;
  signerName: string;
  signerIp?: string;
  deviceInfo?: string;
  confirmsWork: boolean;
  confirmsPrice: boolean;
  confirmsSatisfied: boolean;
  signedAt: string;
}

// ==========================================
// Review Types
// ==========================================

export interface Review {
  id: string;
  jobId: string;
  customerId: string;
  customer?: Customer;
  locksmithId: string;
  locksmith?: Locksmith;
  rating: number;
  comment?: string;
  isPublic: boolean;
  createdAt: string;
}

// ==========================================
// Notification Types
// ==========================================

export interface Notification {
  id: string;
  customerId?: string;
  locksmithId?: string;
  jobId?: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  readAt?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface JobCreateRequest {
  name: string;
  phone: string;
  email?: string;
  postcode: string;
  address: string;
  problemType: ProblemType;
  propertyType: PropertyType;
  description?: string;
  requestGps?: GPSCoordinates;
}

export interface JobCreateResponse {
  id: string;
  jobNumber: string;
  status: JobStatus;
  photoCount: number;
  success: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LocksmithRegisterRequest extends RegisterRequest {
  companyName?: string;
  baseLat?: number;
  baseLng?: number;
  coverageRadius?: number;
  services?: string[];
}

export interface DashboardStats {
  activeJobs: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
  pendingPayout?: number;
}

export interface LocksmithDashboard {
  locksmith: Locksmith;
  stats: DashboardStats;
  recentJobs: Job[];
}
