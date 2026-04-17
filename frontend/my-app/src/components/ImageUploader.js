import React, { useRef, useState, useCallback } from 'react';
import './ImageUploader.css';

/**
 * ImageUploader — handles file upload and drag-and-drop
 */
export default function ImageUploader({ onImageSelect, disabled }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // Validate and emit selected file
  const handleFile = useCallback((file) => {
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    if (!allowed.includes(file.type)) {
      alert('Please upload a JPG, PNG, WEBP, or BMP image.');
      return;
    }

    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`Image too large. Maximum size is ${maxMB}MB.`);
      return;
    }

    onImageSelect(file);
  }, [onImageSelect]);

  // File input change
  const handleInputChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`uploader ${dragOver ? 'uploader--drag-over' : ''} ${disabled ? 'uploader--disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/bmp"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <div className="uploader__icon">
        {dragOver ? '⬇️' : '📁'}
      </div>

      <div className="uploader__text">
        <p className="uploader__title">
          {dragOver ? 'Drop image here' : 'Upload Plant Image'}
        </p>
        <p className="uploader__subtitle">
          Drag & drop or click to browse
        </p>
        <p className="uploader__hint">
          JPG, PNG, WEBP · Max 10MB
        </p>
      </div>
    </div>
  );
}
