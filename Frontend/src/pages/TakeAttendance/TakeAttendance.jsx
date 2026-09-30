import { useEffect, useRef, useState } from 'react'
import AppLayout from '../../components/AppLayout/AppLayout'
import './TakeAttendance.css'

function TakeAttendance({ onNavigate }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const streamRef = useRef(null)
  const scanIntervalRef = useRef(null)
  const recognizingRef = useRef(false)

  const [cameraError, setCameraError] = useState('')
  const [attendanceMessage, setAttendanceMessage] = useState('')
  const [attendanceResult, setAttendanceResult] = useState(null)

  const [isCameraStarted, setIsCameraStarted] = useState(false)
  const [isRecognizing, setIsRecognizing] = useState(false)

  // =========================
  // Start Camera
  // =========================

  const startCamera = async () => {
    try {
      setCameraError('')
      setAttendanceMessage('')
      setAttendanceResult(null)

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
            facingMode: 'user',
          },
          audio: false,
        })

      streamRef.current = stream

      setIsCameraStarted(true)

    } catch (error) {
      console.error('Camera error:', error)

      setCameraError(
        'Unable to access the camera. Please allow camera permission.'
      )
    }
  }

  // =========================
  // Attach camera stream
  // =========================

  useEffect(() => {
    if (
      isCameraStarted &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current

      videoRef.current
        .play()
        .catch((error) => {
          console.error(
            'Video play error:',
            error
          )
        })
    }
  }, [isCameraStarted])

  // =========================
  // Stop Camera
  // =========================

  const stopCamera = () => {
    // Stop scanning
    if (scanIntervalRef.current) {
      clearInterval(
        scanIntervalRef.current
      )

      scanIntervalRef.current = null
    }

    // Stop camera
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      streamRef.current = null
    }

    // Remove video stream
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    recognizingRef.current = false

    setIsRecognizing(false)
    setIsCameraStarted(false)
  }

  // =========================
  // Capture Camera Frame
  // =========================

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      return null
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return null
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context =
      canvas.getContext('2d')

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    return canvas.toDataURL(
      'image/jpeg',
      0.9
    )
  }

// =========================
// Format Time - 12 Hour
// =========================

const formatTime = (time) => {
  if (!time) {
    return '-'
  }

  const [hours, minutes, seconds] = time.split(':')

  const hour = Number(hours)

  const hour12 = hour % 12 || 12

  const period = hour >= 12 ? 'PM' : 'AM'

  return (
    `${String(hour12).padStart(2, '0')}:` +
    `${minutes}:` +
    `${seconds.split('.')[0]} ` +
    `${period}`
  )
}
  // =========================
  // Recognize Face
  // =========================

  const recognizeFace = async () => {
    // Prevent multiple requests at same time
    if (recognizingRef.current) {
      return
    }

    if (!isCameraStarted) {
      return
    }

    try {
      recognizingRef.current = true

      setIsRecognizing(true)

      const faceImage = captureFrame()

      if (!faceImage) {
        recognizingRef.current = false
        setIsRecognizing(false)
        return
      }

      setAttendanceMessage(
        'Scanning face...'
      )

      const response = await fetch(
        'http://127.0.0.1:8000/api/attendance/recognize/',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            face_image: faceImage,
          }),
        }
      )

      const data =
        await response.json()

      // =========================
      // Face recognized
      // =========================

      if (response.ok) {
        setAttendanceResult(data)

        setAttendanceMessage(
          data.message
        )

        stopCamera()

        return
      }

      // =========================
      // Face not recognized yet
      // =========================

      if (response.status === 404) {
        setAttendanceMessage(
          'Looking for a face...'
        )

        return
      }

      // =========================
      // Other error
      // =========================

      throw new Error(
        data.error ||
        data.message ||
        'Face recognition failed.'
      )

    } catch (error) {
      console.error(
        'Face recognition error:',
        error
      )

      setAttendanceMessage(
        error.message
      )

    } finally {
      recognizingRef.current = false

      setIsRecognizing(false)
    }
  }

  // =========================
  // Automatic Face Scanning
  // =========================

  useEffect(() => {
    if (!isCameraStarted) {
      return
    }

    // First scan after camera has started
    const firstScan = setTimeout(() => {
      recognizeFace()
    }, 1500)

    // Continue scanning every 3 seconds
    scanIntervalRef.current =
      setInterval(() => {
        recognizeFace()
      }, 3000)

    return () => {
      clearTimeout(firstScan)

      if (scanIntervalRef.current) {
        clearInterval(
          scanIntervalRef.current
        )

        scanIntervalRef.current = null
      }
    }
  }, [isCameraStarted])

  // =========================
  // Cleanup
  // =========================

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(
          scanIntervalRef.current
        )
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop())
      }
    }
  }, [])

  // =========================
  // UI
  // =========================

  return (
    <AppLayout
      activePage="Take Attendance"
      onNavigate={onNavigate}
    >
      <section className="page-body take-attendance-page">

        {/* =========================
            Camera
        ========================= */}

        {isCameraStarted && (
          <div className="attendance-camera">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />

            {/* Scanning badge */}

            <div className="scanning-badge">

              <span className="scanning-dot"></span>

              {isRecognizing
                ? 'Scanning Face...'
                : 'Camera Ready'}

            </div>

            {/* Face Oval */}

            <div className="attendance-face-box">

              <span className="face-corner top-left"></span>
              <span className="face-corner top-right"></span>
              <span className="face-corner bottom-left"></span>
              <span className="face-corner bottom-right"></span>

            </div>

            {/* Camera instruction */}

            <div className="camera-instruction">

              <span>●</span>

              Look directly at the camera

            </div>

          </div>
        )}

        {/* Hidden Canvas */}

        <canvas
          ref={canvasRef}
          style={{
            display: 'none',
          }}
        />

        {/* =========================
            Camera Error
        ========================= */}

        {cameraError && (
          <p className="attendance-error">
            {cameraError}
          </p>
        )}

        {/* =========================
            Attendance Result
        ========================= */}

        {attendanceResult && (
          <aside className="page-card attendance-result-card">

            <p className="attendance-success">

              <span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="m6 12 4 4 8-8" />
                </svg>
              </span>

              {attendanceResult.message}

            </p>

            <h1>
              {attendanceResult.student?.name}
            </h1>

            <p>
              Roll No:{' '}
              {attendanceResult.student?.roll_number}
            </p>

            {attendanceResult.attendance && (
              <>
                <p>
                  Date:{' '}
                  {attendanceResult.attendance.date}
                </p>

                <p>
                  Time:{' '}
                  {formatTime(attendanceResult.attendance.time)}
                </p>

                <p>
                  Status:{' '}
                  {attendanceResult.attendance.status}
                </p>
              </>
            )}

          </aside>
        )}

        {/* =========================
            Buttons
        ========================= */}

        <div className="attendance-actions">

          {!isCameraStarted &&
            !attendanceResult && (

            <button
              className="start-attendance-button"
              type="button"
              onClick={startCamera}
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M15 19a6 6 0 0 0-12 0" />

                <circle
                  cx="9"
                  cy="8"
                  r="4"
                />

                <path d="M19 8v6" />

                <path d="M16 11h6" />
              </svg>

              Start Attendance

            </button>

          )}

          {isCameraStarted && (

            <button
              className="stop-camera-button"
              type="button"
              onClick={stopCamera}
            >
              Stop Camera
            </button>

          )}

        </div>

        {/* =========================
            Message
        ========================= */}

        {attendanceMessage &&
          !attendanceResult && (

          <p className="attendance-note">

            <span>i</span>

            {attendanceMessage}

          </p>

        )}

        {/* =========================
            Information
        ========================= */}

        {!isCameraStarted &&
          !attendanceResult && (

          <p className="attendance-note">

            <span>i</span>

            Click Start Attendance.
            The system will automatically
            recognize your face and mark
            attendance.

          </p>

        )}

      </section>
    </AppLayout>
  )
}

export default TakeAttendance
