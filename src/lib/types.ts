export interface SubService {
  id: string;
  name: string;
  durationSeconds: number;
}

export interface Service {
  id: string;
  name: string;
  tagline: string;
  totalDurationSeconds: number;
  subServices: SubService[];
}

export interface ServicesResponse {
  services: Service[];
}

export interface TimerState {
  currentStepIndex: number;
  secondsRemaining: number;
  isRunning: boolean;
  isComplete: boolean;
}

export interface TimerControls {
  pause: () => void;
  resume: () => void;
  skipToNext: () => void;
  skipToPrev: () => void;
}
