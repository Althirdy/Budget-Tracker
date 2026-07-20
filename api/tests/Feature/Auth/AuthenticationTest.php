<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

final class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /** @var array<string, string> */
    private array $spaHeaders = [
        'Accept' => 'application/json',
        'Origin' => 'http://localhost:5173',
        'Referer' => 'http://localhost:5173/login',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ValidateCsrfToken::class);
        config()->set('sanctum.stateful', ['localhost:5173']);
        RateLimiter::clear('test@example.com|127.0.0.1');
    }

    public function test_user_can_log_in_and_fetch_their_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->withHeaders($this->spaHeaders)
            ->postJson('/api/v1/auth/login', [
                'email' => 'test@example.com',
                'password' => 'password',
            ])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'test@example.com')
            ->assertJsonMissingPath('user.password');

        $this->assertAuthenticatedAs($user);

        $this->withHeaders($this->spaHeaders)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_invalid_credentials_return_a_generic_validation_error(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $this->withHeaders($this->spaHeaders)
            ->postJson('/api/v1/auth/login', [
                'email' => 'test@example.com',
                'password' => 'incorrect',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->withHeaders($this->spaHeaders)
                ->postJson('/api/v1/auth/login', [
                    'email' => 'test@example.com',
                    'password' => 'incorrect',
                ])
                ->assertUnprocessable();
        }

        $this->withHeaders($this->spaHeaders)
            ->postJson('/api/v1/auth/login', [
                'email' => 'test@example.com',
                'password' => 'incorrect',
            ])
            ->assertTooManyRequests();
    }

    public function test_guest_cannot_fetch_profile(): void
    {
        $this->withHeaders($this->spaHeaders)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }

    public function test_user_can_log_out(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->withHeaders($this->spaHeaders)
            ->postJson('/api/v1/auth/login', [
                'email' => 'test@example.com',
                'password' => 'password',
            ])
            ->assertOk();

        $authenticatedSessionId = session()->getId();

        $this->withHeaders($this->spaHeaders)
            ->postJson('/api/v1/auth/logout')
            ->assertNoContent();

        $this->assertGuest('web');
        $this->assertNotSame($authenticatedSessionId, session()->getId());
    }

    public function test_frontend_origin_receives_credentialed_cors_headers(): void
    {
        $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'GET',
        ])->options('/api/v1/auth/me')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    public function test_health_endpoint_remains_public(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJsonPath('status', 'ok');
    }
}
