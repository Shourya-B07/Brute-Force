const imageUpload = document.getElementById('imageUpload')
let lastDetectionsJSON = null

// Dynamic labels are loaded from labeled_images/manifest.json
let LABELS = []
const MANIFEST_URL = 'labeled_images/manifest.json'

function saveAttendanceLocally(people, fileNameHint) {
  // Persist the latest attendance in localStorage (acts as a temp DB placeholder)
  try {
    localStorage.setItem('attendance_latest', JSON.stringify(people))
  } catch (e) {
    console.warn('Could not store attendance in localStorage:', e)
  }

  // Auto-download a JSON file (name and status only)
  try {
    const blob = new Blob([JSON.stringify(people, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const base = fileNameHint ? fileNameHint.replace(/\.[^.]+$/, '') + '-' : ''
    a.download = `attendance-${base}${ts}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.warn('Could not auto-download attendance JSON:', e)
  }
}

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let image
  let canvas
  document.body.append('Loaded')
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })

    // Build attendance-only JSON: [{ name, status }]
    const presentLabels = new Set(results.map(r => r.label).filter(l => l && l !== 'unknown'))
    const people = LABELS.map(name => ({
      name,
      status: presentLabels.has(name) ? 'present' : 'absent'
    }))

    // Keep latest in memory
    lastDetectionsJSON = people

    // Auto-save locally (download JSON and store latest to localStorage)
    const fileNameHint = (imageUpload.files && imageUpload.files[0] && imageUpload.files[0].name) ? imageUpload.files[0].name : null
    saveAttendanceLocally(people, fileNameHint)
  })
}

async function loadLabeledImages() {
  // Fetch dynamic manifest of labels and image filenames
  let manifest
  try {
    const res = await fetch(MANIFEST_URL, { cache: 'no-cache' })
    if (!res.ok) throw new Error(`Failed to load ${MANIFEST_URL}: ${res.status}`)
    manifest = await res.json()
  } catch (err) {
    console.error('Error loading labels manifest:', err)
    alert('Could not load labels manifest. Please generate labeled_images/manifest.json')
    throw err
  }

  // Expected manifest format: { labels: [ { name: string, images: string[] } ] }
  if (!manifest || !Array.isArray(manifest.labels)) {
    throw new Error('Invalid labels manifest format. Expected { labels: [ { name, images[] } ] }')
  }

  LABELS = manifest.labels.map(l => l.name)

  return Promise.all(
    manifest.labels.map(async entry => {
      const descriptions = []
      for (const file of entry.images) {
        try {
          const img = await faceapi.fetchImage(`labeled_images/${entry.name}/${file}`)
          const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor()
          if (detections && detections.descriptor) {
            descriptions.push(detections.descriptor)
          }
        } catch (e) {
          console.warn(`Skipping ${entry.name}/${file}:`, e)
        }
      }
      return new faceapi.LabeledFaceDescriptors(entry.name, descriptions)
    })
  )
}
