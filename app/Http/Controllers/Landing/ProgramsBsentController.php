<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ProgramsBsent;
use App\Models\Program;
use App\Models\Area;
use App\Models\Parameter;
use App\Models\Document;
use App\Models\SpecialDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProgramsBsentController extends Controller
{
    /**
     * Display the admin layout BSENT Program Page
     */
    public function index()
    {
        $content = ProgramsBsent::getContent();
        
        return Inertia::render('admin/layout/ProgramsBSENT', [
            'bsentContent' => $content
        ]);
    }

    /**
     * Get BSENT content for API
     */
    public function getContent()
    {
        $content = ProgramsBsent::getContent();
        
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
                if ($graduate['video'] && $graduate['video_type'] === 'upload' && !str_starts_with($graduate['video'], 'http') && !str_starts_with($graduate['video'], '/storage/')) {
                    $graduate['video'] = Storage::url($graduate['video']);
                }
            }
        }
        
        // Transform accreditation area images
        if ($transformedContent['accreditation_areas']) {
            foreach ($transformedContent['accreditation_areas'] as &$area) {
                if ($area['image'] && !str_starts_with($area['image'], 'http') && !str_starts_with($area['image'], '/storage/')) {
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
     * Display the landing BSENT Program Page with dynamic content
     */
    public function show()
    {
        $content = ProgramsBsent::getContent();
        
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
                if ($graduate['video'] && $graduate['video_type'] === 'upload' && !str_starts_with($graduate['video'], 'http') && !str_starts_with($graduate['video'], '/storage/')) {
                    $graduate['video'] = Storage::url($graduate['video']);
                }
            }
        }
        
        // Transform accreditation area images
        if ($transformedContent['accreditation_areas']) {
            foreach ($transformedContent['accreditation_areas'] as &$area) {
                if ($area['image'] && !str_starts_with($area['image'], 'http') && !str_starts_with($area['image'], '/storage/')) {
                    $area['image'] = Storage::url($area['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if ($transformedContent['mula_sayo_image'] && !str_starts_with($transformedContent['mula_sayo_image'], 'http') && !str_starts_with($transformedContent['mula_sayo_image'], '/storage/')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return Inertia::render('landing/pus/bsent', [
            'bsentContent' => $transformedContent,
            'sidebar' => [$this->getBsentDocumentsSidebar()], // Wrap in array to match admin structure
            'accreditationAreas' => $this->getBsentAreas(),
        ]);
    }

    /**
     * Get approved documents for BSENT (API endpoint)
     */
    public function getApprovedDocuments(Request $request)
    {
        Log::info('BSENT getApprovedDocuments called', [
            'request_params' => $request->all(),
            'url' => $request->fullUrl()
        ]);

        $type = $request->get('type', 'documents');

        // Get BSENT program
        $bsentProgram = Program::where('code', 'BSENT')
            ->orWhere('name', 'like', '%BSENT%')
            ->orWhere('name', 'like', '%Bachelor of Science in Entrepreneurship%')
            ->first();

        Log::info('BSENT program found', ['program' => $bsentProgram]);

        if (!$bsentProgram) {
            return response()->json(['success' => false, 'message' => 'BSENT program not found']);
        }

        if ($type === 'areas') {
            return $this->getAreasForApi($bsentProgram);
        } elseif ($type === 'parameters') {
            return $this->getParametersForApi($request, $bsentProgram);
        } else {
            return $this->getDocumentsForApi($request, $bsentProgram);
        }
    }

    private function getAreasForApi($bsentProgram)
    {
        $areas = Area::where('program_id', $bsentProgram->id)
            ->with(['parameters' => function ($query) use ($bsentProgram) {
                $query->where('program_id', $bsentProgram->id);
            }])
            ->get();

        // Calculate approved counts for each area
        $areasWithCounts = $areas->map(function ($area) use ($bsentProgram) {
            $approvedCount = Document::where('program_id', $bsentProgram->id)
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

    private function getParametersForApi($request, $bsentProgram)
    {
        $request->validate([
            'area_id' => 'required|exists:areas,id',
        ]);

        $parameters = Parameter::where('program_id', $bsentProgram->id)
            ->where('area_id', $request->area_id)
            ->get();

        // Calculate approved counts for each parameter and category
        $parametersWithCounts = $parameters->map(function ($param) use ($bsentProgram) {
            $approvedCount = Document::where('program_id', $bsentProgram->id)
                ->where('parameter_id', $param->id)
                ->where('status', 'approved')
                ->count();

            // Count by category
            $categoryApprovedCounts = [];
            foreach (['system', 'implementation', 'outcomes'] as $category) {
                $categoryApprovedCounts[$category] = Document::where('program_id', $bsentProgram->id)
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

    private function getDocumentsForApi($request, $bsentProgram)
    {
        Log::info('BSENT getDocumentsForApi called', [
            'area_id' => $request->area_id,
            'parameter_id' => $request->parameter_id,
            'category' => $request->category,
            'program_id' => $bsentProgram->id
        ]);

        $request->validate([
            'area_id' => 'required|exists:areas,id',
            'parameter_id' => 'nullable|exists:parameters,id',
            'category' => 'nullable|in:system,implementation,outcomes',
        ]);

        // Check if this is a special parameter (PPP or Self-Survey)
        $isSpecialParameter = false;
        $parameter = null;
        if ($request->parameter_id) {
            $parameter = Parameter::find($request->parameter_id);
            $isSpecialParameter = $parameter && in_array($parameter->name, ['PPP', 'Self-Survey']);
        }

        if ($isSpecialParameter) {
            // Fetch from special_documents table
            $query = SpecialDocument::with(['user:id,name', 'checkedBy:id,name'])
                ->where('status', 'approved')
                ->where('program_id', $bsentProgram->id)
                ->where('area_id', $request->area_id)
                ->where('parameter_id', $request->parameter_id);

            $documents = $query->orderBy('updated_at', 'desc')->get();
            
            Log::info('BSENT Special documents found', [
                'count' => $documents->count(),
                'parameter_name' => $parameter->name ?? 'Unknown'
            ]);

            $transformedDocuments = $documents->map(function ($doc) use ($parameter) {
                $folderPath = strtolower($parameter->name) === 'ppp' ? 'documents/ppp' : 'documents/self-survey';
                
                return [
                    'id' => $doc->id,
                    'filename' => $doc->doc_filename,
                    'url' => Storage::url("{$folderPath}/{$doc->doc_filename}"),
                    'uploaded_at' => $doc->created_at->format('Y-m-d H:i:s'),
                    'user_name' => $doc->user->name ?? 'Unknown',
                    'approved_by' => $doc->checkedBy->name ?? null,
                    'approved_at' => $doc->updated_at->format('Y-m-d H:i:s'),
                    'updated_at' => $doc->updated_at->format('Y-m-d H:i:s'),
                    'parameter_id' => $doc->parameter_id,
                    'category' => $doc->category, // Will be 'ppp' or 'self-survey'
                ];
            });
        } else {
            // Regular documents - existing logic
            $query = Document::with(['user:id,name', 'checker:id,name'])
                ->where('status', 'approved')
                ->where('program_id', $bsentProgram->id)
                ->where('area_id', $request->area_id);

            if ($request->parameter_id) {
                $query->where('parameter_id', $request->parameter_id);
            }

            if ($request->category) {
                $query->where('category', $request->category);
            }

            $documents = $query->orderBy('updated_at', 'desc')->get();
            
            Log::info('BSENT Regular documents found', [
                'count' => $documents->count()
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
        }

        Log::info('BSENT Transformed documents', ['count' => $transformedDocuments->count()]);

        return response()->json([
            'success' => true,
            'documents' => $transformedDocuments
        ]);
    }

    /**
     * Get BSENT program areas with parameters and document counts
     */
    private function getBsentAreas()
    {
        // Get BSENT program - try multiple search patterns
        $bsentProgram = Program::where('code', 'BSENT')
            ->orWhere('code', 'BSEnt')
            ->orWhere('code', 'BS-ENT')
            ->orWhere('name', 'like', '%BSENT%')
            ->orWhere('name', 'like', '%BSEnt%')
            ->orWhere('name', 'like', '%Bachelor of Science in Entrepreneurship%')
            ->orWhere('name', 'like', '%Entrepreneurship%')
            ->first();

        if (!$bsentProgram) {
            return [];
        }

        // Get areas for BSENT program
        $areas = Area::where('program_id', $bsentProgram->id)->get();

        // Get approved document counts for these areas
        $approvedDocs = Document::where('status', 'approved')
            ->where('program_id', $bsentProgram->id)
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
        return $areas->map(function ($area) use ($bsentProgram, $areaApprovedCounts, $parameterApprovedCounts, $parameterCategoryApprovedCounts) {
            // Get parameters for this area
            $parameters = Parameter::where('program_id', $bsentProgram->id)
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
     * Get BSENT documents sidebar data (same structure as AdminDocumentsController)
     */
    private function getBsentDocumentsSidebar()
    {
        // Get BSENT program - try multiple search patterns
        $bsentProgram = Program::where('code', 'BSENT')
            ->orWhere('code', 'BSEnt')
            ->orWhere('code', 'BS-ENT')
            ->orWhere('name', 'like', '%BSENT%')
            ->orWhere('name', 'like', '%BSEnt%')
            ->orWhere('name', 'like', '%Bachelor of Science in Entrepreneurship%')
            ->orWhere('name', 'like', '%Entrepreneurship%')
            ->first();

        if (!$bsentProgram) {
            // Return a default structure if no program found
            return [
                'id' => 0,
                'name' => 'BSENT - Bachelor of Science in Entrepreneurship',
                'code' => 'BSENT',
                'areas' => [],
                'approved_count' => 0,
            ];
        }

        // Get areas for BSENT program
        $areas = Area::where('program_id', $bsentProgram->id)->get();

        // Get approved document counts
        $approvedDocs = Document::where('status', 'approved')
            ->where('program_id', $bsentProgram->id)
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
            $parameters = Parameter::where('program_id', $bsentProgram->id)
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
            'id' => $bsentProgram->id,
            'name' => $bsentProgram->name,
            'code' => $bsentProgram->code,
            'areas' => $transformedAreas,
            'approved_count' => array_sum($areaApprovedCounts), // Total approved count for program
        ];
    }

    /**
     * Update BSENT content
     */
    public function update(Request $request)
    {
        try {
            $content = ProgramsBsent::getContent();
            
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
                
                $file = $request->file('hero_image');
                $path = $file->store('programs/bsent/hero', 'public');
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
                
                $file = $request->file('program_image');
                $path = $file->store('programs/bsent/overview', 'public');
                $data['program_image'] = $path;
            }
            
            // Handle objectives section
            if ($request->has('objectives_section_title')) {
                $data['objectives_section_title'] = $request->input('objectives_section_title');
            }
            
            if ($request->has('objectives_data')) {
                $objectives = json_decode($request->input('objectives_data'), true);
                $data['objectives_data'] = array_filter($objectives, function($obj) {
                    return !empty(trim($obj));
                });
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
                
                $file = $request->file('program_video_file');
                $path = $file->store('programs/bsent/videos', 'public');
                $data['program_video'] = $path;
                $data['program_video_type'] = 'upload';
            }
            
            // Handle action section
            if ($request->has('action_section_title')) {
                $data['action_section_title'] = $request->input('action_section_title');
            }
            
            if ($request->has('action_images_data')) {
                $actionImagesData = json_decode($request->input('action_images_data'), true);
                $actionImages = [];
                
                foreach ($actionImagesData as $index => $imageData) {
                    if ($request->hasFile("action_image_{$index}")) {
                        $file = $request->file("action_image_{$index}");
                        $path = $file->store('programs/bsent/action', 'public');
                        $actionImages[] = $path;
                    } else {
                        $actionImages[] = $imageData;
                    }
                }
                
                $data['action_images'] = $actionImages;
            }
            
            // Handle graduates section
            if ($request->has('graduates_section_title')) {
                $data['graduates_section_title'] = $request->input('graduates_section_title');
            }
            
            if ($request->has('graduates_data')) {
                $graduatesData = json_decode($request->input('graduates_data'), true);
                $graduates = [];
                
                foreach ($graduatesData as $index => $graduateData) {
                    $graduate = $graduateData;
                    
                    if ($request->hasFile("graduate_video_{$index}")) {
                        $file = $request->file("graduate_video_{$index}");
                        $path = $file->store('programs/bsent/graduates', 'public');
                        $graduate['video'] = $path;
                        $graduate['video_type'] = 'upload';
                    }
                    
                    $graduates[] = $graduate;
                }
                
                $data['graduates_data'] = $graduates;
            }
            
            // Handle accreditation areas section
            if ($request->has('accreditation_section_title')) {
                $data['accreditation_section_title'] = $request->input('accreditation_section_title');
            }
            
            if ($request->has('accreditation_areas')) {
                $areasData = json_decode($request->input('accreditation_areas'), true);
                $areas = [];
                
                foreach ($areasData as $index => $areaData) {
                    $area = $areaData;
                    
                    if ($request->hasFile("area_image_{$index}")) {
                        $file = $request->file("area_image_{$index}");
                        $path = $file->store('programs/bsent/accreditation', 'public');
                        $area['image'] = $path;
                    }
                    
                    $areas[] = $area;
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
                
                $file = $request->file('mula_sayo_image');
                $path = $file->store('programs/bsent/mula-sayo', 'public');
                $data['mula_sayo_image'] = $path;
            }
            
            // Update the content
            $content->update($data);
            
            return redirect()->back()->with('success', 'BSENT content updated successfully!');
            
        } catch (\Exception $e) {
            Log::error('Error updating BSENT content: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update BSENT content. Please try again.');
        }
    }

    /**
     * Get BSENT program with areas and parameters for sidebar (like admin panel)
     */
    private function getProgramWithAreasAndParameters()
    {
        // Get BSENT program
        $bsentProgram = Program::where('code', 'BSENT')
            ->orWhere('name', 'like', '%BSENT%')
            ->orWhere('name', 'like', '%Bachelor of Science in Entrepreneurship%')
            ->first();

        if (!$bsentProgram) {
            return [
                'id' => 0,
                'name' => 'BSENT - Bachelor of Science in Entrepreneurship',
                'code' => 'BSENT',
                'areas' => [],
                'approved_count' => 0,
            ];
        }

        // Get areas for BSENT program
        $areas = Area::where('program_id', $bsentProgram->id)->get();

        // Get approved document counts
        $approvedDocs = Document::where('status', 'approved')
            ->where('program_id', $bsentProgram->id)
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

            // Parameter count and category count
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

        // Build areas with parameters
        $transformedAreas = [];
        foreach ($areas as $area) {
            $parameters = Parameter::where('program_id', $bsentProgram->id)
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
            'id' => $bsentProgram->id,
            'name' => $bsentProgram->name,
            'code' => $bsentProgram->code,
            'areas' => $transformedAreas,
            'approved_count' => array_sum($areaApprovedCounts),
        ];
    }
}
