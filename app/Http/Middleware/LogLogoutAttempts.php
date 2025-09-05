<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogLogoutAttempts
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->routeIs('logout')) {
            Log::info('Logout attempt', [
                'user_id' => $request->user()?->id,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'session_id' => $request->session()->getId(),
                'csrf_token' => $request->header('X-CSRF-TOKEN') ?: $request->input('_token'),
                'timestamp' => now(),
            ]);
        }

        return $next($request);
    }
}
