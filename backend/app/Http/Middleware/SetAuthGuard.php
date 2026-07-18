<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Set the default auth guard to "betterauth" for API requests.
 * This allows $request->user() and auth()->user() to work correctly
 * within routes protected by the betterauth guard.
 */
class SetAuthGuard
{
    public function handle(Request $request, Closure $next)
    {
        auth()->shouldUse('betterauth');
        return $next($request);
    }
}
