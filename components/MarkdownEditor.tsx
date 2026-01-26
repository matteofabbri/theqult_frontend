
import React, { useRef, useEffect } from 'react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  heightClassName?: string;
}

const LinkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
);


const MarkdownEditor: React.FC<WysiwygEditorProps> = ({ value, onChange, placeholder, heightClassName = 'h-64' }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync state with contentEditable div
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput(); // ensure state is updated after command
  };

  const handleLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
        execCmd('createLink', url);
    }
  }
  
  const Toolbar = () => (
    <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
        <div className="flex items-center gap-1">
            <button title="Bold" type="button" onClick={() => execCmd('bold')} className="p-2 w-9 h-9 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-md">B</button>
            <button title="Italic" type="button" onClick={() => execCmd('italic')} className="p-2 w-9 h-9 flex items-center justify-center italic font-serif text-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-md">I</button>
            <button title="Underline" type="button" onClick={() => execCmd('underline')} className="p-2 w-9 h-9 flex items-center justify-center underline text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-md">U</button>
            <button title="Link" type="button" onClick={handleLink} className="p-2 w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-md">
                <LinkIcon />
            </button>
        </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-300 rounded-md">
      <Toolbar />
      <div className="p-1">
        <div
          ref={editorRef}
          onInput={handleInput}
          contentEditable
          className={`w-full ${heightClassName} bg-white text-gray-800 p-3 focus:outline-none resize-y overflow-auto prose max-w-none prose-p:my-2 prose-img:rounded-lg prose-video:rounded-lg`}
          data-placeholder={placeholder}
        />
        <style>{`
          [contentEditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af; /* gray-400 */
            pointer-events: none;
            display: block; /* For Firefox */
          }
        `}</style>
      </div>
    </div>
  );
};

export default MarkdownEditor;
