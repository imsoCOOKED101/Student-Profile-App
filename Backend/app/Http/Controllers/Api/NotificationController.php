<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'unread' => ['sometimes', 'boolean'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);
        $query = $request->user()->studentNotifications()->latest();
        if ($request->boolean('unread')) {
            $query->where('is_read', false);
        }

        return response()->json([
            'notifications' => $query->paginate($data['per_page'] ?? 20),
            'unread_count' => $request->user()->studentNotifications()->where('is_read', false)->count(),
        ]);
    }

    public function markRead(Request $request, StudentNotification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 404);

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['notification' => $notification->refresh()]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->studentNotifications()
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
