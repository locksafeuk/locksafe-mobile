import { create } from 'zustand';
import type { Job, LocksmithApplication } from '../types';
import {
  getJob,
  getLocksmithJobs,
  getAvailableJobs,
  getJobApplications,
} from '../services/api/jobs';

interface JobState {
  currentJob: Job | null;
  locksmithJobs: Job[];
  availableJobs: Job[];
  applications: LocksmithApplication[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchJob: (jobId: string) => Promise<void>;
  fetchLocksmithJobs: (locksmithId: string) => Promise<void>;
  fetchAvailableJobs: (locksmithId: string) => Promise<void>;
  fetchApplications: (jobId: string) => Promise<void>;
  setCurrentJob: (job: Job | null) => void;
  updateJobInList: (updatedJob: Job) => void;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  currentJob: null,
  locksmithJobs: [],
  availableJobs: [],
  applications: [],
  isLoading: false,
  error: null,

  fetchJob: async (jobId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getJob(jobId);
      if (response.success) {
        set({ currentJob: response.job, isLoading: false });
      } else {
        set({ error: 'Failed to fetch job', isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch job',
        isLoading: false,
      });
    }
  },

  fetchLocksmithJobs: async (locksmithId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getLocksmithJobs(locksmithId);
      if (response.success) {
        set({ locksmithJobs: response.jobs, isLoading: false });
      } else {
        set({ error: 'Failed to fetch jobs', isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch jobs',
        isLoading: false,
      });
    }
  },

  fetchAvailableJobs: async (locksmithId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAvailableJobs(locksmithId);
      if (response.success) {
        set({ availableJobs: response.jobs, isLoading: false });
      } else {
        set({ error: 'Failed to fetch available jobs', isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch available jobs',
        isLoading: false,
      });
    }
  },

  fetchApplications: async (jobId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getJobApplications(jobId);
      if (response.success) {
        set({ applications: response.applications, isLoading: false });
      } else {
        set({ error: 'Failed to fetch applications', isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch applications',
        isLoading: false,
      });
    }
  },

  setCurrentJob: (job) => {
    set({ currentJob: job });
  },

  updateJobInList: (updatedJob) => {
    const { locksmithJobs, availableJobs, currentJob } = get();

    // Update in locksmithJobs
    const updatedLocksmithJobs = locksmithJobs.map((j) =>
      j.id === updatedJob.id ? updatedJob : j
    );

    // Remove from availableJobs if no longer pending
    const updatedAvailableJobs =
      updatedJob.status !== 'PENDING'
        ? availableJobs.filter((j) => j.id !== updatedJob.id)
        : availableJobs.map((j) => (j.id === updatedJob.id ? updatedJob : j));

    // Update currentJob if it matches
    const updatedCurrentJob =
      currentJob?.id === updatedJob.id ? updatedJob : currentJob;

    set({
      locksmithJobs: updatedLocksmithJobs,
      availableJobs: updatedAvailableJobs,
      currentJob: updatedCurrentJob,
    });
  },

  clearError: () => set({ error: null }),
}));
