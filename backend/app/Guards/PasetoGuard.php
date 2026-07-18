<?php

namespace App\Guards;

use App\Services\BetterAuthService;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;

class PasetoGuard implements Guard
{
    protected ?Authenticatable $user = null;

    public function __construct(
        private readonly BetterAuthService $authService,
        private readonly Request $request,
    ) {}

    /**
     * Get the currently authenticated user.
     */
    public function user(): ?Authenticatable
    {
        if ($this->user !== null) {
            return $this->user;
        }

        $token = $this->getTokenFromRequest();

        if (!$token) {
            return null;
        }

        $this->user = $this->authService->validateAccessToken($token);

        return $this->user;
    }

    /**
     * Validate a user's credentials (not used for token auth).
     */
    public function validate(array $credentials = []): bool
    {
        return false;
    }

    /**
     * Check if a user is authenticated.
     */
    public function check(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Check if the user is a guest.
     */
    public function guest(): bool
    {
        return !$this->check();
    }

    /**
     * Get the user ID or null.
     */
    public function id(): ?int
    {
        return $this->user()?->getAuthIdentifier();
    }

    /**
     * Set the current user (used for login).
     */
    public function setUser(Authenticatable $user): void
    {
        $this->user = $user;
    }

    /**
     * Check if the guard has a user.
     */
    public function hasUser(): bool
    {
        return $this->user !== null;
    }

    /**
     * Extract token from Authorization header.
     */
    protected function getTokenFromRequest(): ?string
    {
        $header = $this->request->header('Authorization');

        if (!$header) {
            return null;
        }

        // "Bearer <token>"
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        return $header;
    }
}
