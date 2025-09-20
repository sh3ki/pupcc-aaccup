<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ProgramsBsit;
use App\Models\Program;
use App\Models\Area;
use App\Models\Parameter;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProgramsBsitController extends Controller
{
    /**
     * Display the admin layout BSIT Program Page
     */
    public function index()
    {
        $content = ProgramsBsit::getContent();
        
        return Inertia::render('admin/layout/ProgramsBSIT', [
            'bsitContent' => $content
        ]);
    }

    /**
     * Get BSIT content for API
     */
    public function getContent()
    {
        $content = ProgramsBsit::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http') && !str_starts_with($transformedContent['hero_image'], '/storage/')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform program image
        if ($transformedContent['program_image'] && !str_starts_with($transformedContent['program_image'], 'http') && !str_starts_with($transformedContent['program_image'], '/storage/')) {
            $transformedContent['program_image'] = Storage::url($transformedContent['program_image']);
        }
        
        // Transform action images
        if ($transformedContent['action_images']) {
            foreach ($transformedContent['action_images'] as &$image) {
                if ($image && !str_starts_with($image, 'http') && !str_starts_with($image, '/storage/')) {
                    $image = Storage::url($image);
                }
            }
        }
        
        // Transform graduate videos
        if ($transformedContent['graduates_data']) {
            foreach ($transformedContent['graduates_data'] as &$graduate) {
                if (isset($graduate['video']) && $graduate['video'] && $graduate['video_type'] === 'upload' && !str_starts_with($graduate['video'], 'http') && !str_starts_with($graduate['video'], '/storage/')) {
                    $graduate['video'] = Storage::url($graduate['video']);
                }
            }
        }
        
        // Transform accreditation area images
        if ($transformedContent['accreditation_areas']) {
            foreach ($transformedContent['accreditation_areas'] as &$area) {
                if (isset($area['image']) && $area['image'] && !str_starts_with($area['image'], 'http') && !str_starts_with($area['image'], '/storage/')) {
                    $area['image'] = Storage::url($area['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if ($transformedContent['mula_sayo_image'] && !str_starts_with($transformedContent['mula_sayo_image'], 'http') && !str_starts_with($transformedContent['mula_sayo_image'], '/storage/')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return response()->json($transformedContent);
    }

    /**
     * Update BSIT content
     */
    public function update(Request $request)
    {
        try {
            $content = ProgramsBsit::getContent();
            
            $data = [];
            
            // Handle hero section
            if ($request->has('hero_title')) {
                $data['hero_title'] = $request->input('hero_title');
            }
            
            if ($request->has('hero_subtitle')) {
                $data['hero_subtitle'] = $request->input('hero_subtitle');
            }
            
            if ($request->hasFile('hero_image')) {
                // Delete old image if exists
                if (!empty($content->hero_image) && Storage::exists($content->hero_image)) {
                    Storage::delete($content->hero_image);
                }
                
                $path = $request->file('hero_image')->store('programs/bsit/hero', 'public');
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
                // Delete old image if exists
                if (!empty($content->program_image) && Storage::exists($content->program_image)) {
                    Storage::delete($content->program_image);
                }
                
                $path = $request->file('program_image')->store('programs/bsit/overview', 'public');
                $data['program_image'] = $path;
            }
            
            // Handle objectives section
            if ($request->has('objectives_section_title')) {
                $data['objectives_section_title'] = $request->input('objectives_section_title');
            }
            
            if ($request->has('objectives_data')) {
                $objectives = json_decode($request->input('objectives_data'), true);
                $data['objectives_data'] = $objectives;
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
                // Delete old video if exists
                if (!empty($content->program_video) && $content->program_video_type === 'upload' && Storage::exists($content->program_video)) {
                    Storage::delete($content->program_video);
                }
                
                $path = $request->file('program_video_file')->store('programs/bsit/videos', 'public');
                $data['program_video'] = $path;
                $data['program_video_type'] = 'upload';
            }
            
            // Handle action section
            if ($request->has('action_section_title')) {
                $data['action_section_title'] = $request->input('action_section_title');
            }
            
            if ($request->has('action_images_data')) {
                $actionImagesData = json_decode($request->input('action_images_data'), true);
                $actionImages = $content->action_images ?? [];
                
                // Process uploaded files
                foreach ($request->allFiles() as $key => $file) {
                    if (strpos($key, 'action_image_') === 0) {
                        $index = (int) str_replace('action_image_', '', $key);
                        
                        // Delete old image if exists
                        if (isset($actionImages[$index]) && !empty($actionImages[$index]) && Storage::exists($actionImages[$index])) {
                            Storage::delete($actionImages[$index]);
                        }
                        
                        $path = $file->store('programs/bsit/action', 'public');
                        $actionImages[$index] = $path;
                    }
                }
                
                // Update with new data structure
                foreach ($actionImagesData as $index => $imageData) {
                    if (isset($imageData['url']) && $imageData['url']) {
                        $actionImages[$index] = $imageData['url'];
                    }
                }
                
                $data['action_images'] = array_values($actionImages);
            }
            
            // Handle graduates section
            if ($request->has('graduates_section_title')) {
                $data['graduates_section_title'] = $request->input('graduates_section_title');
            }
            
            if ($request->has('graduates_data')) {
                $graduatesData = json_decode($request->input('graduates_data'), true);
                $graduates = $graduatesData;
                
                // Process uploaded graduate videos
                foreach ($request->allFiles() as $key => $file) {
                    if (strpos($key, 'graduate_video_') === 0) {
                        $index = (int) str_replace('graduate_video_', '', $key);
                        
                        // Delete old video if exists
                        if (isset($graduates[$index]['video']) && !empty($graduates[$index]['video']) && $graduates[$index]['video_type'] === 'upload' && Storage::exists($graduates[$index]['video'])) {
                            Storage::delete($graduates[$index]['video']);
                        }
                        
                        $path = $file->store('programs/bsit/graduates', 'public');
                        $graduates[$index]['video'] = $path;
                        $graduates[$index]['video_type'] = 'upload';
                    }
                }
                
                $data['graduates_data'] = $graduates;
            }
            
            // Handle accreditation section
  if ($request->has('accreditation_section_title')) {
                $data['accreditation_section_title'] = $request->input('accreditation_section_title');
            }
            
            if ($request->has('accreditation_areas')) {
                $areasData = json_decode($request->input('accreditation_areas'), true);
                $areas = $areasData;

                
                
                // Process uploaded area images
                foreach ($request->allFiles() as $key => $file) {
                    if (strpos($key, 'area_image_') === 0) {
                        $index = (int) str_replace('area_image_', '', $key);
                        
                        // Delete old image if exists
                        if (isset($areas[$index]['image']) && !empty($areas[$index]['image']) && Storage::exists($areas[$index]['image'])) {
                            Storage::delete($areas[$index]['image']);
                        }
                        
                        $path = $file->store('programs/bsit/accreditation', 'public');
                        $areas[$index]['image'] = $path;
                    }
                }
                
                $data['accreditation_areas'] = $areas;
            }
            
            // Handle mula sayo section
            if ($request->has('mula_sayo_title')) {
                $data['mula_sayo_title'] = $request->input('mula_sayo_title');
            }
            
            if ($request->hasFile('mula_sayo_image')) {
                // Delete old image if exists
                if (!empty($content->mula_sayo_image) && Storage::exists($content->mula_sayo_image)) {
                    Storage::delete($content->mula_sayo_image);
                }
                
                $path = $request->file('mula_sayo_image')->store('programs/bsit/mula-sayo', 'public');
                $data['mula_sayo_image'] = $path;
            }
            
            // Update the content
            $content->update($data);
            
            return redirect()->back()->with('success', 'BSIT content updated successfully!');
            
        } catch (\Exception $e) {
            Log::error('BSIT content update failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update BSIT content. Please try again.');
        }
    }

    /**
     * Display the landing BSIT Program Page with dynamic content
     */
    public function show()
    {
        $content = ProgramsBsit::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http') && !str_starts_with($transformedContent['hero_image'], '/storage/')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform program image
        if ($transformedContent['program_image'] && !str_starts_with($transformedContent['program_image'], 'http') && !str_starts_with($transformedContent['program_image'], '/storage/')) {
            $transformedContent['program_image'] = Storage::url($transformedContent['program_image']);
        }
        
        // Transform action images
        if ($transformedContent['action_images']) {
            foreach ($transformedContent['action_images'] as &$image) {
                if ($image && !str_starts_with($image, 'http') && !str_starts_with($image, '/storage/')) {
                    $image = Storage::url($image);
                }
            }
        }
        
        // Transform graduate videos
        if ($transformedContent['graduates_data']) {
            foreach ($transformedContent['graduates_data'] as &$graduate) {
                if (isset($graduate['video']) && $graduate['video'] && $graduate['video_type'] === 'upload' && !str_starts_with($graduate['video'], 'http')) {
                    $graduate['video'] = Storage::url($graduate['video']);
                }
            }
        }
        
        // Transform accreditation area images
        if ($transformedContent['accreditation_areas']) {
            foreach ($transformedContent['accreditation_areas'] as &$area) {
                if (isset($area['image']) && $area['image'] && !str_starts_with($area['image'], 'http') && !str_starts_with($area['image'], '/storage/')) {
                    $area['image'] = Storage::url($area['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if ($transformedContent['mula_sayo_image'] && !str_starts_with($transformedContent['mula_sayo_image'], 'http') && !str_starts_with($transformedContent['mula_sayo_image'], '/storage/')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return Inertia::render('landing/pus/bsit', [
            'bsitContent' => $transformedContent,
            'sidebar' => [$this->getBsitDocumentsSidebar()], // Wrap in array to match admin structure
            'accreditationAreas' => $this->getBsitAreas(),
        ]);
    }

    /**
     * Get BSIT program areas with parameters and document counts
     */
    private function getBsitAreas()
    {
        // Get BSIT program - try multiple search patterns
        $bsitProgram = Program::where('code', 'BSIT')
            ->orWhere('code', 'BSIt')
            ->orWhere('code', 'BS-IT')
            ->orWhere('name', 'like', '%BSIT%')
            ->orWhere('name', 'like', '%BSIt%')
            ->orWhere('name', 'like', '%Bachelor of Science in Information Technology%')
            ->orWhere('name', 'like', '%Information Technology%')
            ->first();

        if (!$bsitProgram) {
            return [];
        }

        // Get areas for BSIT program
        $areas = Area::where('program_id', $bsitProgram->id)->get();

        // Get approved document counts for these areas
        $approvedDocs = Document::where('status', 'approved')
            ->where('program_id', $bsitProgram->id)
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
        return $areas->map(function ($area) use ($bsitProgram, $areaApprovedCounts, $parameterApprovedCounts, $parameterCategoryApprovedCounts) {
            // Get parameters for this area
            $parameters = Parameter::where('program_id', $bsitProgram->id)
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
     * Get BSIT documents sidebar data (same structure as AdminDocumentsController)
     */
    private function getBsitDocumentsSidebar()
    {
        // Get BSIT program - try multiple search patterns
        $bsitProgram = Program::where('code', 'BSIT')
            ->orWhere('code', 'BSIt')
            ->orWhere('code', 'BS-IT')
            ->orWhere('name', 'like', '%BSIT%')
            ->orWhere('name', 'like', '%BSIt%')
            ->orWhere('name', 'like', '%Bachelor of Science in Information Technology%')
            ->orWhere('name', 'like', '%Information Technology%')
            ->first();

        if (!$bsitProgram) {
            // Return a default structure if no program found
            return [
                'id' => 0,
                'name' => 'BSIT - Bachelor of Science in Information Technology',
                'code' => 'BSIT',
                'areas' => [],
                'approved_count' => 0,
            ];
        }

        // Get areas for BSIT program
        $areas = Area::where('program_id', $bsitProgram->id)->get();

        // Get approved document counts
        $approvedDocs = Document::where('status', 'approved')
            ->where('program_id', $bsitProgram->id)
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
            $parameters = Parameter::where('program_id', $bsitProgram->id)
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
            'id' => $bsitProgram->id,
            'name' => $bsitProgram->name,
            'code' => $bsitProgram->code,
            'areas' => $transformedAreas,
            'approved_count' => array_sum($areaApprovedCounts), // Total approved count for program
        ];
    }

    /**
     * Get approved documents for BSIT (API endpoint)
     */
    public function getApprovedDocuments(Request $request)
    {
        Log::info('BSIT getApprovedDocuments called', [
            'request_params' => $request->all(),
            'url' => $request->fullUrl()
        ]);

        $type = $request->get('type', 'documents');

        // Get BSIT program
        $bsitProgram = Program::where('code', 'BSIT')
            ->orWhere('name', 'like', '%BSIT%')
            ->orWhere('name', 'like', '%Bachelor of Science in Information Technology%')
            ->first();

        Log::info('BSIT program found', ['program' => $bsitProgram]);

        if (!$bsitProgram) {
            return response()->json(['success' => false, 'message' => 'BSIT program not found']);
        }

        if ($type === 'areas') {
            return $this->getAreasForApi($bsitProgram);
        } elseif ($type === 'parameters') {
            return $this->getParametersForApi($request, $bsitProgram);
        } else {
            return $this->getDocumentsForApi($request, $bsitProgram);
        }
    }

    private function getAreasForApi($bsitProgram)
    {
        $areas = Area::where('program_id', $bsitProgram->id)
            ->with(['parameters' => function ($query) use ($bsitProgram) {
                $query->where('program_id', $bsitProgram->id);
            }])
            ->get();

        // Calculate approved counts for each area
        $areasWithCounts = $areas->map(function ($area) use ($bsitProgram) {
            $approvedCount = Document::where('program_id', $bsitProgram->id)
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

    private function getParametersForApi($request, $bsitProgram)
    {
        $request->validate([
            'area_id' => 'required|exists:areas,id',
        ]);

        $parameters = Parameter::where('program_id', $bsitProgram->id)
            ->where('area_id', $request->area_id)
            ->get();

        // Calculate approved counts for each parameter and category
        $parametersWithCounts = $parameters->map(function ($param) use ($bsitProgram) {
            $approvedCount = Document::where('program_id', $bsitProgram->id)
                ->where('parameter_id', $param->id)
                ->where('status', 'approved')
                ->count();

            // Count by category
            $categoryApprovedCounts = [];
            foreach (['system', 'implementation', 'outcomes'] as $category) {
                $categoryApprovedCounts[$category] = Document::where('program_id', $bsitProgram->id)
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

    private function getDocumentsForApi($request, $bsitProgram)
    {
        Log::info('getDocumentsForApi called', [
            'area_id' => $request->area_id,
            'parameter_id' => $request->parameter_id,
            'category' => $request->category,
            'program_id' => $bsitProgram->id
        ]);

        $request->validate([
            'area_id' => 'required|exists:areas,id',
            'parameter_id' => 'nullable|exists:parameters,id',
            'category' => 'nullable|in:system,implementation,outcomes',
        ]);

        $query = Document::with(['user:id,name', 'checker:id,name'])
            ->where('status', 'approved')
            ->where('program_id', $bsitProgram->id)
            ->where('area_id', $request->area_id);

        if ($request->parameter_id) {
            $query->where('parameter_id', $request->parameter_id);
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        $documents = $query->orderBy('updated_at', 'desc')->get();
        
        Log::info('Documents found', [
            'count' => $documents->count(),
            'documents' => $documents->toArray()
        ]);

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

        Log::info('Transformed documents', ['transformed' => $transformedDocuments->toArray()]);

        return response()->json([
            'success' => true,
            'documents' => $transformedDocuments
        ]);
    }
}

