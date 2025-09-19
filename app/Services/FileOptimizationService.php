<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Services\PDFCompressor;

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
                $compressed = $this->compressPDFFile($tempOriginalPath, $tempCompressedPath);
                $compressionMethod = 'pdf';
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
     * Compress PDF file using available methods
     */
    private function compressPDFFile(string $inputPath, string $outputPath): bool
    {
        // Try Ghostscript first (best compression)
        if ($this->optimizePDF($inputPath, $outputPath)) {
            return true;
        }
        
        // Fallback to basic compression
        return $this->compressPDFBasic($inputPath, $outputPath);
    }

    /**
     * Compress general files using gzip compression
     */
    private function compressGeneralFile(string $inputPath, string $outputPath): bool
    {
        try {
            $content = file_get_contents($inputPath);
            if ($content === false) {
                return false;
            }
            
            // Use gzip compression for general files
            $compressed = gzencode($content, 9); // Maximum compression
            
            if ($compressed !== false) {
                return file_put_contents($outputPath, $compressed) !== false;
            }
            
            return false;
        } catch (\Exception $e) {
            Log::warning('General file compression failed', ['error' => $e->getMessage()]);
            return false;
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
                // Try alternative PDF optimization using basic file compression
                return $this->compressPDFBasic($inputPath, $outputPath);
            }

            // Ghostscript command for PDF optimization
            $command = sprintf(
                'gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="%s" "%s"',
                escapeshellarg($outputPath),
                escapeshellarg($inputPath)
            );

            $output = [];
            $returnCode = 0;
            exec($command, $output, $returnCode);

            return $returnCode === 0 && file_exists($outputPath) && filesize($outputPath) > 0;
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
        try {
            // Try different compression methods in order of preference
            
            // 1. Use qpdf if available (best compression)
            if ($this->isQpdfAvailable()) {
                $command = sprintf(
                    'qpdf --linearize --optimize-images --compress-streams=y "%s" "%s"',
                    escapeshellarg($inputPath),
                    escapeshellarg($outputPath)
                );
                
                $output = [];
                $returnCode = 0;
                exec($command, $output, $returnCode);
                
                if ($returnCode === 0 && file_exists($outputPath) && filesize($outputPath) > 0) {
                    return true;
                }
            }
            
            // 2. Use custom PHP PDF compressor
            if (PDFCompressor::compress($inputPath, $outputPath, 0.5)) {
                return true;
            }
            
            // 3. Fallback: Just copy the file
            return copy($inputPath, $outputPath);
        } catch (\Exception $e) {
            Log::warning('Basic PDF compression failed', ['error' => $e->getMessage()]);
            return copy($inputPath, $outputPath);
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
}