<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ProgramsBtled;
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
            'btledContent' => $transformedContent
        ]);
    }
}