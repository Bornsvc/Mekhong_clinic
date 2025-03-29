import React, { useState, useCallback, useContext } from 'react';
import { FormContext } from "@/app/page";
import axios from 'axios';
import CloseIcon from '@/icons/close.png'
import Image from 'next/image';

function ImportPatientForm() {
  const { setIsImportActive } = useContext(FormContext);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/patients/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert('File uploaded successfully!');
        setIsImportActive(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">

      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
      <div className='flex justify-between items-center mb-6'>
        <h2 className="text-2xl font-bold text-gray-800 w-full text-center">
            Import Patient File
        </h2>
        <Image
            src={CloseIcon}
            alt="Close"
            width={24}
            height={24}
            className="cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => setIsImportActive(false)}
        />
        </div>

        <div className="flex flex-col gap-5">
          <div
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative group min-h-[200px] flex flex-col items-center justify-center
              border-2 border-dashed rounded-xl p-6 transition-all duration-300
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
              ${file ? 'bg-green-50 border-green-500' : ''}
            `}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center text-center">
              {file ? (
                <>
                  <svg className="w-10 h-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-lg font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">File selected</p>
                </>
              ) : (
                <>
                  <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-800">Drag & Drop your file here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </>
              )}
            </div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`
              py-3 px-4 rounded-lg font-semibold shadow-lg transform transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${file && !isUploading
                ? 'bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-blue-500/50' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportPatientForm;