<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserAssign;
use App\Models\Program;
use App\Models\Area;
use App\Models\Parameter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with([
            'assignments.program',
            'assignments.area',
        ])->get();

        // Prepare data for the frontend
        $data = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'assignments' => $user->assignments->map(function ($assign) {
                    return [
                        'program_code' => optional($assign->program)->code,
                        'area_code' => optional($assign->area)->code,
                    ];
                })->toArray(),
            ];
        });

        // Fetch program and area lists
        $programs = Program::select('id', 'code', 'name')->orderBy('code')->get()->values();
        $areas = Area::select('id', 'code', 'name', 'program_id')->orderBy('code')->get()->values();

        return Inertia::render('admin/users', [
            'users' => $data,
            'programs' => $programs,
            'areas' => $areas,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'min:8'],
            'role' => ['required', 'in:faculty,reviewer,admin'],
            'programs' => ['required', 'array', 'min:1'],
            'areas' => ['required', 'array', 'min:1'],
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        // Assign programs/areas
        $programs = $validated['programs'];
        $areas = $validated['areas'] ?? [];

        // Handle "all programs" case
        if (in_array('all', $programs)) {
            $programs = Program::pluck('id')->toArray();
        }

        // Handle "none" programs case
        if (in_array('', $programs)) {
            return redirect()->route('admin.users');
        }

        foreach ($programs as $pid) {
            if ($pid === 'all' || $pid === '') continue;

            // Handle "all areas" case
            if (in_array('all', $areas)) {
                $programAreas = Area::where('program_id', $pid)->pluck('id');
                foreach ($programAreas as $aid) {
                    UserAssign::create([
                        'user_id' => $user->id,
                        'program_id' => $pid,
                        'area_id' => $aid,
                    ]);
                }
            }
            // Handle "none" areas case
            elseif (in_array('', $areas)) {
                UserAssign::create([
                    'user_id' => $user->id,
                    'program_id' => $pid,
                    'area_id' => null,
                ]);
            }
            // Handle specific areas
            else {
                $areaIds = Area::where('program_id', $pid)
                    ->whereIn('id', $areas)
                    ->pluck('id');
                    
                if ($areaIds->isEmpty()) {
                    UserAssign::create([
                        'user_id' => $user->id,
                        'program_id' => $pid,
                        'area_id' => null,
                    ]);
                } else {
                    foreach ($areaIds as $aid) {
                        UserAssign::create([
                            'user_id' => $user->id,
                            'program_id' => $pid,
                            'area_id' => $aid,
                        ]);
                    }
                }
            }
        }
        // Optionally: flash success or return response
        return redirect()->route('admin.users');
    }

    public function assign(Request $request, User $user)
    {
        $validated = $request->validate([
            'programs' => ['required', 'array', 'min:1'],
            'areas' => ['required', 'array', 'min:1'],
        ]);

        // Delete existing assignments for this user
        UserAssign::where('user_id', $user->id)->delete();

        // Assign new programs/areas
        $programs = $validated['programs'];
        $areas = $validated['areas'] ?? [];

        // Handle "all programs" case
        if (in_array('all', $programs)) {
            $programs = Program::pluck('id')->toArray();
        }

        // Handle "none" programs case
        if (in_array('', $programs)) {
            return redirect()->route('admin.users');
        }

        foreach ($programs as $pid) {
            if ($pid === 'all' || $pid === '') continue;

            // Handle "all areas" case
            if (in_array('all', $areas)) {
                $programAreas = Area::where('program_id', $pid)->pluck('id');
                foreach ($programAreas as $aid) {
                    UserAssign::create([
                        'user_id' => $user->id,
                        'program_id' => $pid,
                        'area_id' => $aid,
                    ]);
                }
            }
            // Handle "none" areas case
            elseif (in_array('', $areas)) {
                UserAssign::create([
                    'user_id' => $user->id,
                    'program_id' => $pid,
                    'area_id' => null,
                ]);
            }
            // Handle specific areas
            else {
                $areaIds = Area::where('program_id', $pid)
                    ->whereIn('id', $areas)
                    ->pluck('id');
                    
                if ($areaIds->isEmpty()) {
                    UserAssign::create([
                        'user_id' => $user->id,
                        'program_id' => $pid,
                        'area_id' => null,
                    ]);
                } else {
                    foreach ($areaIds as $aid) {
                        UserAssign::create([
                            'user_id' => $user->id,
                            'program_id' => $pid,
                            'area_id' => $aid,
                        ]);
                    }
                }
            }
        }

        return redirect()->route('admin.users');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'in:faculty,reviewer,admin'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ]);

        return redirect()->route('admin.users');
    }

    public function updatePassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => ['required', 'min:8'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('admin.users');
    }

    public function destroy(User $user)
    {
        // Delete user assignments first
        UserAssign::where('user_id', $user->id)->delete();
        
        // Delete the user
        $user->delete();

        return redirect()->route('admin.users');
    }
}
