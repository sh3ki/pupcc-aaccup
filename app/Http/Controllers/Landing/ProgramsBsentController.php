<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ProgramsBsent;
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
                if ($content->hero_image && Storage::exists($content->hero_image)) {
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
                if ($content->program_image && Storage::exists($content->program_image)) {
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
                if ($content->program_video && $content->program_video_type === 'upload' && Storage::exists($content->program_video)) {
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
                if ($content->mula_sayo_image && Storage::exists($content->mula_sayo_image)) {
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
     * Display the landing BSENT Program Page with dynamic content
     */
    public function show()
    {
        $content = ProgramsBsent::getContent();
        
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
        
        return Inertia::render('landing/pus/bsent', [
            'bsentContent' => $transformedContent
        ]);
    }
}
