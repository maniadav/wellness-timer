"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
  Separator,
  Badge,
  Progress,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui"

// Get base path for assets
const basePath = process.env.NODE_ENV === "production" ? "/wellness-timer" : ""

// Simple SVG Icons
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,3 19,12 5,21" />
  </svg>
)

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
)

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
    <path d="M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34l-1.41-1.41" />
  </svg>
)

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
)

const ActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const SmartphoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
)

const MonitorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

// Preset wellness themes
const PRESET_THEMES = {
  pomodoro: {
    name: "Pomodoro",
    icon: ClockIcon,
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    description: "25 min work, 5 min break",
  },
  "20-20-20": {
    name: "20-20-20 Rule",
    icon: EyeIcon,
    workDuration: 20 * 60,
    breakDuration: 20,
    description: "20 min work, 20 sec break",
  },
  eyeStretching: {
    name: "Eye Stretching",
    icon: ActivityIcon,
    workDuration: 30 * 60,
    breakDuration: 2 * 60,
    description: "30 min work, 2 min break",
  },
  custom: {
    name: "Custom",
    icon: SettingsIcon,
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    description: "Your custom settings",
  },
} as const

type TimerPhase = "work" | "break"
type TimerState = "idle" | "running" | "paused"

interface UserPreferences {
  theme: keyof typeof PRESET_THEMES
  customWork: number
  customBreak: number
  soundEnabled: boolean
  notificationsEnabled: boolean
  darkMode: boolean
}

export default function WellnessTimer() {
  // Timer state
  const [currentTheme, setCurrentTheme] = useState<keyof typeof PRESET_THEMES>("pomodoro")
  const [timerState, setTimerState] = useState<TimerState>("idle")
  const [currentPhase, setCurrentPhase] = useState<TimerPhase>("work")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)

  // UI state
  const [showBreakOverlay, setShowBreakOverlay] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [mounted, setMounted] = useState(false)

  // User preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "pomodoro",
    customWork: 25 * 60,
    customBreak: 5 * 60,
    soundEnabled: true,
    notificationsEnabled: false,
    darkMode: false,
  })

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const deferredPromptRef = useRef<any>(null)

  // Handle component mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load preferences and setup
  useEffect(() => {
    if (!mounted) return

    // Load saved preferences
    const saved = localStorage.getItem("wellness-timer-preferences")
    if (saved) {
      try {
        const parsedPrefs = JSON.parse(saved) as UserPreferences
        setPreferences(parsedPrefs)
        setCurrentTheme(parsedPrefs.theme)
      } catch (error) {
        console.error("Failed to parse saved preferences:", error)
      }
    }

    // Check system dark mode preference if not set
    if (!saved) {
      const systemDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      setPreferences((prev) => ({ ...prev, darkMode: systemDarkMode }))
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        setPreferences((prev) => ({ ...prev, notificationsEnabled: permission === "granted" }))
      })
    } else if ("Notification" in window && Notification.permission === "granted") {
      setPreferences((prev) => ({ ...prev, notificationsEnabled: true }))
    }

    // Register service worker with correct path
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${basePath}/sw.js`).catch(console.error)
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [mounted])

  // Save preferences
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("wellness-timer-preferences", JSON.stringify(preferences))
  }, [preferences, mounted])

  // Apply dark mode
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", preferences.darkMode)
    }
  }, [preferences.darkMode, mounted])

  // Get current theme settings
  const getCurrentThemeSettings = useCallback(() => {
    if (currentTheme === "custom") {
      return {
        ...PRESET_THEMES.custom,
        workDuration: preferences.customWork,
        breakDuration: preferences.customBreak,
      }
    }
    return PRESET_THEMES[currentTheme]
  }, [currentTheme, preferences.customWork, preferences.customBreak])

  // Initialize timer
  const initializeTimer = useCallback(() => {
    const themeSettings = getCurrentThemeSettings()
    const duration = currentPhase === "work" ? themeSettings.workDuration : themeSettings.breakDuration
    setTimeRemaining(duration)
    setTotalTime(duration)
  }, [currentPhase, getCurrentThemeSettings])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!preferences.soundEnabled) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log("Audio context not available")
    }
  }, [preferences.soundEnabled])

  // Show system notification
  const showNotification = useCallback(
    (title: string, body: string, requireInteraction = false) => {
      if (!preferences.notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") {
        return
      }

      try {
        const notification = new Notification(title, {
          body,
          icon: `${basePath}/icon-192x192.png`,
          requireInteraction,
          tag: "wellness-timer",
          vibrate: [200, 100, 200],
        })

        if (!requireInteraction) {
          setTimeout(() => notification.close(), 10000)
        }

        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      } catch (error) {
        console.error("Failed to show notification:", error)
      }
    },
    [preferences.notificationsEnabled],
  )

  // Timer tick
  const tick = useCallback(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        playNotificationSound()

        if (currentPhase === "work") {
          setCurrentPhase("break")
          setShowBreakOverlay(true)
          showNotification(
            "Break Time! 🧘‍♀️",
            currentTheme === "20-20-20"
              ? "Look at something 20 feet away for 20 seconds"
              : "Time to take a break and rest your eyes.",
            true,
          )
          const breakDuration = getCurrentThemeSettings().breakDuration
          setTotalTime(breakDuration)
          return breakDuration
        } else {
          setCurrentPhase("work")
          setShowBreakOverlay(false)
          setCycleCount((prev) => prev + 1)
          showNotification("Back to Work! 💪", "Break time is over. Ready to focus?")
          const workDuration = getCurrentThemeSettings().workDuration
          setTotalTime(workDuration)
          return workDuration
        }
      }
      return prev - 1
    })
  }, [currentPhase, getCurrentThemeSettings, playNotificationSound, showNotification, currentTheme])

  // Timer controls
  const startTimer = useCallback(() => {
    if (timerState === "idle") {
      initializeTimer()
    }
    setTimerState("running")
    intervalRef.current = setInterval(tick, 1000)
  }, [timerState, initializeTimer, tick])

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimerState("paused")
  }, [])

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimerState("idle")
    setCurrentPhase("work")
    setShowBreakOverlay(false)
    setCycleCount(0)
    initializeTimer()
  }, [initializeTimer])

  // Change theme
  const changeTheme = useCallback(
    (newTheme: keyof typeof PRESET_THEMES) => {
      setCurrentTheme(newTheme)
      setPreferences((prev) => ({ ...prev, theme: newTheme }))
      if (timerState !== "idle") {
        resetTimer()
      }
    },
    [timerState, resetTimer],
  )

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setPreferences((prev) => ({ ...prev, darkMode: !prev.darkMode }))
  }, [])

  // Install PWA
  const installPWA = useCallback(() => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt()
      deferredPromptRef.current.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt")
        }
        deferredPromptRef.current = null
        setIsInstallable(false)
        setShowInstallDialog(false)
      })
    }
  }, [])

  const handleInstallClick = useCallback(() => {
    setShowInstallDialog(true)
  }, [])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0

  // Initialize timer when component mounts or theme changes
  useEffect(() => {
    if (timerState === "idle" && mounted) {
      initializeTimer()
    }
  }, [currentTheme, initializeTimer, timerState, mounted])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  if (!mounted) {
    return null
  }

  const currentThemeSettings = getCurrentThemeSettings()
  const ThemeIcon = currentThemeSettings.icon

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Wellness Timer</h1>
            <p className="text-muted-foreground">Stay healthy with mindful breaks</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleInstallClick} title="Install App">
              <DownloadIcon />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)} title="Settings">
              <SettingsIcon />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleDarkMode} title="Toggle Theme">
              {preferences.darkMode ? <SunIcon /> : <MoonIcon />}
            </Button>
          </div>
        </div>

        {/* Theme Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThemeIcon />
              {currentThemeSettings.name}
            </CardTitle>
            <CardDescription>{currentThemeSettings.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(PRESET_THEMES).map(([key, theme]) => {
                const Icon = theme.icon
                return (
                  <Button
                    key={key}
                    variant={currentTheme === key ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col gap-1"
                    onClick={() => changeTheme(key as keyof typeof PRESET_THEMES)}
                  >
                    <Icon />
                    <span className="text-xs">{theme.name}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Timer Display */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Badge variant={currentPhase === "work" ? "default" : "secondary"} className="text-sm">
                  {currentPhase === "work" ? "Work Time" : "Break Time"}
                </Badge>
                {cycleCount > 0 && (
                  <Badge variant="outline" className="text-sm">
                    Cycle {cycleCount}
                  </Badge>
                )}
              </div>

              <div className="text-6xl font-mono font-bold text-foreground tabular-nums">
                {formatTime(timeRemaining)}
              </div>

              <Progress value={progressPercentage} className="w-full h-3" />

              <div className="flex justify-center gap-2">
                {timerState === "idle" || timerState === "paused" ? (
                  <Button onClick={startTimer} size="lg" className="gap-2">
                    <PlayIcon />
                    {timerState === "idle" ? "Start" : "Resume"}
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" className="gap-2">
                    <PauseIcon />
                    Pause
                  </Button>
                )}

                <Button onClick={resetTimer} variant="outline" size="lg" className="gap-2 bg-transparent">
                  <StopIcon />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {formatTime(currentThemeSettings.workDuration)}
                </div>
                <div className="text-sm text-muted-foreground">Work Duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {formatTime(currentThemeSettings.breakDuration)}
                </div>
                <div className="text-sm text-muted-foreground">Break Duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{cycleCount}</div>
                <div className="text-sm text-muted-foreground">Cycles Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Break Overlay */}
      <Dialog open={showBreakOverlay} onOpenChange={setShowBreakOverlay}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Break Time! 🧘‍♀️</DialogTitle>
            <DialogDescription className="text-center">
              {currentTheme === "20-20-20"
                ? "Look at something 20 feet away for 20 seconds"
                : "Take a moment to rest and recharge"}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold tabular-nums">{formatTime(timeRemaining)}</div>
            <Progress value={progressPercentage} className="w-full h-2" />
            <Button onClick={() => setShowBreakOverlay(false)} variant="outline">
              Minimize
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Customize your wellness timer experience</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Custom Durations */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Custom Durations</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-work">Work (minutes)</Label>
                  <Input
                    id="custom-work"
                    type="number"
                    min="1"
                    max="120"
                    value={Math.floor(preferences.customWork / 60)}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        customWork: Number.parseInt(e.target.value) * 60,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-break">Break (minutes)</Label>
                  <Input
                    id="custom-break"
                    type="number"
                    min="1"
                    max="30"
                    value={Math.floor(preferences.customBreak / 60)}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        customBreak: Number.parseInt(e.target.value) * 60,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Audio Settings */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Sound Alerts</Label>
                <div className="text-sm text-muted-foreground">Play sound when phases change</div>
              </div>
              <Switch
                checked={preferences.soundEnabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    soundEnabled: checked,
                  }))
                }
              />
            </div>

            {/* Notification Settings */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">System Notifications</Label>
                <div className="text-sm text-muted-foreground">Show browser notifications</div>
              </div>
              <Switch
                checked={preferences.notificationsEnabled}
                onCheckedChange={(checked) => {
                  if (checked && "Notification" in window) {
                    Notification.requestPermission().then((permission) => {
                      setPreferences((prev) => ({
                        ...prev,
                        notificationsEnabled: permission === "granted",
                      }))
                    })
                  } else {
                    setPreferences((prev) => ({
                      ...prev,
                      notificationsEnabled: checked,
                    }))
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Install PWA Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DownloadIcon />
              Install Wellness Timer
            </DialogTitle>
            <DialogDescription>Install this app on your device for the best experience</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isInstallable ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the button below to install the Wellness Timer as a native app on your device.
                </p>
                <Button onClick={installPWA} className="w-full gap-2">
                  <DownloadIcon />
                  Install App
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  To install this app on your device, use your browser&apos;s install option:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                    <MonitorIcon />
                    <div>
                      <p className="font-medium text-sm">Desktop (Chrome/Edge)</p>
                      <p className="text-xs text-muted-foreground">
                        Look for the install icon in your browser&apos;s address bar, or use the menu → &quot;Install
                        Wellness Timer&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                    <SmartphoneIcon />
                    <div>
                      <p className="font-medium text-sm">Mobile</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>iOS Safari:</strong> Tap Share → Add to Home Screen
                        <br />
                        <strong>Android Chrome:</strong> Tap Menu → Add to Home screen
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Once installed, you can use the app offline and receive notifications even when your browser is
                  closed.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
