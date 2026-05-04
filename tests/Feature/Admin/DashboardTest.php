<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\ContactMessage;
use App\Models\Post;
use App\Models\Teacher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected Admin $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = Admin::factory()->createOne();
        $this->actingAs($this->admin, 'admin');
    }

    public function test_dashboard_returns_quick_stat_counts(): void
    {
        ContactMessage::factory()->count(2)->create(['is_read' => false]);
        ContactMessage::factory()->count(1)->create(['is_read' => true]);

        Post::factory()->create(['status' => 'published']);
        Post::factory()->create(['status' => 'published']);
        Post::factory()->create(['status' => 'draft']);

        Teacher::factory()->count(3)->create();

        $response = $this->get(route('admin.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->component('Admin/DashboardPage')
            ->where('unreadMessagesCount', 2)
            ->where('activePostsCount', 2)
            ->where('teachersCount', 3)
        );
    }
}
