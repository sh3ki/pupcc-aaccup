<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ProgramsBsit;
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
                if (isset($graduate['video']) && $graduate['video'] && $graduate['video_type'] === 'upload' && !str_starts_with($graduate['video'], 'http')) {
                    $graduate['video'] = Storage::url($graduate['video']);
                }
            }
        }
        
        // Transform accreditation area images
        if ($transformedContent['accreditation_areas']) {
            foreach ($transformedContent['accreditation_areas'] as &$area) {
                if (isset($area['image']) && $area['image'] && !str_starts_with($area['image'], 'http')) {
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
                if ($content->hero_image && Storage::exists($content->hero_image)) {
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
                if ($content->program_image && Storage::exists($content->program_image)) {
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
                if ($content->program_video && $content->program_video_type === 'upload' && Storage::exists($content->program_video)) {
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
                        if (isset($actionImages[$index]) && $actionImages[$index] && Storage::exists($actionImages[$index])) {
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
                        if (isset($graduates[$index]['video']) && $graduates[$index]['video_type'] === 'upload' && Storage::exists($graduates[$index]['video'])) {
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
            
            if ($request->has('accreditation_areas_data')) {
                $areasData = json_decode($request->input('accreditation_areas_data'), true);
                $areas = $areasData;
                
                // Process uploaded area images
                foreach ($request->allFiles() as $key => $file) {
                    if (strpos($key, 'area_image_') === 0) {
                        $index = (int) str_replace('area_image_', '', $key);
                        
                        // Delete old image if exists
                        if (isset($areas[$index]['image']) && $areas[$index]['image'] && Storage::exists($areas[$index]['image'])) {
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
                if ($content->mula_sayo_image && Storage::exists($content->mula_sayo_image)) {
                    Storage::delete($content->mula_sayo_image);
                }
                
                $path = $request->file('mula_sayo_image')->store('programs/bsit/mula-sayo', 'public');
                $data['mula_sayo_image'] = $path;
            }
            
            // Update the content
            $content->update($data);
            
            return response()->json([
                'success' => true,
                'message' => 'BSIT content updated successfully',
                'data' => $content->fresh()
            ]);
            
        } catch (\Exception $e) {
            Log::error('BSIT content update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update BSIT content'
            ], 500);
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
                if (isset($graduate['video']) && $graduate['video'] && $graduate['video_type'] === 'upload' && !str_starts_with($graduate['video'], 'http')) {
                    $graduate['video'] = Storage::url($graduate['video']);
                }
            }
        }
        
        // Transform accreditation area images
        if ($transformedContent['accreditation_areas']) {
            foreach ($transformedContent['accreditation_areas'] as &$area) {
                if (isset($area['image']) && $area['image'] && !str_starts_with($area['image'], 'http')) {
                    $area['image'] = Storage::url($area['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if ($transformedContent['mula_sayo_image'] && !str_starts_with($transformedContent['mula_sayo_image'], 'http')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return Inertia::render('landing/pus/bsit', [
            'bsitContent' => $transformedContent
        ]);
    }
}
