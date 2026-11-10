<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::latest('published_at')->paginate(15);
        return view('admin.announcements.index', compact('announcements'));
    }

    public function create()
    {
        return view('admin.announcements.form', ['announcement' => new Announcement(), 'mode' => 'create']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required','string','max:200'],
            'message' => ['required','string','max:10000'],
            'type' => ['required','string','max:50'],
            'published_at' => ['nullable','date'],
        ]);
        $data['published_at'] = $data['published_at'] ?: now();
        Announcement::create($data);
        return redirect()->route('admin.announcements.index')->with('success', 'Announcement published.');
    }

    public function edit(Announcement $announcement)
    {
        return view('admin.announcements.form', ['announcement' => $announcement, 'mode' => 'edit']);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'title' => ['required','string','max:200'],
            'message' => ['required','string','max:10000'],
            'type' => ['required','string','max:50'],
            'published_at' => ['nullable','date'],
        ]);
        $announcement->update($data);
        return redirect()->route('admin.announcements.index')->with('success', 'Announcement updated.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return redirect()->route('admin.announcements.index')->with('success', 'Announcement deleted.');
    }
}
