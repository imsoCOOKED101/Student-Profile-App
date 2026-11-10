<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category' => ['sometimes', 'string', 'max:50'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $announcements = Announcement::query()
            ->where('is_active', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->when(($data['category'] ?? 'All') !== 'All', fn ($query) => $query->where('type', $data['category']))
            ->orderByDesc('published_at')
            ->paginate($data['per_page'] ?? 20);

        return response()->json($announcements);
    }
}
