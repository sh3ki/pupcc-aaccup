<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ProgramsUnderSurvey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProgramsUnderSurveyController extends Controller
{
    /**
     * Display the admin layout Programs Under Survey Page
     */
    public function index()
    {
        $content = ProgramsUnderSurvey::getContent();
        
        return Inertia::render('admin/layout/Programs', [
            'programsContent' => $content
        ]);
    }

    /**
     * Get Programs content for API
     */
    public function getContent()
    {
        $content = ProgramsUnderSurvey::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
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
     * Update Programs content
     */
    public function update(Request $request)
    {
        try {
            $content = ProgramsUnderSurvey::getContent();
            
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
                $path = $file->store('landing/programs/hero', 'public');
                $data['hero_image'] = $path;
            }
            
            // Handle programs section
            if ($request->has('programs_section_title')) {
                $data['programs_section_title'] = $request->input('programs_section_title');
            }
            
            // Handle programs data
            if ($request->has('programs_data')) {
                $programsData = [];
                $programItems = json_decode($request->input('programs_data'), true) ?? [];
                foreach ($programItems as $index => $item) {
                    $programItem = [
                        'title' => $item['title'] ?? '',
                        'short' => $item['short'] ?? '',
                        'description' => $item['description'] ?? '',
                        'href' => $item['href'] ?? '',
                        'image' => $item['image'] ?? ''
                    ];
                    
                    // Handle file upload for program image
                    if ($request->hasFile("program_image_{$index}")) {
                        $file = $request->file("program_image_{$index}");
                        $path = $file->store('landing/programs/programs', 'public');
                        $programItem['image'] = $path;
                    }
                    
                    $programsData[] = $programItem;
                }
                $data['programs_data'] = $programsData;
            }
            
            // Handle mula sayo section
            if ($request->has('mula_sayo_title')) {
                $data['mula_sayo_title'] = $request->input('mula_sayo_title');
            }
            
            // Handle mula sayo image upload
            if ($request->hasFile('mula_sayo_image')) {
                $file = $request->file('mula_sayo_image');
                $path = $file->store('landing/programs/mula_sayo', 'public');
                $data['mula_sayo_image'] = $path;
            }
            
            $content->update($data);
            
            return back()->with('success', 'Content updated successfully');
            
        } catch (\Exception $e) {
            Log::error('Failed to update Programs content: ' . $e->getMessage());
            
            return back()->withErrors(['error' => 'Failed to update content: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the landing Programs Under Survey Page with dynamic content
     */
    public function show()
    {
        $content = ProgramsUnderSurvey::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
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
        
        return Inertia::render('landing/programs', [
            'programsContent' => $transformedContent
        ]);
    }
}