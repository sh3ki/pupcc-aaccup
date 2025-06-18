<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\UserAssign;
use App\Models\Parameter;
use App\Models\Document;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReviewerDocumentsController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get all assignments for the user, eager load program and area
        $assignments = UserAssign::with(['program', 'area'])
            ->where('user_id', $user->id)
            ->get();

        // Group by program, then list unique areas under each program, and parameters under each area
        $sidebar = [];
        foreach ($assignments as $assign) {
            $program = $assign->program;
            $area = $assign->area;
            if (!$program) continue;

            $programId = $program->id;
            if (!isset($sidebar[$programId])) {
                $sidebar[$programId] = [
                    'id' => $program->id,
                    'name' => $program->name,
                    'code' => $program->code ?? null,
                    'areas' => [],
                ];
            }
            if ($area && !collect($sidebar[$programId]['areas'])->contains('id', $area->id)) {
                // Fetch parameters for this area/program
                $parameters = Parameter::where('program_id', $program->id)
                    ->where('area_id', $area->id)
                    ->get(['id', 'name', 'code'])
                    ->map(function ($param) {
                        return [
                            'id' => $param->id,
                            'name' => $param->name,
                            'code' => $param->code,
                        ];
                    })
                    ->toArray();

                // Count pending documents for this area/program
                $pendingCount = \App\Models\Document::where('program_id', $program->id)
                    ->where('area_id', $area->id)
                    ->where('status', 'pending')
                    ->count();

                $sidebar[$programId]['areas'][] = [
                    'id' => $area->id,
                    'name' => $area->name,
                    'code' => $area->code ?? null,
                    'parameters' => $parameters,
                    'pending_count' => $pendingCount,
                ];
            }
        }
        $sidebar = array_values($sidebar);

        return Inertia::render('reviewer/documents_approved', [
            'sidebar' => $sidebar,
            'csrfToken' => csrf_token(),
        ]);
    }

    public function approvedDocuments(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'area_id' => 'required|exists:areas,id',
        ]);

        $user = $request->user();

        // Check if reviewer is assigned to this program/area
        $hasAccess = \App\Models\UserAssign::where('user_id', $user->id)
            ->where('program_id', $request->program_id)
            ->where('area_id', $request->area_id)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['success' => false, 'message' => 'Access denied'], 403);
        }

        // Fetch ALL approved documents for this program and area (not just by reviewer)
        $documents = Document::where('program_id', $request->program_id)
            ->where('area_id', $request->area_id)
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'filename' => $doc->doc_filename,
                    'url' => \Storage::url("documents/{$doc->user_id}/{$doc->doc_filename}"),
                    'uploaded_at' => $doc->created_at->toDateTimeString(),
                    'user_name' => $doc->user->name ?? '',
                ];
            });

        return response()->json([
            'success' => true,
            'documents' => $documents,
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'area_id' => 'required|exists:areas,id',
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png|max:20480',
        ]);

        $user = $request->user();
        $file = $request->file('file');
        $filename = Str::random(16) . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Store in storage/app/public/documents/{user_id}/
        $file->storeAs("documents/{$user->id}", $filename, 'public');

        $document = Document::create([
            'user_id' => $user->id,
            'program_id' => $request->program_id,
            'area_id' => $request->area_id,
            'doc_filename' => $filename, // only filename saved
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully!',
            'document' => $document
        ]);
    }

    // Add this new method specifically for rendering the page
    public function pendingPage(Request $request)
    {
        $user = $request->user();

        // Get all assignments for the reviewer
        $assignments = \App\Models\UserAssign::with(['program', 'area'])
            ->where('user_id', $user->id)
            ->get();

        // Build sidebar data
        $sidebar = [];
        foreach ($assignments as $assign) {
            $program = $assign->program;
            $area = $assign->area;
            if (!$program) continue;

            $programId = $program->id;
            if (!isset($sidebar[$programId])) {
                $sidebar[$programId] = [
                    'id' => $program->id,
                    'name' => $program->name,
                    'code' => $program->code ?? null,
                    'areas' => [],
                ];
            }
            if ($area && !collect($sidebar[$programId]['areas'])->contains('id', $area->id)) {
                // Fetch parameters for this area/program
                $parameters = \App\Models\Parameter::where('program_id', $program->id)
                    ->where('area_id', $area->id)
                    ->get(['id', 'name', 'code'])
                    ->map(function ($param) {
                        return [
                            'id' => $param->id,
                            'name' => $param->name,
                            'code' => $param->code,
                        ];
                    })
                    ->toArray();

                // Count pending documents for this area/program
                $pendingCount = \App\Models\Document::where('program_id', $program->id)
                    ->where('area_id', $area->id)
                    ->where('status', 'pending')
                    ->count();

                $sidebar[$programId]['areas'][] = [
                    'id' => $area->id,
                    'name' => $area->name,
                    'code' => $area->code ?? null,
                    'parameters' => $parameters,
                    'pending_count' => $pendingCount,
                ];
            }
        }
        $sidebar = array_values($sidebar);

        // Always render the Inertia page
        return Inertia::render('reviewer/documents_pending', [
            'sidebar' => $sidebar,
            'csrfToken' => csrf_token(),
        ]);
    }

    // Modify this method to only handle the data requests
    public function pendingDocuments(Request $request)
    {
        $user = $request->user();
        
        // Fetch area-specific documents if program_id and area_id are provided
        if ($request->has('program_id') && $request->has('area_id')) {
            $program_id = $request->input('program_id');
            $area_id = $request->input('area_id');

            // Check if reviewer is assigned to this program/area
            $hasAccess = \App\Models\UserAssign::where('user_id', $user->id)
                ->where('program_id', $program_id)
                ->where('area_id', $area_id)
                ->exists();

            if (!$hasAccess) {
                return response()->json(['success' => false, 'message' => 'Access denied'], 403);
            }

            $documents = \App\Models\Document::where('status', 'pending')
                ->where('program_id', $program_id)
                ->where('area_id', $area_id)
                ->with(['user:id,name', 'program:id,code', 'area:id,code'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'filename' => $doc->doc_filename,
                        'url' => \Storage::url("documents/{$doc->user_id}/{$doc->doc_filename}"),
                        'uploaded_at' => $doc->created_at->toDateTimeString(),
                        'user_name' => $doc->user->name ?? '',
                    ];
                });

            return response()->json([
                'success' => true,
                'documents' => $documents,
            ]);
        }

        // Fetch all pending documents for modal table
        $assignments = \App\Models\UserAssign::with(['program', 'area'])
            ->where('user_id', $user->id)
            ->get();
            
        $programAreaPairs = $assignments->map(function ($assign) {
            return [
                'program_id' => $assign->program_id,
                'area_id' => $assign->area_id,
            ];
        });

        $query = \App\Models\Document::query()
            ->where('status', 'pending')
            ->with(['user:id,name', 'program:id,code', 'area:id,code']);

        $query->where(function ($q) use ($programAreaPairs) {
            foreach ($programAreaPairs as $pair) {
                $q->orWhere(function ($sub) use ($pair) {
                    $sub->where('program_id', $pair['program_id'])
                        ->where('area_id', $pair['area_id']);
                });
            }
        });

        $documents = $query->orderBy('created_at', 'desc')->get()->map(function ($doc) {
            return [
                'id' => $doc->id,
                'user_name' => $doc->user->name ?? '',
                'program_code' => $doc->program->code ?? '',
                'area_code' => $doc->area->code ?? '',
                'uploaded_at' => $doc->created_at->toDateTimeString(),
            ];
        });

        return response()->json([
            'success' => true,
            'documents' => $documents,
        ]);
    }

    public function viewPendingDocument(Request $request, Document $document)
    {
        $user = $request->user();

        // Check if reviewer is assigned to this program/area
        $hasAccess = UserAssign::where('user_id', $user->id)
            ->where('program_id', $document->program_id)
            ->where('area_id', $document->area_id)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['success' => false, 'message' => 'Access denied'], 403);
        }

        $documentData = [
            'id' => $document->id,
            'filename' => $document->doc_filename,
            'url' => \Storage::url("documents/{$document->user_id}/{$document->doc_filename}"),
            'uploaded_at' => $document->created_at->toDateTimeString(),
            'user_name' => $document->user->name ?? '',
            'program_id' => $document->program_id,
            'area_id' => $document->area_id,
        ];

        return response()->json([
            'success' => true,
            'document' => $documentData,
        ]);
    }
}
