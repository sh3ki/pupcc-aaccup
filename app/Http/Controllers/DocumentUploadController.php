<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Document;
use App\Models\SpecialDocument;
use App\Models\Area;
use App\Models\Parameter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentUploadController extends Controller
{
    /**
     * Handle document upload for any role (faculty, reviewer, etc.)
     */
    public function upload(Request $request)
    {
        // Check if this is a special parameter (PPP or Self-Survey)
        $parameter = null;
        $isSpecialParameter = false;
        
        if ($request->has('parameter_id') && $request->parameter_id) {
            $parameter = Parameter::find($request->parameter_id);
            $isSpecialParameter = $parameter && in_array($parameter->name, ['PPP', 'Self-Survey']);
        }

        // Dynamic validation rules based on parameter type
        $validationRules = [
            'program_id' => 'required|exists:programs,id',
            'area_id' => 'required|exists:areas,id',
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png',
            'video' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/avi,video/mpeg,video/webm',
        ];

        // Parameter is always required now
        $validationRules['parameter_id'] = 'required|exists:parameters,id';
        
        // Category validation only for regular parameters (not PPP/Self-Survey)
        if (!$isSpecialParameter) {
            $validationRules['category'] = 'required|in:system,implementation,outcomes';
        }

        $request->validate($validationRules);

        $user = $request->user();

        if ($isSpecialParameter) {
            // Handle special documents (PPP or Self-Survey)
            return $this->handleSpecialDocumentUpload($request, $user, $parameter);
        } else {
            // Handle regular documents
            return $this->handleRegularDocumentUpload($request, $user);
        }
    }

    /**
     * Handle upload for special parameters (PPP or Self-Survey)
     */
    private function handleSpecialDocumentUpload(Request $request, $user, $parameter)
    {
        $records = [];
        $category = strtolower($parameter->name) === 'ppp' ? 'ppp' : 'self-survey';
        $folderPath = $category === 'ppp' ? 'documents/ppp' : 'documents/self-survey';

        // Handle document file (always required)
        $file = $request->file('file');
        $filename = Str::random(16) . '_' . time() . '.' . $file->getClientOriginalExtension();
        $file->storeAs($folderPath, $filename, 'public');
        
        $document = SpecialDocument::create([
            'user_id' => $user->id,
            'program_id' => $request->program_id,
            'area_id' => $request->area_id,
            'parameter_id' => $request->parameter_id,
            'category' => $category,
            'doc_filename' => $filename,
            'video_filename' => null,
            'status' => 'pending',
            'checked_by' => null,
        ]);
        
        // Broadcast SpecialDocumentCreated event
        event(new \App\Events\SpecialDocumentCreated($document));
        $records[] = $document;

        // Handle optional video file
        if ($request->hasFile('video')) {
            $video = $request->file('video');
            $videoFilename = Str::random(16) . '_' . time() . '.' . $video->getClientOriginalExtension();
            $video->storeAs($folderPath, $videoFilename, 'public');
            
            // Update the same record with video filename
            $document->update(['video_filename' => $videoFilename]);
        }

        return response()->json([
            'success' => true,
            'message' => ucfirst($category) . ' document uploaded successfully!',
            'documents' => $records
        ]);
    }

    /**
     * Handle upload for regular areas
     */
    private function handleRegularDocumentUpload(Request $request, $user)
    {
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
