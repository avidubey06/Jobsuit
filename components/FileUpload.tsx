import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Basic validation
    if (file.type === "application/pdf" || 
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
        file.type === "text/plain") {
      onFileSelect(file);
    } else {
      alert("Please upload a PDF or DOCX file.");
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors duration-300 ease-in-out
          ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isLoading ? onButtonClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="flex flex-col items-center text-center p-6">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          ) : (
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          )}
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {isLoading ? "Parsing Resume..." : "Upload your Resume"}
          </h3>
          <p className="text-gray-500 mb-6">
            Drag & drop or click to browse. Supports PDF & DOCX.
          </p>
          
          {!isLoading && (
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <FileText className="w-4 h-4" />
              <span>Secure, private, and ATS-optimized parsing</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-start space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
        <p>
          We use Google's advanced Gemini AI to read your resume just like a human recruiter or a sophisticated ATS would. Your data is processed securely.
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
