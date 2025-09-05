<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\Exhibit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ExhibitController extends Controller
{
    /**
     * Display the admin layout Exhibit Page
     */
    public function index()
    {
        $content = Exhibit::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (!empty($transformedContent['hero_image']) && !str_starts_with($transformedContent['hero_image'], 'http') && !str_starts_with($transformedContent['hero_image'], '/storage/')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform exhibit images
        if (!empty($transformedContent['exhibit_data'])) {
            foreach ($transformedContent['exhibit_data'] as &$item) {
                if (!empty($item['image']) && !str_starts_with($item['image'], 'http') && !str_starts_with($item['image'], '/storage/')) {
                    $item['image'] = Storage::url($item['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if (!empty($transformedContent['mula_sayo_image']) && !str_starts_with($transformedContent['mula_sayo_image'], 'http') && !str_starts_with($transformedContent['mula_sayo_image'], '/storage/')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return Inertia::render('admin/layout/Exhibit', [
            'exhibitContent' => (object) $transformedContent
        ]);
    }

    /**
     * Get Exhibit content for API
     */
    public function getContent()
    {
        $content = Exhibit::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http') && !str_starts_with($transformedContent['hero_image'], '/storage/')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform exhibit images
        if ($transformedContent['exhibit_data']) {
            foreach ($transformedContent['exhibit_data'] as &$item) {
                if ($item['image'] && !str_starts_with($item['image'], 'http') && !str_starts_with($item['image'], '/storage/')) {
                    $item['image'] = Storage::url($item['image']);
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
     * Update Exhibit content
     */
    public function update(Request $request)
    {
        try {
            $content = Exhibit::getContent();
            
            $data = [];
            
            // Handle hero section
            if ($request->has('hero_title')) {
                $data['hero_title'] = $request->input('hero_title');
            }
            
            if ($request->has('hero_subtitle')) {
                $data['hero_subtitle'] = $request->input('hero_subtitle');
            }
            
            // Handle hero image upload
            if ($request->hasFile('hero_image')) {
                $file = $request->file('hero_image');
                $path = $file->store('landing/exhibit/hero', 'public');
                $data['hero_image'] = $path;
            }
            
            // Handle exhibit section
            if ($request->has('exhibit_section_title')) {
                $data['exhibit_section_title'] = $request->input('exhibit_section_title');
            }
            
            // Handle exhibit data
            if ($request->has('exhibit_data')) {
                $exhibitData = [];
                $exhibitItems = json_decode($request->input('exhibit_data'), true) ?? [];
                
                foreach ($exhibitItems as $index => $item) {
                    $exhibitItem = [
                        'title' => $item['title'] ?? '',
                        'subtitle' => $item['subtitle'] ?? '',
                        'image' => $item['image'] ?? ''
                    ];
                    
                    // Handle individual exhibit image uploads
                    if ($request->hasFile("exhibit_image_{$index}")) {
                        $file = $request->file("exhibit_image_{$index}");
                        $path = $file->store('landing/exhibit/items', 'public');
                        $exhibitItem['image'] = $path;
                    }
                    
                    $exhibitData[] = $exhibitItem;
                }
                
                $data['exhibit_data'] = $exhibitData;
            }
            
            // Handle mula sayo section
            if ($request->has('mula_sayo_title')) {
                $data['mula_sayo_title'] = $request->input('mula_sayo_title');
            }
            
            // Handle mula sayo image upload
            if ($request->hasFile('mula_sayo_image')) {
                $file = $request->file('mula_sayo_image');
                $path = $file->store('landing/exhibit/mula_sayo', 'public');
                $data['mula_sayo_image'] = $path;
            }
            
            $content->update($data);
            
            return back()->with('success', 'Content updated successfully');
            
        } catch (\Exception $e) {
            Log::error('Failed to update Exhibit content: ' . $e->getMessage());
            
            return back()->withErrors(['error' => 'Failed to update content: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the landing Exhibit Page with dynamic content
     */
    public function show()
    {
        $content = Exhibit::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform exhibit images
        if ($transformedContent['exhibit_data']) {
            foreach ($transformedContent['exhibit_data'] as &$item) {
                if ($item['image'] && !str_starts_with($item['image'], 'http')) {
                    $item['image'] = Storage::url($item['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if ($transformedContent['mula_sayo_image'] && !str_starts_with($transformedContent['mula_sayo_image'], 'http')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return Inertia::render('landing/exhibit', [
            'exhibitContent' => $transformedContent
        ]);
    }
}
