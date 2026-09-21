import AppLayout from '../../components/AppLayout/AppLayout'
import './CaptureFace.css'

function CaptureFace({ onNavigate }) {
  return (
    <AppLayout activePage="Capture Face" onNavigate={onNavigate}>
      <section className="page-body capture-face-page">
        <div className="page-card capture-camera-card">
          <h1>
            Capturing Image for: <span>Anjali Sharma (101)</span>
          </h1>
          <div className="capture-preview">
            <div className="capture-face-box"></div>
          </div>
          <button className="stop-capture-button" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 8h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
              <path d="m9 8 1.5-3h3L15 8" />
              <circle cx="12" cy="13.5" r="2.4" />
            </svg>
            Stop Capture
          </button>
        </div>

        <div className="page-card capture-gallery-card">
          <h2>Captured Images (12 / 50)</h2>
          <div className="capture-thumbs">
            {Array.from({ length: 14 }, (_, index) => (
              <div className="capture-thumb" key={index}></div>
            ))}
          </div>
          <div className="capture-progress-row">
            <div className="capture-progress">
              <span></span>
            </div>
            <strong>12 / 50 images captured</strong>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}

export default CaptureFace
