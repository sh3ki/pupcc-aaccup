<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\UserAssign;
use App\Models\Parameter;
use App\Models\Document;
use App\Models\SpecialDocument;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FacultyDocumentsController extends Controller
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
        // Include both regular documents and special documents (PPP/Self-Survey)
        $approvedDocs = \App\Models\Document::where('status', 'approved')
            ->whereIn('program_id', $programIds)
            ->get(['id', 'program_id', 'area_id', 'parameter_id', 'category']);

        $specialApprovedDocs = \App\Models\SpecialDocument::where('status', 'approved')
            ->whereIn('program_id', $programIds)
            ->get(['id', 'program_id', 'area_id', 'parameter_id', 'category']);

        // 3. Precompute counts
        $programApprovedCounts = [];
        $areaApprovedCounts = [];
        $parameterApprovedCounts = [];
        $parameterCategoryApprovedCounts = [];

        // Count regular documents
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

        // Count special documents (PPP/Self-Survey)
        foreach ($specialApprovedDocs as $doc) {
            // Program count
            if (!isset($programApprovedCounts[$doc->program_id])) $programApprovedCounts[$doc->program_id] = 0;
            $programApprovedCounts[$doc->program_id]++;

            // Area count
            if ($doc->area_id) {
                if (!isset($areaApprovedCounts[$doc->area_id])) $areaApprovedCounts[$doc->area_id] = 0;
                $areaApprovedCounts[$doc->area_id]++;
            }

            // Parameter count (special docs don't have category breakdowns)
            if ($doc->parameter_id) {
                if (!isset($parameterApprovedCounts[$doc->parameter_id])) $parameterApprovedCounts[$doc->parameter_id] = 0;
                $parameterApprovedCounts[$doc->parameter_id]++;
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

        return Inertia::render('faculty/documents_approved', [
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

        // Check if faculty is assigned to this program/area
        $hasAccess = UserAssign::where('user_id', $user->id)
            ->where('program_id', $request->program_id)
            ->where('area_id', $request->area_id)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['success' => false, 'message' => 'Access denied'], 403);
        }

        // Check if this is a special parameter (PPP or Self-Survey)
        $isSpecialParameter = false;
        if ($request->has('parameter_id')) {
            $parameter = Parameter::find($request->parameter_id);
            $isSpecialParameter = $parameter && in_array($parameter->name, ['PPP', 'Self-Survey']);
        }

        if ($isSpecialParameter) {
            // Fetch from special_documents table
            $query = SpecialDocument::where('program_id', $request->program_id)
                ->where('area_id', $request->area_id)
                ->where('status', 'approved')
                ->with(['user:id,name', 'checkedBy:id,name']);

            if ($request->has('parameter_id')) {
                $query->where('parameter_id', $request->parameter_id);
            }

            $documents = $query->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($doc) use ($parameter) {
                    $folderPath = strtolower($parameter->name) === 'ppp' ? 'documents/ppp' : 'documents/self-survey';
                    
                    return [
                        'id' => $doc->id,
                        'filename' => $doc->doc_filename,
                        'url' => Storage::url("{$folderPath}/{$doc->doc_filename}"),
                        'video_filename' => null,
                        'video_url' => null,
                        'uploaded_at' => $doc->created_at->toDateTimeString(),
                        'user_name' => $doc->user->name ?? '',
                        'approved_at' => $doc->updated_at ? $doc->updated_at->toDateTimeString() : null,
                        'approved_by' => $doc->checkedBy->name ?? null,
                        'parameter_id' => $doc->parameter_id,
                        'category' => $doc->category,
                    ];
                });
        } else {
            // Fetch regular documents
            $query = Document::where('program_id', $request->program_id)
                ->where('area_id', $request->area_id)
                ->where('status', 'approved')
                ->with(['user:id,name', 'checker:id,name']);

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
                        'url' => Storage::url("documents/{$doc->doc_filename}"),
                        'video_filename' => $doc->video_filename,
                        'video_url' => $doc->video_filename ? Storage::url("documents/{$doc->video_filename}") : null,
                        'uploaded_at' => $doc->created_at->toDateTimeString(),
                        'user_name' => $doc->user->name ?? '',
                        'approved_at' => $doc->updated_at ? $doc->updated_at->toDateTimeString() : null,
                        'approved_by' => $doc->checker->name ?? null,
                        'parameter_id' => $doc->parameter_id,
                        'category' => $doc->category,
                    ];
                });
        }

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
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png',
            'video' => 'nullable|file|mimes:mp4,mov,avi,wmv,mpeg,webm',
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

        // Broadcast DocumentCreated event
        event(new \App\Events\DocumentCreated($document));

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

        // Get all assignments for the faculty
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
        // Include both regular documents and special documents (PPP/Self-Survey)
        $pendingDocs = \App\Models\Document::where('status', 'pending')
            ->whereIn('program_id', $programIds)
            ->where('user_id', $user->id)
            ->get(['id', 'program_id', 'area_id', 'parameter_id', 'category']);

        $specialPendingDocs = \App\Models\SpecialDocument::where('status', 'pending')
            ->whereIn('program_id', $programIds)
            ->where('user_id', $user->id)
            ->get(['id', 'program_id', 'area_id', 'parameter_id', 'category']);

        // Precompute counts
        $programPendingCounts = [];
        $areaPendingCounts = [];
        $parameterPendingCounts = [];
        $parameterCategoryPendingCounts = [];

        // Count regular documents
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

        // Count special documents (PPP/Self-Survey)
        foreach ($specialPendingDocs as $doc) {
            // Program count
            if (!isset($programPendingCounts[$doc->program_id])) $programPendingCounts[$doc->program_id] = 0;
            $programPendingCounts[$doc->program_id]++;

            // Area count
            if ($doc->area_id) {
                if (!isset($areaPendingCounts[$doc->area_id])) $areaPendingCounts[$doc->area_id] = 0;
                $areaPendingCounts[$doc->area_id]++;
            }

            // Parameter count (PPP/Self-Survey don't have categories, so just count the parameter)
            if ($doc->parameter_id) {
                if (!isset($parameterPendingCounts[$doc->parameter_id])) $parameterPendingCounts[$doc->parameter_id] = 0;
                $parameterPendingCounts[$doc->parameter_id]++;
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
        return Inertia::render('faculty/documents_pending', [
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

            // Check if faculty is assigned to this program/area
            $hasAccess = \App\Models\UserAssign::where('user_id', $user->id)
                ->where('program_id', $program_id)
                ->where('area_id', $area_id)
                ->exists();

            if (!$hasAccess) {
                return response()->json(['success' => false, 'message' => 'Access denied'], 403);
            }

            // Check if this is a special parameter (PPP or Self-Survey)
            $parameter = null;
            if ($request->has('parameter_id')) {
                $parameter = Parameter::find($request->parameter_id);
            }

            $isSpecialParameter = $parameter && in_array($parameter->name, ['PPP', 'Self-Survey']);

            if ($isSpecialParameter) {
                // Query special_documents table for PPP/Self-Survey
                $documents = \App\Models\SpecialDocument::where('status', 'pending')
                    ->where('program_id', $program_id)
                    ->where('area_id', $area_id)
                    ->where('parameter_id', $request->parameter_id)
                    ->where('user_id', $user->id)
                    ->with(['user:id,name', 'program:id,code', 'area:id,code'])
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($doc) use ($user, $parameter) {
                        $folder = strtolower($parameter->name); // 'ppp' or 'self-survey'
                        return [
                            'id' => $doc->id,
                            'filename' => $doc->doc_filename,
                            'url' => $doc->doc_filename ? Storage::url("documents/{$folder}/{$doc->doc_filename}") : null,
                            'video_filename' => $doc->video_filename,
                            'video_url' => $doc->video_filename ? Storage::url("documents/{$folder}/{$doc->video_filename}") : null,
                            'uploaded_at' => $doc->created_at->toDateTimeString(),
                            'user_name' => $doc->user->name ?? '',
                            'parameter_id' => $doc->parameter_id,
                            'category' => $doc->category,
                            'program_id' => $doc->program_id,
                            'area_id' => $doc->area_id,
                            'program_code' => $doc->program->code ?? '',
                            'area_code' => $doc->area->code ?? '',
                            'can_delete' => true, // Faculty can always delete their own pending docs
                        ];
                    });
            } else {
                // Query regular documents table
                $documents = \App\Models\Document::where('status', 'pending')
                    ->where('program_id', $program_id)
                    ->where('area_id', $area_id)
                    ->where('user_id', $user->id)
                    ->with(['user:id,name', 'program:id,code', 'area:id,code'])
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($doc) use ($user) {
                        return [
                            'id' => $doc->id,
                            'filename' => $doc->doc_filename,
                            'url' => $doc->doc_filename ? Storage::url("documents/{$doc->doc_filename}") : null,
                            'video_filename' => $doc->video_filename,
                            'video_url' => $doc->video_filename ? Storage::url("documents/{$doc->video_filename}") : null,
                            'uploaded_at' => $doc->created_at->toDateTimeString(),
                            'user_name' => $doc->user->name ?? '',
                            'parameter_id' => $doc->parameter_id,
                            'category' => $doc->category,
                            'program_id' => $doc->program_id,
                            'area_id' => $doc->area_id,
                            'program_code' => $doc->program->code ?? '',
                            'area_code' => $doc->area->code ?? '',
                            'can_delete' => true, // Faculty can always delete their own pending docs
                        ];
                    });
            }

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
            ->where('user_id', $user->id)
            ->with(['user:id,name', 'program:id,code', 'area:id,code']);

        $query->where(function ($q) use ($programAreaPairs) {
            foreach ($programAreaPairs as $pair) {
                $q->orWhere(function ($sub) use ($pair) {
                    $sub->where('program_id', $pair['program_id'])
                        ->where('area_id', $pair['area_id']);
                });
            }
        });

        // Add pagination with 5 documents per page
        $perPage = 5;
        $page = $request->input('page', 1);
        $total = $query->count();
        $totalPages = ceil($total / $perPage);
        
    $documents = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
        ->get()
        ->map(function ($doc) use ($user) {
                return [
                    'id' => $doc->id,
                    'filename' => $doc->doc_filename,
            'url' => $doc->doc_filename ? Storage::url("documents/{$doc->doc_filename}") : null,
                    'video_filename' => $doc->video_filename,
            'video_url' => $doc->video_filename ? Storage::url("documents/{$doc->video_filename}") : null,
                    'uploaded_at' => $doc->created_at->toDateTimeString(),
                    'user_name' => $doc->user->name ?? '',
                    'parameter_id' => $doc->parameter_id,
                    'category' => $doc->category,
                    'program_id' => $doc->program_id,
                    'area_id' => $doc->area_id,
                    'program_code' => $doc->program->code ?? '',
                    'area_code' => $doc->area->code ?? '',
            'can_delete' => $doc->user_id === $user->id,
                ];
            });

        return response()->json([
            'success' => true,
            'documents' => $documents,
            'pagination' => [
                'current_page' => (int) $page,
                'total_pages' => $totalPages,
                'per_page' => $perPage,
                'total' => $total,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1,
            ],
        ]);
    }

    // Add this method to provide fresh sidebar data for real-time updates
    public function pendingSidebar(Request $request)
    {
        $user = $request->user();

        // Get all assignments for the faculty
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

        // Get all pending documents for these programs (for sidebar counts) - only for current user
        $pendingDocs = \App\Models\Document::where('status', 'pending')
            ->whereIn('program_id', $programIds)
            ->where('user_id', $user->id)
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

                // Category count within this parameter
                $key = $doc->parameter_id . '-' . $doc->category;
                if (!isset($parameterCategoryPendingCounts[$key])) $parameterCategoryPendingCounts[$key] = 0;
                $parameterCategoryPendingCounts[$key]++;
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
                    'pending_count' => $programPendingCounts[$programId] ?? 0,
                ];
            }

            if ($area && !collect($sidebar[$programId]['areas'])->contains('id', $area->id)) {
                $parameters = \App\Models\Parameter::where('program_id', $program->id)
                    ->where('area_id', $area->id)
                    ->get()
                    ->map(function ($param) use ($parameterPendingCounts, $parameterCategoryPendingCounts) {
                        $paramId = $param->id;
                        $categoryCounts = [
                            'system' => $parameterCategoryPendingCounts[$paramId . '-system'] ?? 0,
                            'implementation' => $parameterCategoryPendingCounts[$paramId . '-implementation'] ?? 0,
                            'outcomes' => $parameterCategoryPendingCounts[$paramId . '-outcomes'] ?? 0,
                        ];
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

        return response()->json([
            'success' => true,
            'sidebar' => $sidebar,
        ]);
    }

    public function viewPendingDocument(Request $request, Document $document)
    {
        $user = $request->user();

        // Check if faculty is assigned to this program/area
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
            'url' => Storage::url("documents/{$document->doc_filename}"),
            'video_filename' => $document->video_filename,
            'video_url' => $document->video_filename ? Storage::url("documents/{$document->video_filename}") : null,
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
            'comment' => 'nullable|string',
        ]);

        // Check if faculty is assigned to this program/area
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
        // Save comment only when disapproved, otherwise clear it
        if ($request->status === 'disapproved') {
            $document->comment = $request->input('comment'); // can be null or string
        } else {
            $document->comment = null;
        }
        // Track faculty who checked
        $document->checked_by = $user->id;
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

        // Get all disapproved documents for these programs (for sidebar counts) - only for current user
        // Include both regular documents and special documents (PPP/Self-Survey)
        $disapprovedDocs = Document::where('status', 'disapproved')
            ->whereIn('program_id', $programIds)
            ->where('user_id', $user->id)
            ->get(['id', 'program_id', 'area_id', 'parameter_id', 'category']);

        $specialDisapprovedDocs = SpecialDocument::where('status', 'disapproved')
            ->whereIn('program_id', $programIds)
            ->where('user_id', $user->id)
            ->get(['id', 'program_id', 'area_id', 'parameter_id', 'category']);

        // Precompute counts
        $programDisapprovedCounts = [];
        $areaDisapprovedCounts = [];
        $parameterDisapprovedCounts = [];
        $parameterCategoryDisapprovedCounts = [];

        // Count regular documents
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

        // Count special documents (PPP/Self-Survey)
        foreach ($specialDisapprovedDocs as $doc) {
            // Program count
            if (!isset($programDisapprovedCounts[$doc->program_id])) $programDisapprovedCounts[$doc->program_id] = 0;
            $programDisapprovedCounts[$doc->program_id]++;

            // Area count
            if ($doc->area_id) {
                if (!isset($areaDisapprovedCounts[$doc->area_id])) $areaDisapprovedCounts[$doc->area_id] = 0;
                $areaDisapprovedCounts[$doc->area_id]++;
            }

            // Parameter count (PPP/Self-Survey don't have categories, so just count the parameter)
            if ($doc->parameter_id) {
                if (!isset($parameterDisapprovedCounts[$doc->parameter_id])) $parameterDisapprovedCounts[$doc->parameter_id] = 0;
                $parameterDisapprovedCounts[$doc->parameter_id]++;
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

        return Inertia::render('faculty/documents_disapproved', [
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

        // Check if faculty is assigned to this program/area
        $hasAccess = UserAssign::where('user_id', $user->id)
            ->where('program_id', $request->program_id)
            ->where('area_id', $request->area_id)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['success' => false, 'message' => 'Access denied'], 403);
        }

        // Check if this is a special parameter (PPP or Self-Survey)
        $parameter = null;
        if ($request->has('parameter_id')) {
            $parameter = Parameter::find($request->parameter_id);
        }

        $isSpecialParameter = $parameter && in_array($parameter->name, ['PPP', 'Self-Survey']);

        if ($isSpecialParameter) {
            // Query special_documents table for PPP/Self-Survey
            $query = SpecialDocument::where('program_id', $request->program_id)
                ->where('area_id', $request->area_id)
                ->where('status', 'disapproved')
                ->where('user_id', $user->id)
                ->with(['user', 'checker']);

            if ($request->has('parameter_id')) {
                $query->where('parameter_id', $request->parameter_id);
            }

            $documents = $query->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($doc) use ($parameter) {
                    // Determine folder based on parameter name
                    $folder = strtolower($parameter->name); // 'ppp' or 'self-survey'
                    return [
                        'id' => $doc->id,
                        'filename' => $doc->doc_filename,
                        'url' => Storage::url("documents/{$folder}/{$doc->doc_filename}"),
                        'video_filename' => $doc->video_filename,
                        'video_url' => $doc->video_filename ? Storage::url("documents/{$folder}/{$doc->video_filename}") : null,
                        'uploaded_at' => optional($doc->created_at)->toDateTimeString(),
                        'user_name' => optional($doc->user)->name ?? '',
                        'disapproved_by' => optional($doc->checker)->name,
                        'disapproved_at' => optional($doc->updated_at)->toDateTimeString(),
                        'comment' => $doc->comment,
                        'parameter_id' => $doc->parameter_id,
                        'category' => $doc->category,
                    ];
                });
        } else {
            // Query regular documents table
            $query = Document::where('program_id', $request->program_id)
                ->where('area_id', $request->area_id)
                ->where('status', 'disapproved')
                ->where('user_id', $user->id)
                ->with(['user', 'checker']);

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
                        'url' => Storage::url("documents/{$doc->doc_filename}"),
                        'video_filename' => $doc->video_filename,
                        'video_url' => $doc->video_filename ? Storage::url("documents/{$doc->video_filename}") : null,
                        'uploaded_at' => optional($doc->created_at)->toDateTimeString(),
                        'user_name' => optional($doc->user)->name ?? '',
                        'disapproved_by' => optional($doc->checker)->name,
                        'disapproved_at' => optional($doc->updated_at)->toDateTimeString(),
                        'comment' => $doc->comment,
                        'parameter_id' => $doc->parameter_id,
                        'category' => $doc->category,
                    ];
                });
        }

        return response()->json([
            'success' => true,
            'documents' => $documents,
        ]);
    }
    /**
     * Delete a pending document by ID - only if current user is the uploader
     */
    public function destroyPending(Request $request, Document $document)
    {
        $user = $request->user();

        if ($document->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Only pending documents can be deleted.'], 400);
        }

        if ($document->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'You can only delete your own uploads.'], 403);
        }

        // Delete files from storage (document and optional video)
        if ($document->doc_filename && Storage::disk('public')->exists('documents/' . $document->doc_filename)) {
            Storage::disk('public')->delete('documents/' . $document->doc_filename);
        }
        if ($document->video_filename && Storage::disk('public')->exists('documents/' . $document->video_filename)) {
            Storage::disk('public')->delete('documents/' . $document->video_filename);
        }

        $document->delete();

        // Broadcast an update so UIs can refresh (reuse existing event)
        event(new \App\Events\DocumentUpdated($document));

        return response()->json(['success' => true, 'message' => 'Document deleted successfully.']);
    }

    /**
     * Get dashboard statistics and recent activities for faculty
     */
    public function dashboardData(Request $request)
    {
        $user = $request->user();

        // Get all assignments for the faculty
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

        // Calculate statistics
        $totalDocuments = Document::where('user_id', $user->id)->count();
        $pendingDocuments = Document::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();
        $approvedDocuments = Document::where('user_id', $user->id)
            ->where('status', 'approved')
            ->count();
        $disapprovedDocuments = Document::where('user_id', $user->id)
            ->where('status', 'disapproved')
            ->count();

        // Count unread messages (assuming you have a messaging system)
        $unreadMessages = 0; // Placeholder - implement based on your messaging system

        // Count assigned programs
        $assignedPrograms = count($programIds);

        // Get recent activities (last 10 activities)
        $recentDocuments = Document::where('user_id', $user->id)
            ->with(['program:id,name,code', 'area:id,name,code', 'parameter:id,name,code'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentActivities = [];
        foreach ($recentDocuments as $doc) {
            $activity = [
                'id' => $doc->id,
                'timestamp' => $doc->created_at->toISOString(),
                'programName' => $doc->program->name ?? 'Unknown Program',
                'areaName' => $doc->area->name ?? 'Unknown Area',
            ];

            if ($doc->status === 'pending') {
                $activity['type'] = 'document_uploaded';
                $activity['title'] = 'Document uploaded';
                $activity['description'] = 'Document uploaded to ' . ($doc->program->name ?? 'Unknown Program');
            } elseif ($doc->status === 'approved') {
                $activity['type'] = 'document_approved';
                $activity['title'] = 'Document approved';
                $activity['description'] = 'Your document was approved for ' . ($doc->program->name ?? 'Unknown Program');
            } elseif ($doc->status === 'disapproved') {
                $activity['type'] = 'document_disapproved';
                $activity['title'] = 'Document needs revision';
                $activity['description'] = 'Document was returned for revision in ' . ($doc->program->name ?? 'Unknown Program');
            }

            $recentActivities[] = $activity;
        }

        $stats = [
            'totalDocuments' => $totalDocuments,
            'pendingDocuments' => $pendingDocuments,
            'approvedDocuments' => $approvedDocuments,
            'disapprovedDocuments' => $disapprovedDocuments,
            'unreadMessages' => $unreadMessages,
            'assignedPrograms' => $assignedPrograms,
        ];

        return response()->json([
            'stats' => $stats,
            'recentActivities' => $recentActivities,
        ]);
    }
}
