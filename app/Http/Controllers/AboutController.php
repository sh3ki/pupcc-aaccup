<?php

namespace App\Http\Controllers;

use App\Models\About;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    // Display the About page (single record)
    public function index()
    {
        $about = About::first();
        return response()->json($about);
    }

    // Show a specific About record (if needed)
    public function show($id)
    {
        $about = About::findOrFail($id);
        return response()->json($about);
    }

    // Store a new About record
    public function store(Request $request)
    {
        $about = About::create($request->only([
            'title', 'subtitle', 'description', 'background_image',
            'history_title', 'history_content',
            'mission_title', 'mission_content',
            'vision_title', 'vision_content',
            'accreditation_title', 'accreditation_content',
            'leadership_image', 'leadership_name', 'leadership_position', 'leadership_message',
        ]));
        return response()->json($about, 201);
    }

    // Update an existing About record
    public function update(Request $request, $id)
    {
        $about = About::findOrFail($id);
        $about->update($request->only([
            'title', 'subtitle', 'description', 'background_image',
            'history_title', 'history_content',
            'mission_title', 'mission_content',
            'vision_title', 'vision_content',
            'accreditation_title', 'accreditation_content',
            'leadership_image', 'leadership_name', 'leadership_position', 'leadership_message',
        ]));
        return response()->json($about);
    }

    // Delete an About record
    public function destroy($id)
    {
        $about = About::findOrFail($id);
        $about->delete();
        return response()->json(null, 204);
    }
}
