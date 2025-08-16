import { useRef, useEffect, useState } from 'react';

interface FileUploadProps {
    label: string;
    required?: boolean;
    value: string | File | null;
    onChange: (file: File | null) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    allowedTypes?: string[];
    preview?: boolean;
    className?: string;
    dragText?: string;
}

export default function FileUpload({
    label,
    required = false,
    value,
    onChange,
    accept = "image/*",
    multiple = false,
    maxSize = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    preview = true,
    className = "",
    dragText = "Drag & drop or click to upload"
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate preview URL
    useEffect(() => {
        if (!value) {
            setPreviewUrl(null);
            return;
        }

        if (value instanceof File) {
            if (value.type.startsWith('image/')) {
                const url = URL.createObjectURL(value);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        } else if (typeof value === 'string' && value) {
            // Handle existing images (URLs)
            setPreviewUrl(value.startsWith('/storage/') ? value : `/storage/${value}`);
        }
    }, [value]);

    const validateFile = (file: File): string | null => {
        if (maxSize && file.size > maxSize * 1024 * 1024) {
            return `File size must be less than ${maxSize}MB`;
        }
        
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            return `File type must be: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`;
        }
        
        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            setError(null);
            onChange(file);
        } else {
            onChange(null);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        
        const file = Array.from(e.dataTransfer.files || [])[0] || null;
        if (file) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            setError(null);
            onChange(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };

    const removeFile = () => {
        onChange(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFileName = () => {
        if (value instanceof File) return value.name;
        if (typeof value === 'string' && value) return value.split('/').pop() || 'Current file';
        return null;
    };

    const getFileSize = () => {
        if (value instanceof File) return `${(value.size / 1024).toFixed(1)} KB`;
        return null;
    };

    return (
        <div className={`mb-4 ${className}`}>
            <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            
            <div
                className={`
                    border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200
                    ${dragActive 
                        ? 'border-[#C46B02] bg-[#C46B02]/5' 
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }
                    ${error ? 'border-red-300 bg-red-50' : ''}
                `}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {value ? (
                    <div className="space-y-2">
                        {preview && previewUrl && (
                            <div className="mb-3">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-24 max-w-full mx-auto rounded object-cover"
                                />
                            </div>
                        )}
                        <div>
                            <div className="font-medium text-sm text-gray-800">{getFileName()}</div>
                            {getFileSize() && (
                                <div className="text-xs text-gray-500">{getFileSize()}</div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="text-xs text-red-600 hover:text-red-800 underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="py-4">
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-gray-500 text-sm">
                            {dragText}
                        </span>
                    </div>
                )}
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            
            {error && (
                <div className="text-red-600 text-xs mt-1">{error}</div>
            )}
        </div>
    );
}
