import { useEffect, useRef, useState } from 'react';

const DEFAULT_HELPER = 'Formatos permitidos: JPG, PNG, WEBP. Máx. 5MB.';

const FileUpload = ({
  id,
  label = 'Imagen del Artículo',
  helperText = DEFAULT_HELPER,
  onFileChange,
  maxSizeMB = 5,
}) => {
  const [fileName, setFileName] = useState('Ningún archivo seleccionado');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const dropzoneRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetFileState = () => {
    setFileName('Ningún archivo seleccionado');
    setPreviewUrl('');
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onFileChange) {
      onFileChange(null);
    }
  };

  const validateFile = (file) => {
    if (!file) return 'No se seleccionó ningún archivo.';

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Formato no válido. Solo JPG, PNG o WEBP.';
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo supera ${maxSizeMB}MB.`;
    }

    return '';
  };

  const handleFile = (file) => {
    if (!file) {
      resetFileState();
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setPreviewUrl('');
      setFileName('Ningún archivo seleccionado');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      if (onFileChange) {
        onFileChange(null);
      }
      return;
    }

    setError('');
    setFileName(file.name);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);

    if (onFileChange) {
      onFileChange(file);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const triggerFileDialog = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerFileDialog();
    }
  };

  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div
        ref={dropzoneRef}
        className={`file-dropzone ${isDragging ? 'is-dragging' : ''} ${error ? 'has-error' : ''}`}
        onClick={triggerFileDialog}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Subir imagen"
        aria-describedby={`${helperId}${error ? ` ${errorId}` : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          id={id}
          accept="image/jpeg,image/png,image/webp"
          className="file-input-hidden"
          onChange={handleInputChange}
        />

        <div className="file-upload-content">
          <button
            type="button"
            className="btn btn-primary file-upload-button"
            onClick={(event) => {
              event.stopPropagation();
              triggerFileDialog();
            }}
          >
            Subir imagen
          </button>
          <div className="file-meta">
            <span className="file-name">{fileName}</span>
            <span className="file-helper" id={helperId}>{helperText}</span>
          </div>
        </div>

        {previewUrl && (
          <div className="file-preview" aria-hidden="true">
            <img src={previewUrl} alt={`Vista previa de ${fileName}`} />
          </div>
        )}
      </div>

      {error && (
        <div className="field-error" id={errorId} aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
