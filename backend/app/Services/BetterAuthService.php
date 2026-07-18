<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use ParagonIE\Paseto\Builder;
use ParagonIE\Paseto\Keys\SymmetricKey;
use ParagonIE\Paseto\Parser;
use ParagonIE\Paseto\Purpose;
use ParagonIE\Paseto\Protocol\Version4;
use ParagonIE\Paseto\ProtocolCollection;
use ParagonIE\Paseto\Rules\IssuedBy;
use ParagonIE\Paseto\Rules\NotExpired;
use ParagonIE\Paseto\Rules\Subject;

class BetterAuthService
{
    // Token lifetimes (seconds)
    public const ACCESS_LIFETIME = 3600;      // 1 hour
    public const REFRESH_LIFETIME = 2592000;  // 30 days

    // Paseto claims
    private const ISSUER = 'keuriqai';
    private const TOKEN_TYPE_ACCESS = 'access';
    private const TOKEN_TYPE_REFRESH = 'refresh';

    private SymmetricKey $key;

    public function __construct()
    {
        // Derive a 256-bit symmetric key from the app key (XChaCha20-Poly1305)
        $secret = config('app.key');
        // Hash app key with BLAKE2b to get exactly 32 bytes for SymmetricKey
        $keyBytes = sodium_crypto_generichash(substr($secret, 0, 64), '', 32);
        $this->key = new SymmetricKey($keyBytes, new Version4());
    }

    // ─── Token Generation ──────────────────────────────────────────────────

    /**
     * Generate an access + refresh token pair for a user.
     */
    public function generateTokenPair(User $user): array
    {
        $now = new \DateTimeImmutable();

        // Create Paseto V4 access token (encrypted with XChaCha20-Poly1305)
        $accessToken = Builder::getLocal($this->key, new Version4())
            ->withIssuedAt($now)
            ->withNotBefore($now)
            ->withExpiration($now->modify('+' . self::ACCESS_LIFETIME . ' seconds'))
            ->withIssuer(self::ISSUER)
            ->withSubject((string) $user->id)
            ->withClaims([
                'type' => self::TOKEN_TYPE_ACCESS,
                'email' => $user->email,
                'name' => $user->name,
            ])
            ->toString();

        // Generate refresh token (random 64-char hex string)
        $rawRefreshToken = hash('sha256', random_bytes(64));
        $refreshTokenHash = hash('sha256', $rawRefreshToken);

        // Store hashed refresh token in DB
        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => $refreshTokenHash,
            'expires_at' => now()->addSeconds(self::REFRESH_LIFETIME),
        ]);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $rawRefreshToken,  // plaintext — only shown once
            'expires_in' => self::ACCESS_LIFETIME,
            'token_type' => 'Bearer',
        ];
    }

    // ─── Token Validation ──────────────────────────────────────────────────

    /**
     * Validate a Paseto V4 access token and return the authenticated user.
     * Returns null if token is invalid, expired, or tampered with.
     */
    public function validateAccessToken(string $token): ?User
    {
        try {
            $parser = Parser::getLocal($this->key, ProtocolCollection::v4());

            $parsed = $parser
                ->addRule(new NotExpired())
                ->addRule(new IssuedBy(self::ISSUER))
                ->parse($token);

            $claims = $parsed->getClaims();

            // Verify this is an access token (not a refresh payload)
            if (($claims['type'] ?? '') !== self::TOKEN_TYPE_ACCESS) {
                return null;
            }

            $userId = $parsed->getSubject();
            return User::find($userId);

        } catch (\Throwable $e) {
            // Token expired, tampered, or malformed
            return null;
        }
    }

    // ─── Refresh Token Rotation ────────────────────────────────────────────

    /**
     * Validate refresh token, revoke the old one, and issue a new token pair.
     * One-time use — the old refresh token is consumed.
     */
    public function rotateTokens(string $refreshToken): ?array
    {
        $tokenHash = hash('sha256', $refreshToken);

        $storedToken = RefreshToken::where('token_hash', $tokenHash)->first();

        if (!$storedToken || !$storedToken->isValid()) {
            return null;
        }

        // Revoke the old refresh token (one-time use)
        $storedToken->update(['revoked_at' => now()]);

        $user = $storedToken->user;

        // Issue a brand new pair
        return [
            'user' => $user,
            ...$this->generateTokenPair($user),
        ];
    }

    // ─── Revocation ────────────────────────────────────────────────────────

    /**
     * Revoke all refresh tokens for a user (used on logout).
     */
    public function revokeAllTokens(User $user): void
    {
        RefreshToken::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    // ─── Authentication Helpers ────────────────────────────────────────────

    /**
     * Register a new user and return a token pair.
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],  // Hashed by User model cast
        ]);

        $tokens = $this->generateTokenPair($user);

        return [
            'user' => $user,
            ...$tokens,
        ];
    }

    /**
     * Login: validate credentials and return token pair.
     * Returns null on invalid credentials.
     */
    public function login(string $email, string $password): ?array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        $tokens = $this->generateTokenPair($user);

        return [
            'user' => $user,
            ...$tokens,
        ];
    }
}
