<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Document;
use Illuminate\Support\Facades\Storage;
use Imagick;

class GeneratePdfThumbnails extends Command
{
    protected $signature = 'pdf:generate-thumbnails {--force : Force regenerate existing thumbnails}';
    protected $description = 'Generate thumbnails for PDF documents';

    public function handle()
    {
        $force = $this->option('force');
        
        // Get all PDF documents without thumbnails (or all if force)
        $query = Document::where('doc_filename', 'like', '%.pdf');
        
        if (!$force) {
            $query->whereNull('thumbnail_path');
        }
        
        $documents = $query->get();
        
        if ($documents->isEmpty()) {
            $this->info('No documents need thumbnail generation.');
            return;
        }
        
        $this->info("Generating thumbnails for {$documents->count()} documents...");
        
        $bar = $this->output->createProgressBar($documents->count());
        $bar->start();
        
        foreach ($documents as $document) {
            try {
                $this->generateThumbnail($document);
                $bar->advance();
            } catch (\Exception $e) {
                $this->error("\nFailed to generate thumbnail for {$document->doc_filename}: " . $e->getMessage());
            }
        }
        
        $bar->finish();
        $this->info("\nThumbnail generation completed!");
    }
    
    private function generateThumbnail(Document $document)
    {
        // Check if Imagick extension is available
        if (!extension_loaded('imagick')) {
            throw new \Exception('Imagick extension is not installed');
        }
        
        $pdfPath = storage_path("app/public/documents/{$document->doc_filename}");
        
        if (!file_exists($pdfPath)) {
            throw new \Exception("PDF file not found: {$pdfPath}");
        }
        
        $thumbnailFilename = pathinfo($document->doc_filename, PATHINFO_FILENAME) . '_thumb.jpg';
        $thumbnailPath = storage_path("app/public/documents/thumbnails/{$thumbnailFilename}");
        
        // Create thumbnails directory if it doesn't exist
        $thumbnailDir = dirname($thumbnailPath);
        if (!is_dir($thumbnailDir)) {
            mkdir($thumbnailDir, 0755, true);
        }
        
        // Generate thumbnail using Imagick
        $imagick = new Imagick();
        $imagick->setResolution(72, 72); // Set resolution before reading
        $imagick->readImage($pdfPath . '[0]'); // Read first page only
        $imagick->setImageFormat('jpeg');
        $imagick->setImageCompressionQuality(80);
        $imagick->thumbnailImage(200, 300, true); // Generate 200x300 thumbnail
        $imagick->writeImage($thumbnailPath);
        $imagick->clear();
        
        // Update document record with thumbnail path
        $document->update([
            'thumbnail_path' => "documents/thumbnails/{$thumbnailFilename}"
        ]);
    }
}
