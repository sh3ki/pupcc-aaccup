<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\About;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AboutController extends Controller
{
    /**
     * Display the admin layout about page
     */
    public function index()
    {
        $content = About::getContent();
        
        return Inertia::render('admin/layout/About', [
            'aboutContent' => $content
        ]);
    }

    /**
     * Get about content for API
     */
    public function getContent()
    {
        $content = About::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform faculty images
        if ($transformedContent['faculty_data']) {
            foreach ($transformedContent['faculty_data'] as &$item) {
                if ($item['image'] && !str_starts_with($item['image'], 'http')) {
                    $item['image'] = Storage::url($item['image']);
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
     * Update about content
     */
    public function update(Request $request)
    {
        try {
            $content = About::getContent();
            
            $data = [];
            
            // Handle hero image
            if ($request->hasFile('hero_image')) {
                $file = $request->file('hero_image');
                $path = $file->store('about/hero', 'public');
                $data['hero_image'] = $path;
            }
            
            // Handle hero title and subtitle
            if ($request->has('hero_title')) {
                $data['hero_title'] = $request->input('hero_title');
            }
            if ($request->has('hero_subtitle')) {
                $data['hero_subtitle'] = $request->input('hero_subtitle');
            }
            
            // Handle story section
            if ($request->has('story_title')) {
                $data['story_title'] = $request->input('story_title');
            }
            if ($request->has('story_content')) {
                $data['story_content'] = $request->input('story_content');
            }
            
            // Handle mission section
            if ($request->has('mission_title')) {
                $data['mission_title'] = $request->input('mission_title');
            }
            if ($request->has('mission_content')) {
                $data['mission_content'] = $request->input('mission_content');
            }
            
            // Handle vision section
            if ($request->has('vision_title')) {
                $data['vision_title'] = $request->input('vision_title');
            }
            if ($request->has('vision_content')) {
                $data['vision_content'] = $request->input('vision_content');
            }
            
            // Handle faculty section
            if ($request->has('faculty_title')) {
                $data['faculty_title'] = $request->input('faculty_title');
            }
            
            if ($request->has('faculty_data')) {
                $facultyData = [];
                $facultyItems = json_decode($request->input('faculty_data'), true) ?? [];
                foreach ($facultyItems as $index => $item) {
                    $facultyItem = [
                        'name' => $item['name'] ?? '',
                        'description' => $item['description'] ?? '',
                        'image' => $item['image'] ?? ''
                    ];
                    
                    // Handle file upload for faculty image
                    if ($request->hasFile("faculty_image_{$index}")) {
                        $file = $request->file("faculty_image_{$index}");
                        $path = $file->store('about/faculty', 'public');
                        $facultyItem['image'] = $path;
                    }
                    
                    $facultyData[] = $facultyItem;
                }
                $data['faculty_data'] = $facultyData;
            }
            
            // Handle mula sayo section
            if ($request->has('mula_sayo_title')) {
                $data['mula_sayo_title'] = $request->input('mula_sayo_title');
            }
            
            if ($request->hasFile('mula_sayo_image')) {
                $file = $request->file('mula_sayo_image');
                $path = $file->store('about/mula-sayo', 'public');
                $data['mula_sayo_image'] = $path;
            }
            
            // Update the content
            $content->update($data);
            
            Log::info('About content updated successfully', $data);
            
            return back()->with('success', 'About content updated successfully!');
            
        } catch (\Exception $e) {
            Log::error('Failed to update about content: ' . $e->getMessage());
            return back()->with('error', 'Failed to update about content: ' . $e->getMessage());
        }
    }
}
