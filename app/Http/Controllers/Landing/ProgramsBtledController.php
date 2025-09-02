<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ProgramsBtled;
use App\Models\Program;
use App\Models\Area;
use App\Models\Parameter;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProgramsBtledController extends Controller
{
    /**
     * Display the admin layout BTLED Program Page
     */
    public function index()
    {
        $content = ProgramsBtled::getContent();
        
        return Inertia::render('admin/layout/ProgramsBTLED', [
            'btledContent' => $content
        ]);
    }

    /**
     * Get BTLED content for API
     */
    public function getContent()
    {
        $content = ProgramsBtled::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform program image
        if ($transformedContent['program_image'] && !str_starts_with($transformedContent['program_image'], 'http')) {
            $transformedContent['program_image'] = Storage::url($transformedContent['program_image']);
        }
        
        // Transform action images
        if ($transformedContent['action_images']) {
            foreach ($transformedContent['action_images'] as &$image) {
                if ($image && !str_starts_with($image, 'http')) {
                    $image = Storage::url($image);
                }
            }
        }
        
        // Transform graduate videos
        if ($transformedContent['graduates_data']) {
            foreach ($transformedContent['graduates_data'] as &$graduate) {
                if ($graduate['video'] && $graduate['video_type'] === 'upload' && !str_starts_with($graduate['video'], 'http')) {
                    $graduate['video'] = Storage::url($graduate['video']);
                }
            }
        }
        
        // Transform accreditation area images
        if ($transformedContent['accreditation_areas']) {
            foreach ($transformedContent['accreditation_areas'] as &$area) {
                if ($area['image'] && !str_starts_with($area['image'], 'http')) {
                    $area['image'] = Storage::url($area['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if ($transformedContent['mula_sayo_image'] && !str_starts_with($transformedContent['mula_sayo_image'], 'http')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return response()->json($transformedContent);
    }

    /**
     * Update BTLED content
     */
    public function update(Request $request)
    {
        try {
            $content = ProgramsBtled::getContent();
            
            $data = [];
            
            // Handle hero section
            if ($request->has('hero_title')) {
                $data['hero_title'] = $request->input('hero_title');
            }
            
            if ($request->has('hero_subtitle')) {
                $data['hero_subtitle'] = $request->input('hero_subtitle');
            }
            
            if ($request->hasFile('hero_image')) {
                $file = $request->file('hero_image');
                $path = $file->store('landing/btled/hero', 'public');
                $data['hero_image'] = $path;
            }
            
            // Handle overview section
            if ($request->has('overview_section_title')) {
                $data['overview_section_title'] = $request->input('overview_section_title');
            }
            
            if ($request->has('program_description')) {
                $data['program_description'] = $request->input('program_description');
            }
            
            if ($request->hasFile('program_image')) {
                $file = $request->file('program_image');
                $path = $file->store('landing/btled/overview', 'public');
                $data['program_image'] = $path;
            }
            
            // Handle objectives section
            if ($request->has('objectives_section_title')) {
                $data['objectives_section_title'] = $request->input('objectives_section_title');
            }
            
            if ($request->has('objectives_data')) {
                $data['objectives_data'] = json_decode($request->input('objectives_data'), true) ?? [];
            }
            
            // Handle AVP section
            if ($request->has('avp_section_title')) {
                $data['avp_section_title'] = $request->input('avp_section_title');
            }
            
            if ($request->has('program_video')) {
                $data['program_video'] = $request->input('program_video');
            }
            
            if ($request->has('program_video_type')) {
                $data['program_video_type'] = $request->input('program_video_type');
            }
            
            if ($request->hasFile('program_video_file')) {
                $file = $request->file('program_video_file');
                $path = $file->store('landing/btled/videos', 'public');
                $data['program_video'] = $path;
                $data['program_video_type'] = 'upload';
            }
            
            // Handle action section
            if ($request->has('action_section_title')) {
                $data['action_section_title'] = $request->input('action_section_title');
            }
            
            if ($request->has('action_images_data')) {
                $actionImages = json_decode($request->input('action_images_data'), true) ?? [];
                // Handle file uploads for action images
                foreach ($actionImages as $index => $image) {
                    if ($request->hasFile("action_image_{$index}")) {
                        $file = $request->file("action_image_{$index}");
                        $path = $file->store('landing/btled/action', 'public');
                        $actionImages[$index] = $path;
                    }
                }
                $data['action_images'] = $actionImages;
            }
            
            // Handle graduates section
            if ($request->has('graduates_section_title')) {
                $data['graduates_section_title'] = $request->input('graduates_section_title');
            }
            
            if ($request->has('graduates_data')) {
                $graduatesData = json_decode($request->input('graduates_data'), true) ?? [];
                // Handle file uploads for graduate videos
                foreach ($graduatesData as $index => $graduate) {
                    if ($request->hasFile("graduate_video_{$index}")) {
                        $file = $request->file("graduate_video_{$index}");
                        $path = $file->store('landing/btled/graduates', 'public');
                        $graduatesData[$index]['video'] = $path;
                        $graduatesData[$index]['video_type'] = 'upload';
                    }
                }
                $data['graduates_data'] = $graduatesData;
            }
            
            // Handle accreditation section
            if ($request->has('accreditation_section_title')) {
                $data['accreditation_section_title'] = $request->input('accreditation_section_title');
            }
            
            if ($request->has('accreditation_areas')) {
                $areasData = json_decode($request->input('accreditation_areas'), true) ?? [];
                // Handle file uploads for area images
                foreach ($areasData as $index => $area) {
                    if ($request->hasFile("area_image_{$index}")) {
                        $file = $request->file("area_image_{$index}");
                        $path = $file->store('landing/btled/areas', 'public');
                        $areasData[$index]['image'] = $path;
                    }
                }
                $data['accreditation_areas'] = $areasData;
            }
            
            // Handle mula sayo section
            if ($request->has('mula_sayo_title')) {
                $data['mula_sayo_title'] = $request->input('mula_sayo_title');
            }
            
            if ($request->hasFile('mula_sayo_image')) {
                $file = $request->file('mula_sayo_image');
                $path = $file->store('landing/btled/mula_sayo', 'public');
                $data['mula_sayo_image'] = $path;
            }
            
            $content->update($data);
            
            return back()->with('success', 'Content updated successfully');
            
        } catch (\Exception $e) {
            Log::error('Failed to update BTLED content: ' . $e->getMessage());
            
            return back()->withErrors(['error' => 'Failed to update content: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the landing BTLED Program Page with dynamic content
     */
    public function show()
    {
        $content = ProgramsBtled::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform program image
        if ($transformedContent['program_image'] && !str_starts_with($transformedContent['program_image'], 'http')) {
            $transformedContent['program_image'] = Storage::url($transformedContent['program_image']);
        }
        
        // Transform action images
        if ($transformedContent['action_images']) {
            foreach ($transformedContent['action_images'] as &$image) {
                if ($image && !str_starts_with($image, 'http')) {
                    $image = Storage::url($image);
                }
            }
        }
        
        // Transform graduate videos
        if ($transformedContent['graduates_data']) {
            foreach ($transformedContent['graduates_data'] as &$graduate) {
                if ($graduate['video'] && $graduate['video_type'] === 'upload' && !str_starts_with($graduate['video'], 'http')) {
                    $graduate['video'] = Storage::url($graduate['video']);
                }
            }
        }
        
        // Transform accreditation area images
        if ($transformedContent['accreditation_areas']) {
            foreach ($transformedContent['accreditation_areas'] as &$area) {
                if ($area['image'] && !str_starts_with($area['image'], 'http')) {
                    $area['image'] = Storage::url($area['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if ($transformedContent['mula_sayo_image'] && !str_starts_with($transformedContent['mula_sayo_image'], 'http')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return Inertia::render('landing/pus/btled', [
            'btledContent' => $transformedContent,
            'sidebar' => [$this->getBtledDocumentsSidebar()], // Wrap in array to match admin structure
            'accreditationAreas' => $this->getBtledAreas(),
        ]);
    }

    /**
     * Get BTLED program areas with parameters and document counts
     */
    private function getBtledAreas()
    {
        // Get BTLED program (assuming program code is 'BTLED' or name contains 'BTLED')
        $btledProgram = Program::where('code', 'BTLED')
            ->orWhere('name', 'like', '%BTLED%')
            ->orWhere('name', 'like', '%Bachelor of Technology and Livelihood Education%')
            ->first();

        if (!$btledProgram) {
            return [];
        }

        // Get areas for BTLED program
        $areas = Area::where('program_id', $btledProgram->id)->get();

        // Get approved document counts for these areas
        $approvedDocs = Document::where('status', 'approved')
            ->where('program_id', $btledProgram->id)
            ->get(['id', 'area_id', 'parameter_id', 'category']);

        $areaApprovedCounts = [];
        $parameterApprovedCounts = [];
        $parameterCategoryApprovedCounts = [];

        foreach ($approvedDocs as $doc) {
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
                if (!isset($parameterCategoryApprovedCounts[$doc->parameter_id])) {
                    $parameterCategoryApprovedCounts[$doc->parameter_id] = [];
                }
                if (!isset($parameterCategoryApprovedCounts[$doc->parameter_id][$doc->category])) {
                    $parameterCategoryApprovedCounts[$doc->parameter_id][$doc->category] = 0;
                }
                $parameterCategoryApprovedCounts[$doc->parameter_id][$doc->category]++;
            }
        }

        // Transform areas with parameters
        return $areas->map(function ($area) use ($btledProgram, $areaApprovedCounts, $parameterApprovedCounts, $parameterCategoryApprovedCounts) {
            // Get parameters for this area
            $parameters = Parameter::where('program_id', $btledProgram->id)
                ->where('area_id', $area->id)
                ->get(['id', 'name', 'code'])
                ->map(function ($param) use ($parameterApprovedCounts, $parameterCategoryApprovedCounts) {
                    $paramId = $param->id;
                    $categories = ['system', 'implementation', 'outcomes'];
                    $categoryCounts = [];
                    foreach ($categories as $cat) {
                        $categoryCounts[$cat] = $parameterCategoryApprovedCounts[$paramId][$cat] ?? 0;
                    }
                    
                    return [
                        'id' => $param->id,
                        'name' => $param->name,
                        'code' => $param->code,
                        'approved_count' => $parameterApprovedCounts[$paramId] ?? 0,
                        'category_approved_counts' => $categoryCounts,
                    ];
                })
                ->toArray();

            return [
                'id' => $area->id,
                'title' => $area->name, // Keep 'title' for consistency with current frontend
                'name' => $area->name,
                'code' => $area->code,
                'image' => '/api/placeholder/300/200', // Default image
                'parameters' => $parameters,
                'approved_count' => $areaApprovedCounts[$area->id] ?? 0,
            ];
        })->toArray();
    }

    /**
     * Get BTLED documents sidebar data (same structure as AdminDocumentsController)
     */
    private function getBtledDocumentsSidebar()
    {
        // Get BTLED program
        $btledProgram = Program::where('code', 'BTLED')
            ->orWhere('name', 'like', '%BTLED%')
            ->orWhere('name', 'like', '%Bachelor of Technology and Livelihood Education%')
            ->first();

        if (!$btledProgram) {
            return null;
        }

        // Get areas for BTLED program
        $areas = Area::where('program_id', $btledProgram->id)->get();

        // Get approved document counts
        $approvedDocs = Document::where('status', 'approved')
            ->where('program_id', $btledProgram->id)
            ->get(['id', 'area_id', 'parameter_id', 'category']);

        $areaApprovedCounts = [];
        $parameterApprovedCounts = [];
        $parameterCategoryApprovedCounts = [];

        foreach ($approvedDocs as $doc) {
            if ($doc->area_id) {
                if (!isset($areaApprovedCounts[$doc->area_id])) $areaApprovedCounts[$doc->area_id] = 0;
                $areaApprovedCounts[$doc->area_id]++;
            }

            if ($doc->parameter_id) {
                if (!isset($parameterApprovedCounts[$doc->parameter_id])) $parameterApprovedCounts[$doc->parameter_id] = 0;
                $parameterApprovedCounts[$doc->parameter_id]++;
                
                if (!isset($parameterCategoryApprovedCounts[$doc->parameter_id])) {
                    $parameterCategoryApprovedCounts[$doc->parameter_id] = [];
                }
                if (!isset($parameterCategoryApprovedCounts[$doc->parameter_id][$doc->category])) {
                    $parameterCategoryApprovedCounts[$doc->parameter_id][$doc->category] = 0;
                }
                $parameterCategoryApprovedCounts[$doc->parameter_id][$doc->category]++;
            }
        }

        // Build the same structure as AdminDocumentsController
        $transformedAreas = [];
        foreach ($areas as $area) {
            $parameters = Parameter::where('program_id', $btledProgram->id)
                ->where('area_id', $area->id)
                ->get(['id', 'name', 'code'])
                ->map(function ($param) use ($parameterApprovedCounts, $parameterCategoryApprovedCounts) {
                    $paramId = $param->id;
                    $categories = ['system', 'implementation', 'outcomes'];
                    $categoryCounts = [];
                    foreach ($categories as $cat) {
                        $categoryCounts[$cat] = $parameterCategoryApprovedCounts[$paramId][$cat] ?? 0;
                    }
                    
                    return [
                        'id' => $param->id,
                        'name' => $param->name,
                        'code' => $param->code,
                        'approved_count' => $parameterApprovedCounts[$paramId] ?? 0,
                        'category_approved_counts' => $categoryCounts,
                    ];
                })
                ->toArray();

            $transformedAreas[] = [
                'id' => $area->id,
                'name' => $area->name,
                'code' => $area->code,
                'parameters' => $parameters,
                'approved_count' => $areaApprovedCounts[$area->id] ?? 0,
            ];
        }

        return [
            'id' => $btledProgram->id,
            'name' => $btledProgram->name,
            'code' => $btledProgram->code,
            'areas' => $transformedAreas,
            'approved_count' => array_sum($areaApprovedCounts), // Total approved count for program
        ];
    }

    /**
     * Get approved documents for BTLED (API endpoint)
     */
    public function getApprovedDocuments(Request $request)
    {
        $type = $request->get('type', 'documents');

        // Get BTLED program
        $btledProgram = Program::where('code', 'BTLED')
            ->orWhere('name', 'like', '%BTLED%')
            ->orWhere('name', 'like', '%Bachelor of Technology and Livelihood Education%')
            ->first();

        if (!$btledProgram) {
            return response()->json(['success' => false, 'message' => 'BTLED program not found']);
        }

        if ($type === 'areas') {
            return $this->getAreasForApi($btledProgram);
        } elseif ($type === 'parameters') {
            return $this->getParametersForApi($request, $btledProgram);
        } else {
            return $this->getDocumentsForApi($request, $btledProgram);
        }
    }

    private function getAreasForApi($btledProgram)
    {
        $areas = Area::where('program_id', $btledProgram->id)
            ->with(['parameters' => function ($query) use ($btledProgram) {
                $query->where('program_id', $btledProgram->id);
            }])
            ->get();

        // Calculate approved counts for each area
        $areasWithCounts = $areas->map(function ($area) use ($btledProgram) {
            $approvedCount = Document::where('program_id', $btledProgram->id)
                ->where('area_id', $area->id)
                ->where('status', 'approved')
                ->count();

            return [
                'id' => $area->id,
                'title' => $area->name,
                'name' => $area->name,
                'code' => $area->code,
                'image' => '/api/placeholder/400/200', // Default placeholder
                'approved_count' => $approvedCount,
                'parameters' => []
            ];
        });

        return response()->json([
            'success' => true,
            'areas' => $areasWithCounts
        ]);
    }

    private function getParametersForApi($request, $btledProgram)
    {
        $request->validate([
            'area_id' => 'required|exists:areas,id',
        ]);

        $parameters = Parameter::where('program_id', $btledProgram->id)
            ->where('area_id', $request->area_id)
            ->get();

        // Calculate approved counts for each parameter and category
        $parametersWithCounts = $parameters->map(function ($param) use ($btledProgram) {
            $approvedCount = Document::where('program_id', $btledProgram->id)
                ->where('parameter_id', $param->id)
                ->where('status', 'approved')
                ->count();

            // Count by category
            $categoryApprovedCounts = [];
            foreach (['system', 'implementation', 'outcomes'] as $category) {
                $categoryApprovedCounts[$category] = Document::where('program_id', $btledProgram->id)
                    ->where('parameter_id', $param->id)
                    ->where('category', $category)
                    ->where('status', 'approved')
                    ->count();
            }

            return [
                'id' => $param->id,
                'name' => $param->name,
                'code' => $param->code,
                'approved_count' => $approvedCount,
                'category_approved_counts' => $categoryApprovedCounts
            ];
        });

        return response()->json([
            'success' => true,
            'parameters' => $parametersWithCounts
        ]);
    }

    private function getDocumentsForApi($request, $btledProgram)
    {
        $request->validate([
            'area_id' => 'required|exists:areas,id',
            'parameter_id' => 'nullable|exists:parameters,id',
            'category' => 'nullable|in:system,implementation,outcomes',
        ]);

        $query = Document::with(['user:id,name', 'checker:id,name'])
            ->where('status', 'approved')
            ->where('program_id', $btledProgram->id)
            ->where('area_id', $request->area_id);

        if ($request->parameter_id) {
            $query->where('parameter_id', $request->parameter_id);
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        $documents = $query->orderBy('updated_at', 'desc')->get();

        $transformedDocuments = $documents->map(function ($doc) {
            return [
                'id' => $doc->id,
                'filename' => $doc->doc_filename,
                'url' => Storage::url("documents/{$doc->doc_filename}"),
                'uploaded_at' => $doc->created_at->format('Y-m-d H:i:s'),
                'user_name' => $doc->user->name ?? 'Unknown',
                'approved_by' => $doc->checker->name ?? null,
                'approved_at' => $doc->updated_at->format('Y-m-d H:i:s'),
                'updated_at' => $doc->updated_at->format('Y-m-d H:i:s'),
                'parameter_id' => $doc->parameter_id,
                'category' => $doc->category,
            ];
        });

        return response()->json([
            'success' => true,
            'documents' => $transformedDocuments
        ]);
    }
}