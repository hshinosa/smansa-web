<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Post;
use App\Models\Teacher;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $unreadMessagesCount = ContactMessage::where('is_read', false)->count();
        $activePostsCount = Post::where('status', 'published')->count();
        $teachersCount = Teacher::count();

        return Inertia::render('Admin/DashboardPage', [
            'admin' => Auth::guard('admin')->user(),
            'unreadMessagesCount' => $unreadMessagesCount,
            'activePostsCount' => $activePostsCount,
            'teachersCount' => $teachersCount,
        ]);
    }
}
