<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function redirect(Request $request)
    {
        $role = $request->user()->role ?? null;
        if ($role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($role === 'faculty') {
            return redirect()->route('faculty.dashboard');
        } elseif ($role === 'reviewer') {
            return redirect()->route('reviewer.dashboard');
        }
        // Optionally, handle unknown roles or guests
        abort(403, 'Unauthorized');
    }
}
