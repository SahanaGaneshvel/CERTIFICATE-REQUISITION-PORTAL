import React, { useRef, useState } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  helperText?: string;
  error?: string;
  onFileSelect: (file: File | null) => void;
  required?: boolean;
}

export function FileUpload({
  label,
  accept = '.pdf',
  maxSize = 3,
  helperText,
  error,
  onFileSelect,
  required = false,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      {selectedFile ? (
        <div className={styles.fileSelected}>
          <div className={styles.fileInfo}>
            <FileText size={24} className={styles.fileIcon} />
            <div className={styles.fileDetails}>
              <span className={styles.fileName}>{selectedFile.name}</span>
              <span className={styles.fileSize}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
          <div className={styles.fileActions}>
            <CheckCircle size={20} className={styles.successIcon} />
            <button
              type="button"
              className={styles.removeButton}
              onClick={handleRemove}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''} ${(error || uploadError) ? styles.hasError : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className={styles.input}
          />
          <Upload size={32} className={styles.uploadIcon} />
          <div className={styles.dropzoneText}>
            <span className={styles.dropzoneTitle}>
              Click to upload or drag and drop
            </span>
            <span className={styles.dropzoneSubtitle}>
              {accept} files only, max {maxSize}MB
            </span>
          </div>
        </div>
      )}

      {(error || uploadError) && (
        <span className={styles.error}>{error || uploadError}</span>
      )}
      {helperText && !error && !uploadError && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
}
