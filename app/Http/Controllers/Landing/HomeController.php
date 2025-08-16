<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\Home;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Display the public home page
     */
    public function show()
    {
        $content = Home::getContent();
        
        return Inertia::render('landing/welcome', [
            'landingContent' => $content
        ]);
    }

    /**
     * Display the admin layout home page
     */
    public function index()
    {
        $content = Home::getContent();
        
        return Inertia::render('admin/layout/Home', [
            'landingContent' => $content
        ]);
    }

    /**
     * Get landing content for API
     */
    public function getContent()
    {
        $content = Home::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform carousel images
        if ($transformedContent['carousel_data']) {
            foreach ($transformedContent['carousel_data'] as &$item) {
                if ($item['image'] && !str_starts_with($item['image'], 'http')) {
                    $item['image'] = Storage::url($item['image']);
                }
            }
        }
        
        // Transform accreditor images
        if ($transformedContent['accreditors_data']) {
            foreach ($transformedContent['accreditors_data'] as &$item) {
                if ($item['image'] && !str_starts_with($item['image'], 'http')) {
                    $item['image'] = Storage::url($item['image']);
                }
            }
        }
        
        // Transform director image
        if ($transformedContent['director_image'] && !str_starts_with($transformedContent['director_image'], 'http')) {
            $transformedContent['director_image'] = Storage::url($transformedContent['director_image']);
        }
        
        // Transform program images
        if ($transformedContent['programs_data']) {
            foreach ($transformedContent['programs_data'] as &$item) {
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
     * Update landing content
     */
    public function update(Request $request)
    {
        try {
            $content = Home::getContent();
            
            $data = [];
            
            // Handle carousel data
            if ($request->has('carousel_data')) {
                $carouselData = [];
                $carouselItems = json_decode($request->input('carousel_data'), true) ?? [];
                foreach ($carouselItems as $index => $item) {
                    $carouselItem = [
                        'title' => $item['title'] ?? '',
                        'subtitle' => $item['subtitle'] ?? '',
                        'image' => $item['image'] ?? ''
                    ];
                    
                    // Handle file upload for carousel image
                    if ($request->hasFile("carousel_image_{$index}")) {
                        $file = $request->file("carousel_image_{$index}");
                        $path = $file->store('landing/carousel', 'public');
                        $carouselItem['image'] = $path;
                    }
                    
                    $carouselData[] = $carouselItem;
                }
                $data['carousel_data'] = $carouselData;
            }
        
        // Handle accreditors data
        if ($request->has('accreditors_data')) {
            $accreditorsData = [];
            $accreditorItems = json_decode($request->input('accreditors_data'), true) ?? [];
            foreach ($accreditorItems as $index => $item) {
                $accreditorItem = [
                    'name' => $item['name'] ?? '',
                    'position' => $item['position'] ?? '',
                    'image' => $item['image'] ?? ''
                ];
                
                // Handle file upload for accreditor image
                if ($request->hasFile("accreditor_image_{$index}")) {
                    $file = $request->file("accreditor_image_{$index}");
                    $path = $file->store('landing/accreditors', 'public');
                    $accreditorItem['image'] = $path;
                }
                
                $accreditorsData[] = $accreditorItem;
            }
            $data['accreditors_data'] = $accreditorsData;
        }
        
        // Handle director data
        if ($request->has('director_message')) {
            $data['director_message'] = $request->input('director_message');
        }
        if ($request->has('director_name')) {
            $data['director_name'] = $request->input('director_name');
        }
        if ($request->has('director_position')) {
            $data['director_position'] = $request->input('director_position');
        }
        if ($request->has('director_section_title')) {
            $data['director_section_title'] = $request->input('director_section_title');
        }
        
        // Handle director image upload
        if ($request->hasFile('director_image')) {
            $file = $request->file('director_image');
            $path = $file->store('landing/director', 'public');
            $data['director_image'] = $path;
        }
        
        // Handle videos data
        if ($request->has('videos_data')) {
            $data['videos_data'] = json_decode($request->input('videos_data'), true) ?? [];
        }
        if ($request->has('videos_section_title')) {
            $data['videos_section_title'] = $request->input('videos_section_title');
        }
        
        // Handle programs data
        if ($request->has('programs_data')) {
            $programsData = [];
            $programItems = json_decode($request->input('programs_data'), true) ?? [];
            foreach ($programItems as $index => $item) {
                $programItem = [
                    'name' => $item['name'] ?? '',
                    'description' => $item['description'] ?? '',
                    'image' => $item['image'] ?? ''
                ];
                
                // Handle file upload for program image
                if ($request->hasFile("program_image_{$index}")) {
                    $file = $request->file("program_image_{$index}");
                    $path = $file->store('landing/programs', 'public');
                    $programItem['image'] = $path;
                }
                
                $programsData[] = $programItem;
            }
            $data['programs_data'] = $programsData;
        }
        if ($request->has('programs_section_title')) {
            $data['programs_section_title'] = $request->input('programs_section_title');
        }
        
        // Handle quick links data
        if ($request->has('quick_links_data')) {
            $data['quick_links_data'] = json_decode($request->input('quick_links_data'), true) ?? [];
        }
        if ($request->has('quick_links_title')) {
            $data['quick_links_title'] = $request->input('quick_links_title');
        }
        
        // Handle mula sayo data
        if ($request->has('mula_sayo_title')) {
            $data['mula_sayo_title'] = $request->input('mula_sayo_title');
        }
        
        // Handle mula sayo image upload
        if ($request->hasFile('mula_sayo_image')) {
            $file = $request->file('mula_sayo_image');
            $path = $file->store('landing/mula-sayo', 'public');
            $data['mula_sayo_image'] = $path;
        }
        
        // Handle other section titles
        if ($request->has('accreditors_title')) {
            $data['accreditors_title'] = $request->input('accreditors_title');
        }
        
        $content->update($data);
        
        return redirect()->back()->with('success', 'Landing content updated successfully!');
        
        } catch (\Exception $e) {
            Log::error('Landing content update failed: ' . $e->getMessage());
            Log::error('Request data: ', $request->all());
            
            return redirect()->back()->with('error', 'Failed to update landing content: ' . $e->getMessage());
        }
    }
}
