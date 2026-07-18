<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\BetterAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly BetterAuthService $auth,
    ) {}

    /**
     * Register a new user with Better Auth (Paseto V4 tokens).
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->auth->register([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil.',
            'data' => [
                'user' => new UserResource($result['user']),
                'access_token' => $result['access_token'],
                'refresh_token' => $result['refresh_token'],
                'expires_in' => $result['expires_in'],
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Login — returns Paseto V4 access + refresh token pair.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login($request->email, $request->password);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => new UserResource($result['user']),
                'access_token' => $result['access_token'],
                'refresh_token' => $result['refresh_token'],
                'expires_in' => $result['expires_in'],
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Refresh access token using a refresh token (one-time use, rotated).
     */
    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token');

        if (!$refreshToken) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token diperlukan.',
            ], 400);
        }

        $result = $this->auth->rotateTokens($refreshToken);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token tidak valid atau sudah kadaluarsa.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token berhasil diperbarui.',
            'data' => [
                'user' => new UserResource($result['user']),
                'access_token' => $result['access_token'],
                'refresh_token' => $result['refresh_token'],
                'expires_in' => $result['expires_in'],
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Get the current authenticated user's session — getSession endpoint.
     */
    public function session(Request $request): JsonResponse
    {
        $user = auth('betterauth')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak terautentikasi.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Session aktif.',
            'data' => [
                'user' => new UserResource($user),
            ],
        ]);
    }

    /**
     * Logout — revoke all refresh tokens.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = auth('betterauth')->user();

        if ($user) {
            $this->auth->revokeAllTokens($user);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil. Semua token telah dicabut.',
        ]);
    }
}
