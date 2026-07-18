<?php

namespace App\Providers;

use App\Guards\PasetoGuard;
use App\Services\BetterAuthService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(BetterAuthService::class);
    }

    public function boot(): void
    {
        // Register "paseto" guard driver for Better Auth
        Auth::extend('paseto', function ($app, $name, array $config) {
            return new PasetoGuard(
                $app->make(BetterAuthService::class),
                $app->make('request'),
            );
        });
    }
}
