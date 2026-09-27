import { useEffect, useRef, useState } from 'react'
import AppLayout from '../../components/AppLayout/AppLayout'
import './CaptureFace.css'

function CaptureFace({ onNavigate }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')

  const [cameraError, setCameraError] = useState('')
  const [studentError, setStudentError] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)

  // =========================
  // GET STUDENTS
  // =========================

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setStudentError('')

      const response = await fetch(
        'http://127.0.0.1:8000/api/students/'
      )

      if (!response.ok) {
        throw new Error('Unable to load students.')
      }

      const data = await response.json()

      setStudents(data)
    } catch (error) {
      console.error('Fetch students error:', error)

      setStudentError('Unable to load students.')
    }
  }

  // =========================
  // START CAMERA
  // =========================

  useEffect(() => {
    if (selectedStudent && !capturedImage) {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [selectedStudent, capturedImage])

  const startCamera = async () => {
    try {
      setCameraError('')

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera error:', error)

      setCameraError(
        'Unable to access the camera. Please allow camera permission.'
      )
    }
  }

  // =========================
  // STOP CAMERA
  // =========================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      streamRef.current = null
    }
  }

  // =========================
  // CAPTURE FACE
  // =========================

  const captureFace = () => {
    if (!selectedStudent) {
      setStudentError('Please select a student first.')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      return
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setCameraError(
        'Camera is not ready. Please wait a moment.'
      )
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const imageData = canvas.toDataURL(
      'image/jpeg',
      0.9
    )

    setCapturedImage(imageData)

    stopCamera()

    console.log('Face captured successfully')
  }

  // =========================
  // RETAKE FACE
  // =========================

  const retakeFace = async () => {
    setCapturedImage(null)
    setCameraError('')

    await startCamera()
  }

  // =========================
  // SAVE FACE
  // =========================

  const saveFace = async () => {
    if (!selectedStudent) {
      setStudentError('Please select a student first.')
      return
    }

    if (!capturedImage) {
      setCameraError('Please capture the face first.')
      return
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/students/save-face/',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            student_id: selectedStudent,
            face_image: capturedImage,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to save face.'
        )
      }

      alert(
        `Face saved successfully for ${data.student.name} (${data.student.roll_number})`
      )

      setCapturedImage(null)
      setCameraError('')
      setStudentError('')

    } catch (error) {
      console.error('Save face error:', error)

      alert(
        `Failed to save face: ${error.message}`
      )
    }
  }

  // =========================
  // PAGE UI
  // =========================

  return (
    <AppLayout
      activePage="Capture Face"
      onNavigate={onNavigate}
    >
      <section className="page-body capture-face-page">

        <div className="page-card capture-face-card">

          <h1>Capture Student Face</h1>

          <p className="capture-description">
            Select a student and position the student's
            face inside the camera frame.
          </p>

          {/* STUDENT SELECT */}

          <div className="student-select-container">

            <label htmlFor="student">
              Select Student
            </label>

            <select
              id="student"
              value={selectedStudent}
              onChange={(event) => {
                setSelectedStudent(event.target.value)
                setCapturedImage(null)
                setStudentError('')
                setCameraError('')
              }}
            >
              <option value="">
                -- Select Student --
              </option>

              {students.map((student) => (
                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.name} - {student.roll_number}
                </option>
              ))}
            </select>

          </div>

          {/* STUDENT ERROR */}

          {studentError && (
            <p className="student-error">
              {studentError}
            </p>
          )}

          {/* CAMERA */}

          {selectedStudent && !capturedImage && (
            <>
              <div className="camera-container">

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                />

                <div className="face-frame"></div>

              </div>

              {cameraError && (
                <p className="camera-error">
                  {cameraError}
                </p>
              )}

              <button
                className="capture-button"
                type="button"
                onClick={captureFace}
              >
                Capture Face
              </button>
            </>
          )}

          {/* CAPTURED IMAGE */}

          {capturedImage && (
            <>
              <div className="captured-container">

                <img
                  src={capturedImage}
                  alt="Captured student face"
                />

              </div>

              <div className="capture-actions">

                <button
                  className="retake-button"
                  type="button"
                  onClick={retakeFace}
                >
                  Retake
                </button>

                <button
                  className="save-face-button"
                  type="button"
                  onClick={saveFace}
                >
                  Save Face
                </button>

              </div>
            </>
          )}

          {/* HIDDEN CANVAS */}

          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />

        </div>

      </section>
    </AppLayout>
  )
}

export default CaptureFace
