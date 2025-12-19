import { useCallback, useState } from 'react';
import { parseMultiplePDFs } from '../../pdf/parser';
import type { Document } from '../../types';

interface UploadZoneProps {
  onDocumentsLoaded: (documents: Document[]) => void;
}

export function UploadZone({ onDocumentsLoaded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const pdfFiles = fileArray.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      alert('Please select PDF files only.');
      return;
    }

    setIsProcessing(true);
    try {
      const documents = await parseMultiplePDFs(pdfFiles);
      onDocumentsLoaded(documents);
    } catch (error) {
      console.error('Error parsing PDFs:', error);
      alert('Error loading PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onDocumentsLoaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center transition-fast
        ${isDragging 
          ? 'border-accent bg-accent/5' 
          : 'border-gray-300 bg-white hover:border-gray-400'
        }
        ${isProcessing ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <input
        type="file"
        id="pdf-upload"
        accept=".pdf,application/pdf"
        multiple
        onChange={handleFileInput}
        className="hidden"
        disabled={isProcessing}
      />
      
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="text-gray-600">Processing PDFs...</p>
        </div>
      ) : (
        <>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer text-accent hover:text-accent-hover font-medium"
            >
              Click to upload
            </label>
            <span className="text-gray-500"> or drag and drop</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">PDF files only</p>
        </>
      )}
    </div>
  );
}

