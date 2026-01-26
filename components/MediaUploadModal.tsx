import React, { useState, useRef } from 'react';
import { ImageFileIcon, VideoFileIcon, AudioFileIcon, CloseIcon } from './Icons';

type MediaType = 'image' | 'video' | 'audio';

interface MediaUploadModalProps {
  mediaType: MediaType;
  onClose: () => void;
  onUploadComplete: (url: string) => void;
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({ mediaType, onClose, onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith(mediaType)) {
        setError(`Please select a valid ${mediaType} file.`);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const dataUrl = reader.result as string;
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            onUploadComplete(dataUrl);
            onClose();
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    };
  };

  const mediaConfig = {
    image: { icon: <ImageFileIcon className="w-16 h-16 text-gray-400" />, accept: "image/*" },
    video: { icon: <VideoFileIcon className="w-16 h-16 text-gray-400" />, accept: "video/*" },
    audio: { icon: <AudioFileIcon className="w-16 h-16 text-gray-400" />, accept: "audio/*" },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg relative border border-gray-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Upload {mediaType}</h2>
        {error && <p className="text-red-700 bg-red-50 border border-red-200 p-2 rounded text-sm mb-4">{error}</p>}
        {!isUploading ? (
          <>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <input type="file" ref={inputRef} onChange={handleFileChange} accept={mediaConfig[mediaType].accept} className="hidden" />
              {file ? (
                <p className="text-gray-800">{file.name}</p>
              ) : (
                <>
                  {mediaConfig[mediaType].icon}
                  <p className="mt-2 text-gray-500">Click to browse or drag & drop a file</p>
                </>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={!file}
              className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upload
            </button>
          </>
        ) : (
          <div>
            <p className="text-gray-800 mb-2">Uploading {file?.name}...</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-primary h-4 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.1s' }}></div>
            </div>
            <p className="text-center text-gray-800 mt-2">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploadModal;