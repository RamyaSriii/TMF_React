import React, { useState, useCallback } from 'react';
import ImageUploader from '../components/ImageUploader';
import CameraCapture from '../components/CameraCapture';
import ResultCard from '../components/ResultCard';
import { usePrediction } from '../hooks/usePrediction';
import './PredictionPage.css';

export default function PredictionPage() {
  const [previewUrl, setPreviewUrl]   = useState(null);  // Image preview URL
  const [imageFile, setImageFile]     = useState(null);  // Image File object
  const [inputMode, setInputMode]     = useState('upload'); // 'upload' | 'camera'

  const { result, loading, error, progress, predict, reset } = usePrediction();

  // Handle image selected via upload
  const handleUploadSelect = useCallback((file) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageFile(file);
    reset();
  }, [reset]);

  // Handle image captured via camera
  const handleCameraCapture = useCallback((file, dataUrl) => {
    setPreviewUrl(dataUrl);
    setImageFile(file);
    reset();
  }, [reset]);

  // Submit image for prediction
  const handleAnalyze = useCallback(() => {
    if (imageFile) predict(imageFile);
  }, [imageFile, predict]);

  // Clear everything and start fresh
  const handleReset = useCallback(() => {
    setPreviewUrl(null);
    setImageFile(null);
    reset();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl, reset]);

  const hasImage = !!previewUrl;

  return (
    <div className="predict-page">
      <div className="container predict-page__inner">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="predict-page__header">
          <span className="badge badge-green">AI Analysis</span>
          <h1 className="predict-page__title">Plant Disease Scanner</h1>
          <p className="predict-page__subtitle">
            Upload a clear photo of a diseased leaf for instant AI diagnosis
          </p>
        </div>

        {/* ── Main Grid ───────────────────────────────────── */}
        <div className={`predict-grid ${result ? 'predict-grid--with-result' : ''}`}>

          {/* Left: Input Panel */}
          <div className="predict-panel">

            {/* Input Mode Tabs */}
            <div className="input-tabs">
              <button
                className={`input-tab ${inputMode === 'upload' ? 'active' : ''}`}
                onClick={() => setInputMode('upload')}
              >
                📁 Upload Image
              </button>
              <button
                className={`input-tab ${inputMode === 'camera' ? 'active' : ''}`}
                onClick={() => setInputMode('camera')}
              >
                📷 Use Camera
              </button>
            </div>

            {/* Input Component */}
            <div className="input-area">
              {inputMode === 'upload' ? (
                <ImageUploader
                  onImageSelect={handleUploadSelect}
                  disabled={loading}
                />
              ) : (
                <CameraCapture
                  onCapture={handleCameraCapture}
                  disabled={loading}
                />
              )}
            </div>

            {/* Image Preview */}
            {hasImage && (
              <div className="preview-section animate-fade-in">
                <div className="preview-header">
                  <span className="preview-label">Selected Image</span>
                  <button className="preview-clear-btn" onClick={handleReset} title="Remove image">
                    ✕ Clear
                  </button>
                </div>
                <div className="preview-image-wrap">
                  <img
                    src={previewUrl}
                    alt="Plant leaf preview"
                    className="preview-image"
                  />
                  {loading && (
                    <div className="preview-loading-overlay">
                      <div className="spinner" />
                      <p>Analyzing...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {loading && progress > 0 && progress < 100 && (
              <div className="upload-progress animate-fade-in">
                <div className="upload-progress__bar">
                  <div
                    className="upload-progress__fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="upload-progress__label">
                  Uploading… {progress}%
                </span>
              </div>
            )}

            {/* Analyze Button */}
            <button
              className={`btn btn-primary analyze-btn w-full ${!hasImage || loading ? '' : ''}`}
              onClick={handleAnalyze}
              disabled={!hasImage || loading}
            >
              {loading ? (
                <>
                  <div className="spinner spinner-sm" />
                  <span>Analyzing with AI…</span>
                </>
              ) : (
                <>
                  <span>🔬</span>
                  <span>{result ? 'Analyze Again' : 'Analyze Plant'}</span>
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="error-box animate-fade-in">
                <span>⚠️</span>
                <div>
                  <p className="error-box__title">Analysis Failed</p>
                  <p className="error-box__msg">{error}</p>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="tips-box">
              <p className="tips-box__title">📌 Tips for best results</p>
              <ul>
                <li>Focus on a single leaf with clear, close-up shot</li>
                <li>Use natural daylight — avoid harsh shadows</li>
                <li>Capture both healthy and affected areas</li>
                <li>Avoid blurry or overly dark images</li>
              </ul>
            </div>
          </div>

          {/* Right: Results Panel */}
          <div className="result-panel">
            {!result && !loading && (
              <div className="result-placeholder">
                <div className="result-placeholder__icon">🌿</div>
                <h3>Awaiting Analysis</h3>
                <p>Upload or capture a plant image and click "Analyze Plant" to get your diagnosis</p>

                <div className="result-placeholder__steps">
                  {['Select leaf image', 'Click Analyze', 'Get instant results'].map((s, i) => (
                    <div key={i} className="placeholder-step">
                      <span className="placeholder-step__num">{i + 1}</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="result-loading animate-fade-in">
                <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
                <h3>Analyzing Your Plant</h3>
                <p>Running image through CNN model…</p>
                <div className="loading-steps">
                  {[
                    'Preprocessing image',
                    'Running CNN inference',
                    'Looking up disease database',
                    'Generating recommendations',
                  ].map((step, i) => (
                    <div key={i} className="loading-step" style={{ animationDelay: `${i * 0.3}s` }}>
                      <div className="loading-step__dot" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result && !loading && (
              <ResultCard result={result} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
