<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileOptimizationService
{
    /**
     * Optimize uploaded file based on file type
     * 
     * @param UploadedFile $file
     * @param string $storageDirectory
     * @return array{filename: string, original_size: int, optimized_size: int, compression_ratio: float}
     */
    public function optimizeAndStore(UploadedFile $file, string $storageDirectory = 'documents/'): array
    {
        $originalSize = $file->getSize();
        $filename = Str::random(16) . '_' . time() . '.' . $file->getClientOriginalExtension();
        $filePath = $storageDirectory . $filename;

        try {
            // Create temporary file for compression
            $tempOriginalPath = tempnam(sys_get_temp_dir(), 'upload_original_') . '.' . $file->getClientOriginalExtension();
            $tempCompressedPath = tempnam(sys_get_temp_dir(), 'upload_compressed_') . '.' . $file->getClientOriginalExtension();
            
            // Copy uploaded file to temp location
            file_put_contents($tempOriginalPath, $file->getContent());
            
            // Compress based on file type
            $compressed = false;
            $compressionMethod = 'none';
            
            if ($file->getMimeType() === 'application/pdf') {
                if ($this->isPDFCompressionEnabled()) {
                    // Use SAFE PDF compression only if enabled and tools are available
                    $compressed = $this->safePDFCompression($tempOriginalPath, $tempCompressedPath);
                    $compressionMethod = 'pdf_safe';
                } else {
                    // Skip compression for PDFs to prevent corruption
                    $compressed = false;
                    $compressionMethod = 'pdf_skipped';
                    Log::info('PDF compression skipped - not enabled or tools unavailable', [
                        'filename' => $file->getClientOriginalName()
                    ]);
                }
            } elseif (in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/jpg'])) {
                $compressed = $this->optimizeImage($tempOriginalPath, $tempCompressedPath, $file->getMimeType());
                $compressionMethod = 'image';
            } else {
                // For other file types, try basic file compression
                $compressed = $this->compressGeneralFile($tempOriginalPath, $tempCompressedPath);
                $compressionMethod = 'general';
            }

            // Use compressed file if successful and smaller, otherwise use original
            $finalTempPath = $tempOriginalPath;
            if ($compressed && file_exists($tempCompressedPath)) {
                $originalFileSize = filesize($tempOriginalPath);
                $compressedFileSize = filesize($tempCompressedPath);
                
                // Only use compressed version if it's actually smaller
                if ($compressedFileSize < $originalFileSize && $compressedFileSize > 0) {
                    $finalTempPath = $tempCompressedPath;
                }
            }
            
            // Store the final file
            Storage::disk('public')->put($filePath, file_get_contents($finalTempPath));
            $storedSize = Storage::disk('public')->size($filePath);

            // Clean up temp files
            if (file_exists($tempOriginalPath)) unlink($tempOriginalPath);
            if (file_exists($tempCompressedPath)) unlink($tempCompressedPath);

            Log::info('File optimization completed', [
                'original_name' => $file->getClientOriginalName(),
                'filename' => $filename,
                'original_size' => $originalSize,
                'optimized_size' => $storedSize,
                'compression_ratio' => $storedSize / $originalSize,
                'compressed' => $compressed,
                'method' => $compressionMethod
            ]);

            return [
                'filename' => $filename,
                'original_size' => $originalSize,
                'optimized_size' => $storedSize,
                'compression_ratio' => $storedSize / $originalSize,
            ];
        } catch (\Exception $e) {
            Log::error('File optimization failed', [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage()
            ]);

            // Fallback: store original file directly
            Storage::disk('public')->putFileAs($storageDirectory, $file, $filename);
            
            return [
                'filename' => $filename,
                'original_size' => $originalSize,
                'optimized_size' => $originalSize,
                'compression_ratio' => 1.0,
            ];
        }
    }

    /**
     * Compress PDF file using safe compression methods
     */
    private function compressPDFFile(string $inputPath, string $outputPath): bool
    {
        // Use the new safe PDF compression method that preserves file integrity
        return $this->safePDFCompression($inputPath, $outputPath);
    }

    /**
     * Compress general files - only for specific file types that can be safely compressed
     */
    private function compressGeneralFile(string $inputPath, string $outputPath): bool
    {
        try {
            // Only compress text-based files that won't be corrupted by gzip
            $extension = strtolower(pathinfo($inputPath, PATHINFO_EXTENSION));
            $textFormats = ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js'];
            
            if (in_array($extension, $textFormats)) {
                $content = file_get_contents($inputPath);
                if ($content === false) {
                    return false;
                }
                
                // Use gzip compression for text files only
                $compressed = gzencode($content, 9);
                
                if ($compressed !== false) {
                    return file_put_contents($outputPath, $compressed) !== false;
                }
            }
            
            // For all other file types, just copy without compression
            // to avoid corruption
            return copy($inputPath, $outputPath);
        } catch (\Exception $e) {
            Log::warning('General file compression failed', ['error' => $e->getMessage()]);
            return copy($inputPath, $outputPath);
        }
    }

    /**
     * Optimize PDF using Ghostscript if available
     */
    private function optimizePDF(string $inputPath, string $outputPath): bool
    {
        try {
            // Check if Ghostscript is available
            if (!$this->isGhostscriptAvailable()) {
                return false;
            }

            // Use conservative Ghostscript settings to avoid corruption
            $command = sprintf(
                'gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.6 -dPDFSETTINGS=/printer -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages=true -dCompressFonts=true -r150 -sOutputFile="%s" "%s"',
                escapeshellarg($outputPath),
                escapeshellarg($inputPath)
            );

            $output = [];
            $returnCode = 0;
            exec($command, $output, $returnCode);

            $success = $returnCode === 0 && file_exists($outputPath) && filesize($outputPath) > 0;
            
            if ($success) {
                Log::info('PDF compressed with Ghostscript', [
                    'input_size' => filesize($inputPath),
                    'output_size' => filesize($outputPath),
                    'compression_ratio' => filesize($outputPath) / filesize($inputPath)
                ]);
            }

            return $success;
        } catch (\Exception $e) {
            Log::warning('PDF optimization failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Basic PDF compression by copying with reduced quality
     */
    private function compressPDFBasic(string $inputPath, string $outputPath): bool
    {
        // REMOVED: Custom PHP PDF compression that was corrupting files
        // Only use proven external tools
        return $this->compressPDFWithQpdf($inputPath, $outputPath);
    }

    /**
     * Compress PDF using qpdf
     */
    private function compressPDFWithQpdf(string $inputPath, string $outputPath): bool
    {
        try {
            if (!$this->isQpdfAvailable()) {
                return false;
            }
            
            $command = sprintf(
                'qpdf --linearize --optimize-images --compress-streams=y "%s" "%s"',
                escapeshellarg($inputPath),
                escapeshellarg($outputPath)
            );
            
            $output = [];
            $returnCode = 0;
            exec($command, $output, $returnCode);
            
            return $returnCode === 0 && file_exists($outputPath) && filesize($outputPath) > 0;
        } catch (\Exception $e) {
            Log::warning('qpdf compression failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Verify PDF integrity by checking file headers and structure
     */
    private function verifyPDFIntegrity(string $filePath): bool
    {
        try {
            if (!file_exists($filePath) || filesize($filePath) < 100) {
                return false;
            }
            
            $handle = fopen($filePath, 'rb');
            if (!$handle) {
                return false;
            }
            
            // Check PDF header
            $header = fread($handle, 8);
            fclose($handle);
            
            // PDF files should start with %PDF-
            return strpos($header, '%PDF-') === 0;
        } catch (\Exception $e) {
            Log::warning('PDF integrity check failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Check if qpdf is available
     */
    private function isQpdfAvailable(): bool
    {
        $output = [];
        $returnCode = 0;
        exec('qpdf --version 2>&1', $output, $returnCode);
        return $returnCode === 0;
    }

    /**
     * Optimize image using GD library
     */
    private function optimizeImage(string $inputPath, string $outputPath, string $mimeType): bool
    {
        try {
            if (!extension_loaded('gd')) {
                return copy($inputPath, $outputPath);
            }

            $image = null;
            
            switch ($mimeType) {
                case 'image/jpeg':
                case 'image/jpg':
                    $image = imagecreatefromjpeg($inputPath);
                    break;
                case 'image/png':
                    $image = imagecreatefrompng($inputPath);
                    break;
                default:
                    return copy($inputPath, $outputPath);
            }

            if (!$image) {
                return copy($inputPath, $outputPath);
            }

            // Get original dimensions
            $width = imagesx($image);
            $height = imagesy($image);

            // Resize if too large (max 1920x1080)
            $maxWidth = 1920;
            $maxHeight = 1080;
            
            if ($width > $maxWidth || $height > $maxHeight) {
                $ratio = min($maxWidth / $width, $maxHeight / $height);
                $newWidth = (int)($width * $ratio);
                $newHeight = (int)($height * $ratio);
                
                $resized = imagecreatetruecolor($newWidth, $newHeight);
                
                if ($mimeType === 'image/png') {
                    imagealphablending($resized, false);
                    imagesavealpha($resized, true);
                }
                
                imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                imagedestroy($image);
                $image = $resized;
            }

            // Save optimized image to output path
            $result = false;
            switch ($mimeType) {
                case 'image/jpeg':
                case 'image/jpg':
                    $result = imagejpeg($image, $outputPath, 75); // 75% quality
                    break;
                case 'image/png':
                    $result = imagepng($image, $outputPath, 6); // Compression level 6
                    break;
            }

            imagedestroy($image);
            return $result;
        } catch (\Exception $e) {
            Log::warning('Image optimization failed', ['error' => $e->getMessage()]);
            return copy($inputPath, $outputPath);
        }
    }

    /**
     * Check if Ghostscript is available
     */
    private function isGhostscriptAvailable(): bool
    {
        $output = [];
        $returnCode = 0;
        exec('gs --version 2>&1', $output, $returnCode);
        return $returnCode === 0;
    }

    /**
     * Get human-readable file size
     */
    public static function formatFileSize(int $bytes): string
    {
        if ($bytes === 0) return '0 Bytes';
        
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes) / log($k));
        
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }

    /**
     * Check if file needs optimization based on size
     */
    public function shouldOptimize(UploadedFile $file, int $thresholdMB = 5): bool
    {
        $thresholdBytes = $thresholdMB * 1024 * 1024;
        return $file->getSize() > $thresholdBytes;
    }

    /**
     * Check if PDF compression is enabled and tools are available
     */
    public function isPDFCompressionEnabled(): bool
    {
        // Return false to disable PDF compression until tools are verified
        // TODO: Change to true after verifying Ghostscript/qpdf are available
        return false;
    }

    /**
     * Enable PDF compression by checking tool availability
     */
    public function enablePDFCompressionIfToolsAvailable(): bool
    {
        if ($this->isGhostscriptAvailable() || $this->isQpdfAvailable()) {
            Log::info('PDF compression tools available', [
                'ghostscript' => $this->isGhostscriptAvailable(),
                'qpdf' => $this->isQpdfAvailable()
            ]);
            return true;
        }
        
        Log::warning('PDF compression tools not available');
        return false;
    }

    /**
     * Safe PDF compression that preserves file integrity
     */
    private function safePDFCompression(string $inputPath, string $outputPath): bool
    {
        try {
            // First, try Ghostscript with conservative settings
            if ($this->isGhostscriptAvailable()) {
                $command = sprintf(
                    'gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.6 -dPDFSETTINGS=/default -dNOPAUSE -dQUIET -dBATCH -sOutputFile="%s" "%s"',
                    escapeshellarg($outputPath),
                    escapeshellarg($inputPath)
                );

                $output = [];
                $returnCode = 0;
                exec($command, $output, $returnCode);

                if ($returnCode === 0 && file_exists($outputPath) && $this->verifyPDFIntegrity($outputPath)) {
                    return true;
                }
            }

            // If Ghostscript fails, try qpdf
            if ($this->isQpdfAvailable()) {
                $command = sprintf(
                    'qpdf --linearize "%s" "%s"',
                    escapeshellarg($inputPath),
                    escapeshellarg($outputPath)
                );

                $output = [];
                $returnCode = 0;
                exec($command, $output, $returnCode);

                if ($returnCode === 0 && file_exists($outputPath) && $this->verifyPDFIntegrity($outputPath)) {
                    return true;
                }
            }

            // If both fail, just copy the original file
            return copy($inputPath, $outputPath);
        } catch (\Exception $e) {
            Log::warning('Safe PDF compression failed', ['error' => $e->getMessage()]);
            return copy($inputPath, $outputPath);
        }
    }
}