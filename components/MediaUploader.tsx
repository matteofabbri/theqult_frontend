
import React, { useRef } from 'react';
import { ImageFileIcon, VideoFileIcon, AudioFileIcon, FileIcon, CloseIcon } from './Icons';
import type { MediaItem } from '../types';

interface MediaUploaderProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ media, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMediaItems: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let type: 'image' | 'video' | 'audio' | 'file' = 'file';
      
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      const url = await fileToDataUrl(file);
      newMediaItems.push({
        id: crypto.randomUUID(),
        type,
        url,
        name: file.name
      });
    }

    onChange([...media, ...newMediaItems]);
    
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (id: string) => {
    onChange(media.filter(item => item.id !== id));
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'image': return <ImageFileIcon className="w-6 h-6 text-blue-500" />;
          case 'video': return <VideoFileIcon className="w-6 h-6 text-purple-500" />;
          case 'audio': return <AudioFileIcon className="w-6 h-6 text-orange-500" />;
          case 'file': return <FileIcon className="w-6 h-6 text-gray-500" />;
          default: return null;
      }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
        >
          <span className="text-xl font-bold">+</span>
          <span className="text-sm font-bold">Aggiungi File</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="*"
          multiple
          className="hidden"
        />
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="relative group bg-gray-50 border border-gray-200 rounded-md overflow-hidden aspect-square flex items-center justify-center">
               <button
                  type="button"
                  onClick={() => removeMedia(item.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                  title="Remove"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
                
              {item.type === 'image' && (
                <img src={item.url} alt="preview" className="w-full h-full object-cover" />
              )}
              {item.type === 'video' && (
                <video src={item.url} className="w-full h-full object-cover" />
              )}
              {(item.type === 'audio' || item.type === 'file') && (
                 <div className="flex flex-col items-center px-2 text-center">
                    {item.type === 'audio' ? <AudioFileIcon className="w-8 h-8 text-gray-400 mb-1" /> : <FileIcon className="w-8 h-8 text-gray-400 mb-1" />}
                    <span className="text-[10px] text-gray-500 truncate w-full">{item.name || (item.type === 'audio' ? 'Audio Clip' : 'File')}</span>
                 </div>
              )}
               <div className="absolute bottom-1 left-1 bg-white/80 p-1 rounded-full shadow-sm">
                 {getIcon(item.type)}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
