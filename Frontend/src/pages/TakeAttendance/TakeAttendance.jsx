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

  const [activeLecture, setActiveLecture] = useState(null)
  const [recognizedStudents, setRecognizedStudents] = useState([])

  // ==========================================
  // Format Time - 12 Hour
  // ==========================================

  const formatTime = (time) => {
    if (!time) {
      return '-'
    }

    if (time.includes('T')) {
      return new Date(time).toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    }

    const [hours, minutes, seconds = '00'] = time.split(':')

    const hour = Number(hours)
    const hour12 = hour % 12 || 12
    const period = hour >= 12 ? 'PM' : 'AM'

    return (
      `${String(hour12).padStart(2, '0')}:` +
      `${minutes} ` +
      `${period}`
    )
  }

  // ==========================================
  // Format Date
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return '-'
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    )
  }

  // ==========================================
  // Get Current Lecture + Start Attendance
  // ==========================================

  const startAttendance = async () => {
    try {
      setCameraError('')
      setAttendanceMessage('')
      setAttendanceResult(null)
      setRecognizedStudents([])

      // --------------------------------------
      // Ask backend for current timetable lecture
      // --------------------------------------

      const response = await fetch(
        'http://127.0.0.1:8000/api/attendance/start/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          'Unable to start attendance.'
        )
      }

      if (!data.active || !data.lecture) {
        throw new Error(
          'No lecture is running right now.'
        )
      }

      // Save current lecture
      setActiveLecture(data.lecture)

      setAttendanceMessage(
        `Attendance started for ${data.lecture.subject}`
      )

      // --------------------------------------
      // Start camera
      // --------------------------------------

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        })

      streamRef.current = stream

      setIsCameraStarted(true)

    } catch (error) {
      console.error(
        'Start attendance error:',
        error
      )

      setCameraError(
        error.message ||
        'Unable to start attendance.'
      )
    }
  }

  // ==========================================
  // Attach Camera Stream
  // ==========================================

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

  // ==========================================
  // Stop Camera Only
  // ==========================================

  const stopCameraOnly = () => {
    if (scanIntervalRef.current) {
      clearInterval(
        scanIntervalRef.current
      )

      scanIntervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    recognizingRef.current = false

    setIsRecognizing(false)
    setIsCameraStarted(false)
  }

  // ==========================================
  // Finish / Finalize Lecture
  // ==========================================

  const finishAttendance = async () => {
    if (!activeLecture?.id) {
      stopCameraOnly()

      setAttendanceMessage(
        'No active lecture found.'
      )

      return
    }

    try {
      setAttendanceMessage(
        'Finalizing attendance...'
      )

      // Stop scanning and camera
      stopCameraOnly()

      // --------------------------------------
      // Mark remaining students Absent / Leave
      // --------------------------------------

      const response = await fetch(
        'http://127.0.0.1:8000/api/attendance/finalize/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lecture_id: activeLecture.id,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          'Unable to finalize attendance.'
        )
      }

      setAttendanceMessage(
        'Attendance completed successfully.'
      )

      setAttendanceResult({
        type: 'finalized',
        message:
          data.message ||
          'Attendance completed successfully.',
        absent_count:
          data.absent_count || 0,
        leave_count:
          data.leave_count || 0,
        recognized_count:
          recognizedStudents.length,
      })

    } catch (error) {
      console.error(
        'Finalize attendance error:',
        error
      )

      setCameraError(
        error.message ||
        'Unable to finalize attendance.'
      )
    }
  }

  // ==========================================
  // Capture Camera Frame
  // ==========================================

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

    if (!context) {
      return null
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    return canvas.toDataURL(
      'image/jpeg',
      0.85
    )
  }

  // ==========================================
  // Recognize Face
  // ==========================================

  const recognizeFace = async () => {
    // Prevent overlapping requests
    if (recognizingRef.current) {
      return
    }

    if (!isCameraStarted) {
      return
    }

    if (!activeLecture?.id) {
      return
    }

    try {
      recognizingRef.current = true

      setIsRecognizing(true)

      const faceImage = captureFrame()

      if (!faceImage) {
        return
      }

      setAttendanceMessage(
        'Scanning classroom...'
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
            lecture_id: activeLecture.id,
          }),
        }
      )

      const data = await response.json()

      // ======================================
      // Face recognized / Attendance marked
      // ======================================

      if (response.ok) {
        const student = data.student

        if (student) {
          setRecognizedStudents((previous) => {
            const alreadyExists =
              previous.some(
                (item) =>
                  item.id === student.id
              )

            if (alreadyExists) {
              return previous
            }

            return [
              ...previous,
              {
                id: student.id,
                name: student.name,
                roll_number:
                  student.roll_number,
                status:
                  data.attendance?.status ||
                  'Present',
              },
            ]
          })

          setAttendanceMessage(
            `${student.name} - ${
              data.attendance?.status ||
              'Present'
            }`
          )

          // Show latest recognition
          setAttendanceResult({
            type: 'recognized',
            message: data.message,
            student: student,
            attendance:
              data.attendance || null,
          })
        }

        // IMPORTANT:
        // Camera does NOT stop here.
        // It continues scanning.
        return
      }

      // ======================================
      // Face not recognized
      // ======================================

      if (response.status === 404) {
        setAttendanceMessage(
          'Looking for faces...'
        )

        return
      }

      // ======================================
      // Other error
      // ======================================

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
        error.message ||
        'Face recognition failed.'
      )

    } finally {
      recognizingRef.current = false

      setIsRecognizing(false)
    }
  }

  // ==========================================
  // Automatic Face Scanning
  // ==========================================

  useEffect(() => {
    if (
      !isCameraStarted ||
      !activeLecture
    ) {
      return
    }

    // First scan after 2 seconds
    const firstScan = setTimeout(() => {
      recognizeFace()
    }, 2000)

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
  }, [
    isCameraStarted,
    activeLecture,
  ])

  // ==========================================
  // Cleanup
  // ==========================================

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

  // ==========================================
  // UI
  // ==========================================

  return (
    <AppLayout
      activePage="Take Attendance"
      onNavigate={onNavigate}
    >
      <section className="page-body take-attendance-page">

        {/* =====================================
            Lecture Information
        ===================================== */}

        {activeLecture && (
          <div className="page-card lecture-info-card">

            <h2>
              {activeLecture.subject}
            </h2>

            <p>
              Section: {activeLecture.section}
            </p>

            <p>
              Date:{' '}
              {formatDate(
                activeLecture.date
              )}
            </p>

            <p>
              Time:{' '}
              {formatTime(
                activeLecture.start_time
              )}
              {' - '}
              {formatTime(
                activeLecture.end_time
              )}
            </p>

            <p>
              Students recognized:{' '}
              {recognizedStudents.length}
            </p>

          </div>
        )}

        {/* =====================================
            Camera
        ===================================== */}

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
                ? 'Scanning Classroom...'
                : 'Camera Ready'}

            </div>

            {/* Face Box */}

            <div className="attendance-face-box">

              <span className="face-corner top-left"></span>

              <span className="face-corner top-right"></span>

              <span className="face-corner bottom-left"></span>

              <span className="face-corner bottom-right"></span>

            </div>

            {/* Camera instruction */}

            <div className="camera-instruction">

              <span>●</span>

              Camera is scanning the classroom

            </div>

          </div>
        )}

        {/* =====================================
            Hidden Canvas
        ===================================== */}

        <canvas
          ref={canvasRef}
          style={{
            display: 'none',
          }}
        />

        {/* =====================================
            Camera Error
        ===================================== */}

        {cameraError && (
          <p className="attendance-error">
            {cameraError}
          </p>
        )}

        {/* =====================================
            Latest Recognition
        ===================================== */}

        {attendanceResult?.type ===
          'recognized' && (
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
                  Status:{' '}
                  {
                    attendanceResult
                      .attendance
                      .status
                  }
                </p>

                <p>
                  Marked At:{' '}
                  {formatTime(
                    attendanceResult
                      .attendance
                      .marked_at
                  )}
                </p>
              </>
            )}

          </aside>
        )}

        {/* =====================================
            Finalized Result
        ===================================== */}

        {attendanceResult?.type ===
          'finalized' && (
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
              Attendance Completed
            </h1>

            <p>
              Recognized:{' '}
              {attendanceResult.recognized_count}
            </p>

            <p>
              Absent:{' '}
              {attendanceResult.absent_count}
            </p>

            <p>
              On Leave:{' '}
              {attendanceResult.leave_count}
            </p>

          </aside>
        )}

        {/* =====================================
            Recognized Students
        ===================================== */}

        {recognizedStudents.length > 0 && (
          <div className="page-card">

            <h2>
              Students Recognized
            </h2>

            {recognizedStudents.map(
              (student) => (
                <div
                  key={student.id}
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    padding: '10px 0',
                    borderBottom:
                      '1px solid #eee',
                  }}
                >
                  <span>
                    {student.name} -{' '}
                    {student.roll_number}
                  </span>

                  <strong>
                    {student.status}
                  </strong>
                </div>
              )
            )}

          </div>
        )}

        {/* =====================================
            Buttons
        ===================================== */}

        <div className="attendance-actions">

          {/* Start */}

          {!isCameraStarted &&
            !attendanceResult && (

            <button
              className="start-attendance-button"
              type="button"
              onClick={startAttendance}
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

          {/* Finish */}

          {isCameraStarted && (

            <button
              className="stop-camera-button"
              type="button"
              onClick={finishAttendance}
            >
              Finish Attendance
            </button>

          )}

          {/* New Attendance */}

          {!isCameraStarted &&
            attendanceResult && (

            <button
              className="start-attendance-button"
              type="button"
              onClick={() => {
                setAttendanceResult(null)
                setAttendanceMessage('')
                setCameraError('')
                setActiveLecture(null)
                setRecognizedStudents([])
              }}
            >
              Start New Attendance
            </button>

          )}

        </div>

        {/* =====================================
            Message
        ===================================== */}

        {attendanceMessage &&
          !attendanceResult?.type && (

          <p className="attendance-note">

            <span>i</span>

            {attendanceMessage}

          </p>

        )}

        {/* =====================================
            Information
        ===================================== */}

        {!isCameraStarted &&
          !attendanceResult && (

          <p className="attendance-note">

            <span>i</span>

            Click Start Attendance.
            The system will automatically
            detect the current lecture from
            the timetable and scan students.

          </p>

        )}

      </section>
    </AppLayout>
  )
}

export default TakeAttendance