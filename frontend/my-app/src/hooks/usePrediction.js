/**
 * usePrediction hook
 * Handles image upload and API communication with backend.
 */
import { useState, useCallback } from 'react';
import axios from 'axios';

// Backend URL — uses CRA proxy in dev, env var in production
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function usePrediction() {
  const [result, setResult]     = useState(null);   // prediction result
  const [loading, setLoading]   = useState(false);  // API in progress
  const [error, setError]       = useState(null);   // error message
  const [progress, setProgress] = useState(0);      // upload progress %

  const predict = useCallback(async (imageFile) => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    // Build form data
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await axios.post(`${API_BASE}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Track upload progress
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
        timeout: 30000,  // 30s timeout
      });

      setResult(response.data);
    } catch (err) {
      // Friendly error messages
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (err.response) {
        const msg = err.response.data?.message || err.response.data?.error;
        setError(msg || `Server error (${err.response.status})`);
      } else if (err.request) {
        setError('Cannot reach server. Is the backend running on port 5000?');
      } else {
        setError(err.message || 'Unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return { result, loading, error, progress, predict, reset };
}
