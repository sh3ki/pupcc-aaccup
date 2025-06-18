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

class FacultyDocumentsController extends Controller
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

                $sidebar[$programId]['areas'][] = [
                    'id' => $area->id,
                    'name' => $area->name,
                    'code' => $area->code ?? null,
                    'parameters' => $parameters,
                ];
            }
        }
        $sidebar = array_values($sidebar);

        return Inertia::render('faculty/documents_approved', [
            'sidebar' => $sidebar,
            'csrfToken' => csrf_token(),
        ]);
    }

    // New: Fetch approved documents for a program+area (AJAX)
    public function approvedDocuments(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'area_id' => 'required|exists:areas,id',
        ]);

        $user = $request->user();

        // Only show approved documents for this user, program, and area
        $documents = Document::where('user_id', $user->id)
            ->where('program_id', $request->program_id)
            ->where('area_id', $request->area_id)
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($doc) use ($user) {
                return [
                    'id' => $doc->id,
                    'filename' => $doc->doc_filename,
                    'url' => \Storage::url("documents/{$user->id}/{$doc->doc_filename}"),
                    'uploaded_at' => $doc->created_at->toDateTimeString(),
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
}
