import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface InterviewSettings {
  difficulty: "junior" | "intermediate" | "senior";
  type: "algorithms" | "system_design" | "behavioral" | "job_based";
  language: "fr" | "en";
  durationMinutes: number;
  jobOfferText?: string;
  companyName?: string;
  jobTitle?: string;
  extractedSkills?: string[];
  // Video mode
  videoMode?: boolean;
  interviewerId?: string;
}

export interface InterviewResult {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  strengths: string[];
  improvements: string[];
  timeManagement: string;
  nextTopics: string[];
}

interface InterviewState {
  // Current interview
  interviewId: string | null;
  settings: InterviewSettings | null;
  messages: Message[];
  isLoading: boolean;
  startTime: Date | null;
  endTime: Date | null;
  status: "idle" | "in_progress" | "completed";

  // Code editor
  code: string;
  codeLanguage: string;

  // Results
  result: InterviewResult | null;

  // Actions
  setSettings: (settings: InterviewSettings) => void;
  startInterview: (id: string) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  setCode: (code: string) => void;
  setCodeLanguage: (language: string) => void;
  endInterview: () => void;
  setResult: (result: InterviewResult) => void;
  reset: () => void;
}

const initialState = {
  interviewId: null,
  settings: null,
  messages: [],
  isLoading: false,
  startTime: null,
  endTime: null,
  status: "idle" as const,
  code: "",
  codeLanguage: "python",
  result: null,
};

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSettings: (settings) => set({ settings }),

      startInterview: (id) =>
        set({
          interviewId: id,
          startTime: new Date(),
          status: "in_progress",
          messages: [],
          result: null,
        }),

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setCode: (code) => set({ code }),

      setCodeLanguage: (codeLanguage) => set({ codeLanguage }),

      endInterview: () =>
        set({
          endTime: new Date(),
          status: "completed",
        }),

      setResult: (result) => set({ result }),

      reset: () => set(initialState),
    }),
    {
      name: "interview-storage",
      partialize: (state) => ({
        // Only persist these fields
        interviewId: state.interviewId,
        settings: state.settings,
        messages: state.messages,
        startTime: state.startTime,
        status: state.status,
        code: state.code,
        codeLanguage: state.codeLanguage,
      }),
    }
  )
);
