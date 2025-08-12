<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Document;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentUploadController extends Controller
{
    /**
     * Handle document upload for any role (faculty, reviewer, etc.)
     */
    public function upload(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'area_id' => 'required|exists:areas,id',
            'parameter_id' => 'required|exists:parameters,id',
            'category' => 'required|in:system,implementation,outcomes',
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png|max:20480',
            'video' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/avi,video/mpeg,video/webm|max:51200',
        ]);

        $user = $request->user();
        $records = [];

        // Handle document file (always required)
        $file = $request->file('file');
        $filename = Str::random(16) . '_' . time() . '.' . $file->getClientOriginalExtension();
        $file->storeAs("documents/", $filename, 'public');
        $document = Document::create([
            'user_id' => $user->id,
            'program_id' => $request->program_id,
            'area_id' => $request->area_id,
            'parameter_id' => $request->parameter_id,
            'doc_filename' => $filename,
            'category' => $request->category,
            'type' => $file->getClientOriginalExtension(),
            'status' => 'pending',
            'checked_by' => null,
        ]);
        
        // Broadcast DocumentCreated event
        event(new \App\Events\DocumentCreated($document));
        $records[] = $document;

        // Handle optional video file (create a separate record if present)
        if ($request->hasFile('video')) {
            $video = $request->file('video');
            $videoFilename = Str::random(16) . '_' . time() . '.' . $video->getClientOriginalExtension();
            $video->storeAs("documents/", $videoFilename, 'public');
            $videoDocument = Document::create([
                'user_id' => $user->id,
                'program_id' => $request->program_id,
                'area_id' => $request->area_id,
                'parameter_id' => $request->parameter_id,
                'doc_filename' => $videoFilename,
                'category' => $request->category,
                'type' => $video->getClientOriginalExtension(),
                'status' => 'pending',
                'checked_by' => null,
            ]);
            
            // Broadcast DocumentCreated event for video
            event(new \App\Events\DocumentCreated($videoDocument));
            $records[] = $videoDocument;
        }

        return response()->json([
            'success' => true,
            'message' => 'Document(s) uploaded successfully!',
            'documents' => $records
        ]);
    }
}
