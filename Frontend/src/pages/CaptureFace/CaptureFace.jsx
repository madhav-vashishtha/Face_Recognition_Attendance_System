const saveFace = async () => {
  if (!selectedStudent) {
    setStudentError('Please select a student first.')
    return
  }

  if (!capturedImage) {
    setCameraError('Please capture a face first.')
    return
  }

  try {
    // Convert captured image to Blob
    const imageResponse = await fetch(capturedImage)
    const blob = await imageResponse.blob()

    // Create FormData
    const formData = new FormData()

    formData.append(
      'face_image',
      blob,
      'face.jpg'
    )

    // Send image to Django
    const saveResponse = await fetch(
      `http://127.0.0.1:8000/api/students/${selectedStudent}/save-face/`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await saveResponse.json()

    if (!saveResponse.ok) {
      throw new Error(
        data.error || 'Failed to save face.'
      )
    }

    // Success
    alert(
      `Face saved successfully for ${data.student.name} (${data.student.roll_number})`
    )

    // Reset
    setCapturedImage(null)
    setSelectedStudent('')
    setStudentError('')
    setCameraError('')

  } catch (error) {
    console.error('Save face error:', error)

    setStudentError(
      error.message || 'Unable to save face.'
    )
  }
}
