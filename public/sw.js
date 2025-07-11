const CACHE_NAME = "wellness-timer-v1"
const basePath = "/wellness-timer"
const urlsToCache = [
  `${basePath}/`,
  `${basePath}/manifest.json`,
  `${basePath}/icon-192x192.png`,
  `${basePath}/icon-512x512.png`,
]

let timerInterval = null
const timerState = {
  isRunning: false,
  timeRemaining: 0,
  phase: "work",
  workDuration: 1500, // 25 minutes default
  breakDuration: 300, // 5 minutes default
}

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response
      }
      return fetch(event.request).catch(() => {
        // Return a fallback page if both cache and network fail
        if (event.request.destination === "document") {
          return caches.match(`${basePath}/`)
        }
      })
    }),
  )
})

// Message event - handle timer messages from main thread
self.addEventListener("message", (event) => {
  const { type, phase, timeRemaining, workDuration, breakDuration } = event.data

  console.log("SW received message:", event.data)

  switch (type) {
    case "START_TIMER":
      timerState.isRunning = true
      timerState.phase = phase || "work"
      timerState.timeRemaining = timeRemaining || timerState.workDuration
      timerState.workDuration = workDuration || timerState.workDuration
      timerState.breakDuration = breakDuration || timerState.breakDuration
      startBackgroundTimer()
      break

    case "PAUSE_TIMER":
      timerState.isRunning = false
      stopBackgroundTimer()
      break

    case "RESET_TIMER":
      timerState.isRunning = false
      timerState.timeRemaining = 0
      timerState.phase = "work"
      stopBackgroundTimer()
      break

    case "UPDATE_DURATIONS":
      timerState.workDuration = workDuration || timerState.workDuration
      timerState.breakDuration = breakDuration || timerState.breakDuration
      break

    case "SKIP_WAITING":
      self.skipWaiting()
      break
  }
})

// Background timer functionality
function startBackgroundTimer() {
  console.log("Starting background timer")
  if (timerInterval) {
    clearInterval(timerInterval)
  }

  timerInterval = setInterval(() => {
    if (timerState.isRunning && timerState.timeRemaining > 0) {
      timerState.timeRemaining--

      // Send tick to main thread
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "TIMER_TICK",
            timeRemaining: timerState.timeRemaining,
            phase: timerState.phase,
          })
        })
      })

      // Handle phase completion
      if (timerState.timeRemaining <= 0) {
        handlePhaseComplete()
      }
    }
  }, 1000)
}

function stopBackgroundTimer() {
  console.log("Stopping background timer")
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function handlePhaseComplete() {
  const isWorkPhase = timerState.phase === "work"
  console.log(`Phase complete: ${timerState.phase}`)

  // Show notification
  const title = isWorkPhase ? "Break Time! 🧘‍♀️" : "Back to Work! 💪"
  const body = isWorkPhase ? "Time to take a break and rest your eyes." : "Break time is over. Ready to focus?"

  self.registration.showNotification(title, {
    body,
    icon: `${basePath}/icon-192x192.png`,
    badge: `${basePath}/icon-192x192.png`,
    tag: "wellness-timer",
    requireInteraction: isWorkPhase,
    vibrate: [200, 100, 200],
    silent: false,
    timestamp: Date.now(),
    actions: [
      {
        action: "dismiss",
        title: "Dismiss",
      },
      {
        action: "focus",
        title: "Open App",
      },
    ],
    data: {
      phase: isWorkPhase ? "break" : "work",
      timestamp: Date.now(),
    },
  })

  // Switch phase and set new duration
  timerState.phase = isWorkPhase ? "break" : "work"
  timerState.timeRemaining = isWorkPhase ? timerState.breakDuration : timerState.workDuration

  // Notify main thread of phase change
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "PHASE_COMPLETE",
        newPhase: timerState.phase,
        timeRemaining: timerState.timeRemaining,
      })
    })
  })
}

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)
  event.notification.close()

  if (event.action === "dismiss") {
    return
  }

  // Focus or open the app
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(basePath) && "focus" in client) {
          return client.focus()
        }
      }
      // If app is not open, open it
      if (self.clients.openWindow) {
        return self.clients.openWindow(`${basePath}/`)
      }
    }),
  )
})

// Handle background sync
self.addEventListener("sync", (event) => {
  console.log("Background sync:", event.tag)
  if (event.tag === "background-timer") {
    event.waitUntil(
      // Keep timer running
      Promise.resolve(),
    )
  }
})

// Handle push events (for future use)
self.addEventListener("push", (event) => {
  console.log("Push received:", event)
  // Handle push notifications if needed in the future
})

// Periodic background sync (experimental)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "timer-sync") {
    event.waitUntil(
      // Sync timer state
      Promise.resolve(),
    )
  }
})
