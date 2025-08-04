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

        // --- Compute approved document counts for programs, areas, parameters, and categories ---
        // 1. Gather all program/area/parameter IDs assigned to the user
        $programIds = [];
        $areaIds = [];
        $parameterIds = [];
        foreach ($assignments as $assign) {
            if ($assign->program_id) $programIds[] = $assign->program_id;
            if ($assign->area_id) $areaIds[] = $assign->area_id;
        }
        $programIds = array_unique($programIds);
        $areaIds = array_unique($areaIds);

        // 2. Get all approved documents for these programs (for sidebar counts)
        $approvedDocs = \App\Models\Document::where('status', 'approved')
            ->whereIn('program_id', $programIds)
            ->get(['id', 'program_id', 'area_id', 'parameter_id', 'category']);

        // 3. Precompute counts
        $programApprovedCounts = [];
        $areaApprovedCounts = [];
        $parameterApprovedCounts = [];
        $parameterCategoryApprovedCounts = [];

        foreach ($approvedDocs as $doc) {
            // Program count
            if (!isset($programApprovedCounts[$doc->program_id])) $programApprovedCounts[$doc->program_id] = 0;
            $programApprovedCounts[$doc->program_id]++;

            // Area count
            if ($doc->area_id) {
                if (!isset($areaApprovedCounts[$doc->area_id])) $areaApprovedCounts[$doc->area_id] = 0;
                $areaApprovedCounts[$doc->area_id]++;
            }

            // Parameter count
            if ($doc->parameter_id) {
                if (!isset($parameterApprovedCounts[$doc->parameter_id])) $parameterApprovedCounts[$doc->parameter_id] = 0;
                $parameterApprovedCounts[$doc->parameter_id]++;
                // Category count
                if (!isset($parameterCategoryApprovedCounts[$doc->parameter_id])) $parameterCategoryApprovedCounts[$doc->parameter_id] = [];
                if (!isset($parameterCategoryApprovedCounts[$doc->parameter_id][$doc->category])) $parameterCategoryApprovedCounts[$doc->parameter_id][$doc->category] = 0;
                $parameterCategoryApprovedCounts[$doc->parameter_id][$doc->category]++;
            }
        }

        // 4. Build sidebar structure
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
                    'approved_count' => $programApprovedCounts[$program->id] ?? 0, // <-- program-level count
                ];
            }
            if ($area && !collect($sidebar[$programId]['areas'])->contains('id', $area->id)) {
                // Fetch parameters for this area/program
                $parameters = Parameter::where('program_id', $program->id)
                    ->where('area_id', $area->id)
                    ->get(['id', 'name', 'code'])
                    ->map(function ($param) use ($parameterApprovedCounts, $parameterCategoryApprovedCounts) {
                        $paramId = $param->id;
                        $categories = ['system', 'implementation', 'outcomes'];
                        $categoryCounts = [];
                        foreach ($categories as $cat) {
                            $categoryCounts[$cat] = $parameterCategoryApprovedCounts[$paramId][$cat] ?? 0;
                        }
                        $approved_count = $parameterApprovedCounts[$paramId] ?? 0;
                        return [
                            'id' => $param->id,
                            'name' => $param->name,
                            'code' => $param->code,
                            'approved_count' => $approved_count,
                            'category_approved_counts' => $categoryCounts,
                        ];
                    })
                    ->toArray();

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
                    'approved_count' => $areaApprovedCounts[$area->id] ?? 0, // <-- area-level count
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
            // parameter_id and category are optional
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
        $query = Document::where('program_id', $request->program_id)
            ->where('area_id', $request->area_id)
            ->where('status', 'approved');

        // Filter by parameter_id if provided
        if ($request->has('parameter_id')) {
            $query->where('parameter_id', $request->parameter_id);
        }
        // Filter by category if provided
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $documents = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'filename' => $doc->doc_filename,
                    'url' => \Storage::url("documents/{$doc->doc_filename}"),
                    'video_filename' => $doc->video_filename,
                    'video_url' => $doc->video_filename ? \Storage::url("documents/{$doc->video_filename}") : null,
                    'uploaded_at' => $doc->created_at->toDateTimeString(),
                    'user_name' => $doc->user->name ?? '',
                    'parameter_id' => $doc->parameter_id,
                    'category' => $doc->category,
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
            'parameter_id' => 'required|exists:parameters,id',
            'category' => 'required|in:system,implementation,outcomes',
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png|max:20480',
            'video' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/avi,video/mpeg,video/webm|max:51200',
        ]);

        $user = $request->user();
        $file = $request->file('file');
        $filename = \Illuminate\Support\Str::random(16) . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Store document in storage/app/public/documents/
        $file->storeAs("documents/", $filename, 'public');

        // Handle optional video
        $videoFilename = null;
        if ($request->hasFile('video')) {
            $video = $request->file('video');
            $videoFilename = \Illuminate\Support\Str::random(16) . '_' . time() . '.' . $video->getClientOriginalExtension();
            $video->storeAs("documents/", $videoFilename, 'public');
        }

        $document = Document::create([
            'user_id' => $user->id,
            'program_id' => $request->program_id,
            'area_id' => $request->area_id,
            'parameter_id' => $request->parameter_id,
            'doc_filename' => $filename,
            'category' => $request->category,
            'video_filename' => $videoFilename,
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

        // --- Compute pending document counts for programs, areas, parameters, and categories ---
        $programIds = [];
        $areaIds = [];
        foreach ($assignments as $assign) {
            if ($assign->program_id) $programIds[] = $assign->program_id;
            if ($assign->area_id) $areaIds[] = $assign->area_id;
        }
        $programIds = array_unique($programIds);
        $areaIds = array_unique($areaIds);

        // Get all pending documents for these programs (for sidebar counts)
        $pendingDocs = \App\Models\Document::where('status', 'pending')
            ->whereIn('program_id', $programIds)
            ->get(['id', 'program_id', 'area_id', 'parameter_id', 'category']);

        // Precompute counts
        $programPendingCounts = [];
        $areaPendingCounts = [];
        $parameterPendingCounts = [];
        $parameterCategoryPendingCounts = [];

        foreach ($pendingDocs as $doc) {
            // Program count
            if (!isset($programPendingCounts[$doc->program_id])) $programPendingCounts[$doc->program_id] = 0;
            $programPendingCounts[$doc->program_id]++;

            // Area count
            if ($doc->area_id) {
                if (!isset($areaPendingCounts[$doc->area_id])) $areaPendingCounts[$doc->area_id] = 0;
                $areaPendingCounts[$doc->area_id]++;
            }

            // Parameter count
            if ($doc->parameter_id) {
                if (!isset($parameterPendingCounts[$doc->parameter_id])) $parameterPendingCounts[$doc->parameter_id] = 0;
                $parameterPendingCounts[$doc->parameter_id]++;
                // Category count
                if (!isset($parameterCategoryPendingCounts[$doc->parameter_id])) $parameterCategoryPendingCounts[$doc->parameter_id] = [];
                if (!isset($parameterCategoryPendingCounts[$doc->parameter_id][$doc->category])) $parameterCategoryPendingCounts[$doc->parameter_id][$doc->category] = 0;
                $parameterCategoryPendingCounts[$doc->parameter_id][$doc->category]++;
            }
        }

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
                    'pending_count' => $programPendingCounts[$program->id] ?? 0, // program-level pending count
                ];
            }
            if ($area && !collect($sidebar[$programId]['areas'])->contains('id', $area->id)) {
                // Fetch parameters for this area/program
                $parameters = \App\Models\Parameter::where('program_id', $program->id)
                    ->where('area_id', $area->id)
                    ->get(['id', 'name', 'code'])
                    ->map(function ($param) use ($parameterPendingCounts, $parameterCategoryPendingCounts) {
                        $paramId = $param->id;
                        $categories = ['system', 'implementation', 'outcomes'];
                        $categoryCounts = [];
                        foreach ($categories as $cat) {
                            $categoryCounts[$cat] = $parameterCategoryPendingCounts[$paramId][$cat] ?? 0;
                        }
                        $pending_count = $parameterPendingCounts[$paramId] ?? 0;
                        return [
                            'id' => $param->id,
                            'name' => $param->name,
                            'code' => $param->code,
                            'pending_count' => $pending_count,
                            'category_pending_counts' => $categoryCounts,
                        ];
                    })
                    ->toArray();

                $sidebar[$programId]['areas'][] = [
                    'id' => $area->id,
                    'name' => $area->name,
                    'code' => $area->code ?? null,
                    'parameters' => $parameters,
                    'pending_count' => $areaPendingCounts[$area->id] ?? 0, // area-level pending count
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
                        'url' => $doc->doc_filename ? \Storage::url("documents/{$doc->doc_filename}") : null,
                        'video_filename' => $doc->video_filename,
                        'video_url' => $doc->video_filename ? \Storage::url("documents/{$doc->video_filename}") : null,
                        'uploaded_at' => $doc->created_at->toDateTimeString(),
                        'user_name' => $doc->user->name ?? '',
                        'parameter_id' => $doc->parameter_id,
                        'category' => $doc->category,
                        'program_id' => $doc->program_id,
                        'area_id' => $doc->area_id,
                        'program_code' => $doc->program->code ?? '',
                        'area_code' => $doc->area->code ?? '',
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
                'filename' => $doc->doc_filename,
                'url' => $doc->doc_filename ? \Storage::url("documents/{$doc->doc_filename}") : null,
                'video_filename' => $doc->video_filename,
                'video_url' => $doc->video_filename ? \Storage::url("documents/{$doc->video_filename}") : null,
                'uploaded_at' => $doc->created_at->toDateTimeString(),
                'user_name' => $doc->user->name ?? '',
                'parameter_id' => $doc->parameter_id,
                'category' => $doc->category,
                'program_id' => $doc->program_id,
                'area_id' => $doc->area_id,
                'program_code' => $doc->program->code ?? '',
                'area_code' => $doc->area->code ?? '',
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
            'url' => \Storage::url("documents/{$document->doc_filename}"),
            'video_filename' => $document->video_filename,
            'video_url' => $document->video_filename ? \Storage::url("documents/{$document->video_filename}") : null,
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

    public function updateStatus(Request $request, Document $document)
    {
        $user = $request->user();
        $request->validate([
            'status' => 'required|in:approved,disapproved',
        ]);

        // Check if reviewer is assigned to this program/area
        $hasAccess = UserAssign::where('user_id', $user->id)
            ->where('program_id', $document->program_id)
            ->where('area_id', $document->area_id)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['success' => false, 'message' => 'Access denied'], 403);
        }

        if ($document->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Document is not pending.'], 400);
        }

        $document->status = $request->status;
        $document->save();

        return response()->json(['success' => true, 'message' => 'Document status updated.']);
    }

    public function disapprovedPage(Request $request)
    {
        $user = Auth::user();

        // Get all assignments for the user, eager load program and area
        $assignments = UserAssign::with(['program', 'area'])
            ->where('user_id', $user->id)
            ->get();

        // Gather all program/area IDs assigned to the user
        $programIds = [];
        $areaIds = [];
        foreach ($assignments as $assign) {
            if ($assign->program_id) $programIds[] = $assign->program_id;
            if ($assign->area_id) $areaIds[] = $assign->area_id;
        }
        $programIds = array_unique($programIds);
        $areaIds = array_unique($areaIds);

        // Get all disapproved documents for these programs (for sidebar counts)
        $disapprovedDocs = Document::where('status', 'disapproved')
            ->whereIn('program_id', $programIds)
            ->get(['id', 'program_id', 'area_id', 'parameter_id', 'category']);

        // Precompute counts
        $programDisapprovedCounts = [];
        $areaDisapprovedCounts = [];
        $parameterDisapprovedCounts = [];
        $parameterCategoryDisapprovedCounts = [];

        foreach ($disapprovedDocs as $doc) {
            // Program count
            if (!isset($programDisapprovedCounts[$doc->program_id])) $programDisapprovedCounts[$doc->program_id] = 0;
            $programDisapprovedCounts[$doc->program_id]++;

            // Area count
            if ($doc->area_id) {
                if (!isset($areaDisapprovedCounts[$doc->area_id])) $areaDisapprovedCounts[$doc->area_id] = 0;
                $areaDisapprovedCounts[$doc->area_id]++;
            }

            // Parameter count
            if ($doc->parameter_id) {
                if (!isset($parameterDisapprovedCounts[$doc->parameter_id])) $parameterDisapprovedCounts[$doc->parameter_id] = 0;
                $parameterDisapprovedCounts[$doc->parameter_id]++;
                // Category count
                if (!isset($parameterCategoryDisapprovedCounts[$doc->parameter_id])) $parameterCategoryDisapprovedCounts[$doc->parameter_id] = [];
                if (!isset($parameterCategoryDisapprovedCounts[$doc->parameter_id][$doc->category])) $parameterCategoryDisapprovedCounts[$doc->parameter_id][$doc->category] = 0;
                $parameterCategoryDisapprovedCounts[$doc->parameter_id][$doc->category]++;
            }
        }

        // Build sidebar structure
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
                    'disapproved_count' => $programDisapprovedCounts[$program->id] ?? 0,
                ];
            }
            if ($area && !collect($sidebar[$programId]['areas'])->contains('id', $area->id)) {
                $parameters = Parameter::where('program_id', $program->id)
                    ->where('area_id', $area->id)
                    ->get(['id', 'name', 'code'])
                    ->map(function ($param) use ($parameterDisapprovedCounts, $parameterCategoryDisapprovedCounts) {
                        $paramId = $param->id;
                        $categories = ['system', 'implementation', 'outcomes'];
                        $categoryCounts = [];
                        foreach ($categories as $cat) {
                            $categoryCounts[$cat] = $parameterCategoryDisapprovedCounts[$paramId][$cat] ?? 0;
                        }
                        $disapproved_count = $parameterDisapprovedCounts[$paramId] ?? 0;
                        return [
                            'id' => $param->id,
                            'name' => $param->name,
                            'code' => $param->code,
                            'disapproved_count' => $disapproved_count,
                            'category_disapproved_counts' => $categoryCounts,
                        ];
                    })
                    ->toArray();

                $sidebar[$programId]['areas'][] = [
                    'id' => $area->id,
                    'name' => $area->name,
                    'code' => $area->code ?? null,
                    'parameters' => $parameters,
                    'disapproved_count' => $areaDisapprovedCounts[$area->id] ?? 0,
                ];
            }
        }
        $sidebar = array_values($sidebar);

        return Inertia::render('reviewer/documents_disapproved', [
            'sidebar' => $sidebar,
            'csrfToken' => csrf_token(),
        ]);
    }

    public function disapprovedDocuments(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'area_id' => 'required|exists:areas,id',
        ]);

        $user = $request->user();

        // Check if reviewer is assigned to this program/area
        $hasAccess = UserAssign::where('user_id', $user->id)
            ->where('program_id', $request->program_id)
            ->where('area_id', $request->area_id)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['success' => false, 'message' => 'Access denied'], 403);
        }

        $query = Document::where('program_id', $request->program_id)
            ->where('area_id', $request->area_id)
            ->where('status', 'disapproved');

        if ($request->has('parameter_id')) {
            $query->where('parameter_id', $request->parameter_id);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $documents = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'filename' => $doc->doc_filename,
                    'url' => \Storage::url("documents/{$doc->doc_filename}"),
                    'video_filename' => $doc->video_filename,
                    'video_url' => $doc->video_filename ? \Storage::url("documents/{$doc->video_filename}") : null,
                    'uploaded_at' => $doc->created_at->toDateTimeString(),
                    'user_name' => $doc->user->name ?? '',
                    'parameter_id' => $doc->parameter_id,
                    'category' => $doc->category,
                ];
            });

        return response()->json([
            'success' => true,
            'documents' => $documents,
        ]);
    }
}
