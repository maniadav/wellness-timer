import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: any;

// Timer state management
let timerInterval: any = null;
const timerState = {
  isRunning: false,
  timeRemaining: 0,
  phase: "work" as "work" | "break",
  workDuration: 1500, // 25 minutes default
  breakDuration: 300, // 5 minutes default
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/wellness-timer/offline",
        matcher({ request }: { request: any }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Background sync handling (simplified for compatibility)
const timerDataQueue: any[] = [];

// Timer message handling
self.addEventListener("message", (event: any) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case "START_TIMER":
      startTimer(payload);
      break;
    case "PAUSE_TIMER":
      pauseTimer();
      break;
    case "STOP_TIMER":
      stopTimer();
      break;
    case "GET_TIMER_STATE":
      event.ports[0]?.postMessage(timerState);
      break;
    case "UPDATE_SETTINGS":
      updateSettings(payload);
      break;
  }
});

function startTimer(settings?: { workDuration?: number; breakDuration?: number }) {
  if (settings) {
    updateSettings(settings);
  }
  
  if (!timerState.isRunning) {
    timerState.isRunning = true;
    if (timerState.timeRemaining === 0) {
      timerState.timeRemaining = timerState.phase === "work" 
        ? timerState.workDuration 
        : timerState.breakDuration;
    }
    
    timerInterval = setInterval(() => {
      timerState.timeRemaining--;
      
      // Broadcast timer update to all clients
      broadcastTimerUpdate();
      
      if (timerState.timeRemaining <= 0) {
        completePhase();
      }
    }, 1000);
  }
}

function pauseTimer() {
  timerState.isRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  broadcastTimerUpdate();
}

function stopTimer() {
  timerState.isRunning = false;
  timerState.timeRemaining = 0;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  broadcastTimerUpdate();
}

function updateSettings(settings: { workDuration?: number; breakDuration?: number }) {
  if (settings.workDuration) {
    timerState.workDuration = settings.workDuration;
  }
  if (settings.breakDuration) {
    timerState.breakDuration = settings.breakDuration;
  }
}

function completePhase() {
  const wasWork = timerState.phase === "work";
  timerState.phase = wasWork ? "break" : "work";
  timerState.timeRemaining = timerState.phase === "work" 
    ? timerState.workDuration 
    : timerState.breakDuration;
  
  // Show notification
  showNotification(wasWork ? "Break Time!" : "Work Time!", {
    body: wasWork 
      ? "Time for a well-deserved break!" 
      : "Break's over, let's get back to work!",
    icon: "/wellness-timer/icon-192x192.png",
    badge: "/wellness-timer/icon-192x192.png",
    tag: "timer-notification",
    requireInteraction: true,
  });
  
  broadcastTimerUpdate();
}

function showNotification(title: string, options: NotificationOptions) {
  if (Notification.permission === "granted") {
    self.registration.showNotification(title, options);
  }
}

function broadcastTimerUpdate() {
  self.clients.matchAll().then((clients: any) => {
    clients.forEach((client: any) => {
      client.postMessage({
        type: "TIMER_UPDATE",
        payload: timerState,
      });
    });
  });
}

// Handle notification clicks
self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  
  // Open the app
  event.waitUntil(
    self.clients.matchAll().then((clients: any) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow("/wellness-timer/");
    })
  );
});

// Handle background sync
self.addEventListener("sync", (event: any) => {
  if (event.tag === "timer-sync") {
    event.waitUntil(
      // Sync timer data when connection is restored
      broadcastTimerUpdate()
    );
  }
});

serwist.addEventListeners();
