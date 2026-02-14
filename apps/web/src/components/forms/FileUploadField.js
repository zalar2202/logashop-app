'use client';

import { useCallback } from 'react';
import { Field, ErrorMessage } from 'formik';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, ImageIcon } from 'lucide-react';

/**
 * FileUploadField Component
 * 
 * A Formik-integrated file upload component with drag-and-drop support,
 * image preview, and file validation.
 * 
 * @param {object} props
 * @param {string} props.name - Formik field name
 * @param {string} props.label - Field label
 * @param {boolean} props.multiple - Allow multiple files (default: false)
 * @param {object} props.accept - Accepted file types (e.g., {'image/*': ['.png', '.jpg']})
 * @param {number} props.maxSize - Max file size in bytes (default: 5MB)
 * @param {string} props.helperText - Helper text below the field
 * @param {boolean} props.showPreview - Show image preview (default: true)
 * @param {boolean} props.disabled - Disable the field
 * @param {boolean} props.required - Mark field as required
 */
export function FileUploadField({
    name,
    label,
    multiple = false,
    accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxSize = 5 * 1024 * 1024, // 5MB default
    helperText,
    showPreview = true,
    disabled = false,
    required = false,
}) {
    return (
        <Field name={name}>
            {({ field, form, meta }) => {
                const fieldValue = field.value;
                const hasError = meta.touched && meta.error;

                // Handle file drop/selection
                const onDrop = useCallback(
                    (acceptedFiles, rejectedFiles) => {
                        form.setFieldTouched(name, true);

                        // Handle rejected files
                        if (rejectedFiles.length > 0) {
                            const rejection = rejectedFiles[0];
                            let errorMessage = 'File upload failed';

                            if (rejection.errors[0]?.code === 'file-too-large') {
                                errorMessage = `File is too large. Max size: ${formatFileSize(maxSize)}`;
                            } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                                errorMessage = 'Invalid file type';
                            }

                            form.setFieldValue(name, null);
                            form.setFieldError(name, errorMessage);
                            return;
                        }

                        // Handle accepted files
                        if (acceptedFiles.length > 0) {
                            if (multiple) {
                                form.setFieldValue(name, acceptedFiles);
                            } else {
                                form.setFieldValue(name, acceptedFiles[0]);
                            }
                        }
                    },
                    [name, multiple, maxSize, form]
                );

                // Setup dropzone
                const { getRootProps, getInputProps, isDragActive } = useDropzone({
                    onDrop,
                    accept,
                    maxSize,
                    multiple,
                    disabled,
                });

                // Remove file handler
                const removeFile = (e, indexToRemove) => {
                    e.stopPropagation();
                    form.setFieldTouched(name, true);

                    if (multiple && Array.isArray(fieldValue)) {
                        const newFiles = fieldValue.filter((_, index) => index !== indexToRemove);
                        form.setFieldValue(name, newFiles.length > 0 ? newFiles : null);
                    } else {
                        form.setFieldValue(name, null);
                    }
                };

                // Check if file is an image
                const isImage = (file) => {
                    return file && file.type && file.type.startsWith('image/');
                };

                // Format file size
                const formatFileSize = (bytes) => {
                    if (bytes === 0) return '0 Bytes';
                    const k = 1024;
                    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
                };

                // Render file preview
                const renderFilePreview = (file, index) => {
                    const fileURL = file instanceof File ? URL.createObjectURL(file) : file;
                    const fileName = file instanceof File ? file.name : 'Uploaded file';
                    const fileSize = file instanceof File ? file.size : null;

                    return (
                        <div
                            key={index}
                            className="relative group rounded-lg border p-3 flex items-center gap-3 transition-all"
                            style={{
                                backgroundColor: 'var(--color-background-elevated)',
                                borderColor: 'var(--color-border)',
                            }}
                        >
                            {/* Preview thumbnail */}
                            {showPreview && isImage(file) ? (
                                <img
                                    src={fileURL}
                                    alt={fileName}
                                    className="w-12 h-12 rounded object-cover"
                                />
                            ) : (
                                <div
                                    className="w-12 h-12 rounded flex items-center justify-center"
                                    style={{
                                        backgroundColor: 'var(--color-background)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    <FileIcon className="w-6 h-6" />
                                </div>
                            )}

                            {/* File info */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-medium truncate"
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    {fileName}
                                </p>
                                {fileSize && (
                                    <p
                                        className="text-xs"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {formatFileSize(fileSize)}
                                    </p>
                                )}
                            </div>

                            {/* Remove button */}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => removeFile(e, index)}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{
                                        backgroundColor: 'var(--color-error)',
                                        color: '#ffffff',
                                    }}
                                    aria-label="Remove file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    );
                };

                // Get files array for rendering
                const filesToRender = multiple
                    ? Array.isArray(fieldValue) ? fieldValue : []
                    : fieldValue ? [fieldValue] : [];

                return (
                    <div className="mb-4">
                        {/* Label */}
                        {label && (
                            <label
                                htmlFor={name}
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {label}
                                {required && (
                                    <span style={{ color: 'var(--color-error)' }}> *</span>
                                )}
                            </label>
                        )}

                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className={`
                                relative rounded-lg border-2 border-dashed p-6
                                transition-all duration-200 cursor-pointer
                                ${isDragActive ? 'scale-[1.02]' : 'scale-100'}
                                ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-opacity-70'}
                                ${hasError ? 'border-red-500' : ''}
                            `}
                            style={{
                                backgroundColor: isDragActive
                                    ? 'var(--color-primary-light)'
                                    : 'var(--color-background)',
                                borderColor: hasError
                                    ? 'var(--color-error)'
                                    : isDragActive
                                    ? 'var(--color-primary)'
                                    : 'var(--color-border)',
                            }}
                        >
                            <input {...getInputProps()} id={name} />

                            {/* Upload prompt */}
                            {filesToRender.length === 0 && (
                                <div className="text-center">
                                    <div
                                        className="mx-auto w-12 h-12 mb-3 rounded-full flex items-center justify-center"
                                        style={{
                                            backgroundColor: 'var(--color-background-elevated)',
                                            color: 'var(--color-primary)',
                                        }}
                                    >
                                        {isDragActive ? (
                                            <Upload className="w-6 h-6 animate-bounce" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6" />
                                        )}
                                    </div>

                                    <p
                                        className="text-sm font-medium mb-1"
                                        style={{ color: 'var(--color-text-primary)' }}
                                    >
                                        {isDragActive ? (
                                            'Drop the file here'
                                        ) : (
                                            <>
                                                <span style={{ color: 'var(--color-primary)' }}>
                                                    Click to upload
                                                </span>
                                                {' or drag and drop'}
                                            </>
                                        )}
                                    </p>

                                    <p
                                        className="text-xs"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        Max file size: {formatFileSize(maxSize)}
                                    </p>
                                </div>
                            )}

                            {/* File previews */}
                            {filesToRender.length > 0 && (
                                <div className="space-y-2">
                                    {filesToRender.map((file, index) => renderFilePreview(file, index))}
                                </div>
                            )}
                        </div>

                        {/* Helper text */}
                        {helperText && !hasError && (
                            <p
                                className="mt-1.5 text-xs"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {helperText}
                            </p>
                        )}

                        {/* Error message */}
                        <ErrorMessage name={name}>
                            {(msg) => (
                                <p
                                    className="mt-1.5 text-xs font-medium"
                                    style={{ color: 'var(--color-error)' }}
                                >
                                    {msg}
                                </p>
                            )}
                        </ErrorMessage>
                    </div>
                );
            }}
        </Field>
    );
}
