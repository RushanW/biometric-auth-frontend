import React, { useRef, useState } from 'react';

export default function RegisterUser() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');

  // Assume models are loaded in useEffect (like your current setup)
  // ...

  const registerUser = async () => {
    if (!modelsLoaded) {
      setResult('Models not loaded yet');
      return;
    }
    if (!name || !staffId) {
      setResult('Please enter Name and Staff ID');
      return;
    }

    // Detect single face with landmarks and descriptor from video element
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setResult('❌ No face detected.');
      return;
    }

    const descriptorArray = Array.from(detection.descriptor);

    // Capture reference photo snapshot
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('staffId', staffId);
        formData.append('descriptor', JSON.stringify(descriptorArray));
        formData.append('photo', blob, 'reference.jpg');

        const res = await fetch('http://localhost:8000/register_user', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          setResult(`✅ Registered user ${name} (ID: ${staffId}) successfully!`);
        } else {
          setResult(`❌ Registration failed: ${data.message}`);
        }
      } catch (error) {
        console.error('Registration error:', error);
        setResult('❌ Error during registration.');
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="border p-2 mb-2"
      />
      <input
        type="text"
        placeholder="Staff ID"
        value={staffId}
        onChange={e => setStaffId(e.target.value)}
        className="border p-2 mb-4"
      />
      <video
        ref={videoRef}
        width={400}
        height={300}
        autoPlay
        muted
        className="rounded shadow-lg border border-gray-300"
      />
      <canvas ref={canvasRef} width={400} height={300} style={{ display: 'none' }} />
      <button
        onClick={registerUser}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
      >
        {loading ? 'Registering...' : 'Register User'}
      </button>
      <div className="mt-4 font-semibold">{result}</div>
    </div>
  );
}
