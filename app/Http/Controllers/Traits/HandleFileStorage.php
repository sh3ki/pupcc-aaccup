<?php

namespace App\Http\Controllers\Traits;

use Illuminate\Support\Facades\Storage;

trait HandleFileStorage
{
    /**
     * Safely check if a file exists before deleting it
     *
     * @param string|null $filePath
     * @param string $disk
     * @return bool
     */
    protected function safeFileExists($filePath, $disk = 'public'): bool
    {
        return !empty($filePath) && Storage::disk($disk)->exists($filePath);
    }

    /**
     * Safely delete a file if it exists
     *
     * @param string|null $filePath
     * @param string $disk
     * @return bool
     */
    protected function safeFileDelete($filePath, $disk = 'public'): bool
    {
        if ($this->safeFileExists($filePath, $disk)) {
            return Storage::disk($disk)->delete($filePath);
        }
        return true;
    }

    /**
     * Safely get file URL if file exists
     *
     * @param string|null $filePath
     * @param string $disk
     * @return string|null
     */
    protected function safeFileUrl($filePath, $disk = 'public'): ?string
    {
        if ($this->safeFileExists($filePath, $disk)) {
            return Storage::url($filePath);
        }
        return null;
    }
}