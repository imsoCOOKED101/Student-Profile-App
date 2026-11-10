<?php

namespace App\Http\Controllers;

use App\Models\StudentNotification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Auth::user()->studentNotifications()->latest()->paginate(15);
        return view('notifications.index', compact('notifications'));
    }

    public function markRead(StudentNotification $notification)
    {
        abort_unless($notification->user_id === Auth::id(), 403);
        $notification->update(['is_read' => true]);
        return back()->with('success', 'Notification marked as read.');
    }
}
