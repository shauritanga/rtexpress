import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    Upload, 
    X, 
    File, 
    Image, 
    FileText, 
    Archive,
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react';

interface FileUploadProps {
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number; // in MB
    acceptedTypes?: string[];
    className?: string;
    disabled?: boolean;
    multiple?: boolean;
    showPreview?: boolean;
}

interface UploadFile extends File {
    id: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    preview?: string;
}

export function FileUpload({
    onFilesChange,
    maxFiles = 10,
    maxSize = 10, // 10MB default
    acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
    className,
    disabled = false,
    multiple = true,
    showPreview = true,
}: FileUploadProps) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return Image;
        if (file.type.includes('pdf')) return FileText;
        if (file.type.includes('zip') || file.type.includes('rar')) return Archive;
        return File;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            return `File size must be less than ${maxSize}MB`;
        }

        // Check file type
        const isValidType = acceptedTypes.some(type => {
            if (type.startsWith('.')) {
                return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            if (type.includes('*')) {
                const baseType = type.split('/')[0];
                return file.type.startsWith(baseType);
            }
            return file.type === type;
        });

        if (!isValidType) {
            return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
        }

        return null;
    };

    const createFilePreview = (file: File): Promise<string | undefined> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = () => resolve(undefined);
                reader.readAsDataURL(file);
            } else {
                resolve(undefined);
            }
        });
    };

    const processFiles = async (fileList: FileList) => {
        const newFiles: UploadFile[] = [];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const error = validateFile(file);
            const preview = showPreview ? await createFilePreview(file) : undefined;

            const uploadFile: UploadFile = Object.assign(file, {
                id: `${Date.now()}-${i}`,
                progress: 0,
                status: error ? 'error' as const : 'pending' as const,
                error,
                preview,
            });

            newFiles.push(uploadFile);
        }

        // Check total file limit
        const totalFiles = files.length + newFiles.length;
        if (totalFiles > maxFiles) {
            alert(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        
        // Only pass valid files to parent
        const validFiles = updatedFiles.filter(f => f.status !== 'error');
        onFilesChange(validFiles);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragOver(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            processFiles(droppedFiles);
        }
    }, [disabled, files, maxFiles, onFilesChange]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            processFiles(selectedFiles);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (fileId: string) => {
        const updatedFiles = files.filter(f => f.id !== fileId);
        setFiles(updatedFiles);
        onFilesChange(updatedFiles.filter(f => f.status !== 'error'));
    };

    const simulateUpload = (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (!file || file.status !== 'pending') return;

        // Update file status to uploading
        setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'uploading' as const } : f
        ));

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Mark as complete
                setFiles(prev => prev.map(f => 
                    f.id === fileId 
                        ? { ...f, progress: 100, status: 'success' as const }
                        : f
                ));
            } else {
                // Update progress
                setFiles(prev => prev.map(f => 
                    f.id === fileId ? { ...f, progress } : f
                ));
            }
        }, 200);
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Drop Zone */}
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-colors",
                    isDragOver 
                        ? "border-primary bg-primary/5" 
                        : "border-muted-foreground/25",
                    disabled && "opacity-50 cursor-not-allowed",
                    !disabled && "hover:border-primary/50 cursor-pointer"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled}
                />

                <div className="flex flex-col items-center justify-center text-center">
                    <Upload className={cn(
                        "h-10 w-10 mb-4",
                        isDragOver ? "text-primary" : "text-muted-foreground"
                    )} />
                    <p className="text-lg font-medium mb-2">
                        {isDragOver ? "Drop files here" : "Upload files"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        Drag & drop files here, or click to select files
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>Maximum {maxFiles} files, up to {maxSize}MB each</p>
                        <p>Supported: {acceptedTypes.join(', ')}</p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Files ({files.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {files.map((file) => {
                            const FileIcon = getFileIcon(file);
                            
                            return (
                                <div
                                    key={file.id}
                                    className="flex items-center space-x-3 p-3 border rounded-lg bg-card"
                                >
                                    {/* File Icon/Preview */}
                                    <div className="flex-shrink-0">
                                        {file.preview ? (
                                            <img
                                                src={file.preview}
                                                alt={file.name}
                                                className="h-10 w-10 object-cover rounded"
                                            />
                                        ) : (
                                            <FileIcon className="h-10 w-10 text-muted-foreground" />
                                        )}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </p>

                                        {/* Progress Bar */}
                                        {file.status === 'uploading' && (
                                            <div className="mt-2">
                                                <Progress value={file.progress} className="h-1" />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {Math.round(file.progress)}% uploaded
                                                </p>
                                            </div>
                                        )}

                                        {/* Error Message */}
                                        {file.status === 'error' && file.error && (
                                            <p className="text-xs text-red-600 mt-1">
                                                {file.error}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status Icon */}
                                    <div className="flex-shrink-0">
                                        {file.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    simulateUpload(file.id);
                                                }}
                                            >
                                                Upload
                                            </Button>
                                        )}
                                        {file.status === 'uploading' && (
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                        )}
                                        {file.status === 'success' && (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        )}
                                        {file.status === 'error' && (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(file.id);
                                        }}
                                        className="flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
