<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Home;

class HomeController extends Controller
{
    public function show()
    {
        $home = Home::first();
        return response()->json($home);
    }

    public function update(Request $request)
    {
        $home = Home::first() ?? new Home();

        // Carousel
        for ($i = 1; $i <= 4; $i++) {
            if ($request->hasFile("carousel_image_$i")) {
                $home["carousel_image_$i"] = $request->file("carousel_image_$i")->store('uploads', 'public');
            } elseif ($request->input("carousel_image_$i")) {
                $home["carousel_image_$i"] = $request->input("carousel_image_$i");
            }
            $home["carousel_title_$i"] = $request->input("carousel_title_$i");
            $home["carousel_subtitle_$i"] = $request->input("carousel_subtitle_$i");
        }

        // Accreditors
        for ($i = 1; $i <= 4; $i++) {
            if ($request->hasFile("accreditor_image_$i")) {
                $home["accreditor_image_$i"] = $request->file("accreditor_image_$i")->store('uploads', 'public');
            } elseif ($request->input("accreditor_image_$i")) {
                $home["accreditor_image_$i"] = $request->input("accreditor_image_$i");
            }
            $home["accreditor_name_$i"] = $request->input("accreditor_name_$i");
            $home["accreditor_position_$i"] = $request->input("accreditor_position_$i");
        }

        // Director
        if ($request->hasFile("director_image")) {
            $home->director_image = $request->file("director_image")->store('uploads', 'public');
        } elseif ($request->input("director_image")) {
            $home->director_image = $request->input("director_image");
        }
        $home->director_title = $request->input("director_title");
        $home->director_message = $request->input("director_message");
        $home->director_name = $request->input("director_name");
        $home->director_position = $request->input("director_position");

        // Videos
        $home->videos_section_title = $request->input("videos_section_title");
        for ($i = 1; $i <= 3; $i++) {
            $home["video_youtube_id_$i"] = $request->input("video_youtube_id_$i");
            $home["video_title_$i"] = $request->input("video_title_$i");
        }

        // Programs
        $home->programs_section_title = $request->input("programs_section_title");
        for ($i = 1; $i <= 3; $i++) {
            if ($request->hasFile("program_image_$i")) {
                $home["program_image_$i"] = $request->file("program_image_$i")->store('uploads', 'public');
            } elseif ($request->input("program_image_$i")) {
                $home["program_image_$i"] = $request->input("program_image_$i");
            }
            $home["program_title_$i"] = $request->input("program_title_$i");
            $home["program_description_$i"] = $request->input("program_description_$i");
        }

        // Mula Sayo image
        if ($request->hasFile("mula_sayo_image")) {
            $home->mula_sayo_image = $request->file("mula_sayo_image")->store('uploads', 'public');
        } elseif ($request->input("mula_sayo_image")) {
            $home->mula_sayo_image = $request->input("mula_sayo_image");
        }

        $home->save();

        // Inertia expects a redirect, not JSON
        if ($request->inertia()) {
            return redirect()->back()->with('success', 'Homepage updated!');
        }

        // For API requests, return JSON
        return response()->json(['success' => true, 'home' => $home]);
    }
}