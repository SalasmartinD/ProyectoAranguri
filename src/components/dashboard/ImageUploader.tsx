'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploaderProps {
  existingImages: string[];
  onExistingImagesChange: (urls: string[]) => void;
  selectedFiles: File[];
  onSelectedFilesChange: (files: File[]) => void;
}

export function ImageUploader({
  existingImages,
  onExistingImagesChange,
  selectedFiles,
  onSelectedFilesChange,
}: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to handle files array change
  const handleFiles = (filesList: FileList | null) => {
    if (!filesList) return;
    
    const newFiles: File[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (file.type.startsWith('image/')) {
        // Prevent duplicate files (by name and size)
        const isDuplicate = selectedFiles.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!isDuplicate) {
          newFiles.push(file);
        }
      }
    }
    
    if (newFiles.length > 0) {
      onSelectedFilesChange([...selectedFiles, ...newFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    onExistingImagesChange(existingImages.filter((_, idx) => idx !== indexToRemove));
  };

  const removeSelectedFile = (indexToRemove: number) => {
    onSelectedFilesChange(selectedFiles.filter((_, idx) => idx !== indexToRemove));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-semibold text-slate-500">Imágenes del Vehículo (Múltiples)</label>
      
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-indigo-600 bg-indigo-50/50'
            : 'border-slate-200 hover:border-indigo-500 hover:bg-slate-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:scale-105 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300">
          <UploadCloud className="h-6 w-6" />
        </div>

        <div className="mt-3 text-xs">
          <span className="font-bold text-slate-700">Haz clic para subir</span>
          <span className="text-slate-400"> o arrastra y suelta</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">PNG, JPG o WEBP (puedes seleccionar varias)</p>
      </div>

      {/* Grid of Previews (thumbnails) */}
      {(existingImages.length > 0 || selectedFiles.length > 0) && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 mt-2">
          {/* Render existing images from server */}
          {existingImages.map((url, idx) => (
            <div
              key={`existing-${idx}`}
              className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm"
            >
              <img
                src={url}
                alt="Existente"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute bottom-1 left-1 rounded bg-slate-900/60 px-1 py-0.5 text-[8px] font-semibold text-white uppercase tracking-wider backdrop-blur-xs">
                Guardada
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeExistingImage(idx);
                }}
                className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-90 hover:opacity-100 hover:scale-105 transition-all shadow-md"
                title="Eliminar imagen"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Render new selected files */}
          {selectedFiles.map((file, idx) => {
            const objectUrl = URL.createObjectURL(file);
            return (
              <div
                key={`selected-${idx}`}
                className="group relative aspect-video rounded-xl overflow-hidden border border-indigo-200 bg-indigo-50/20 shadow-sm"
              >
                <img
                  src={objectUrl}
                  alt={file.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onLoad={() => {
                    // Revoke object URL after loading to free memory
                    // We can just let it render, but it's fine.
                  }}
                />
                <span className="absolute bottom-1 left-1 rounded bg-indigo-600/80 px-1 py-0.5 text-[8px] font-semibold text-white uppercase tracking-wider backdrop-blur-xs">
                  Nueva
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedFile(idx);
                  }}
                  className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-90 hover:opacity-100 hover:scale-105 transition-all shadow-md"
                  title="Eliminar imagen"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
