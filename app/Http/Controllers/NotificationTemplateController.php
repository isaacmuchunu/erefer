<?php

namespace App\Http\Controllers;

use App\Models\NotificationTemplate;
use Illuminate\Http\Request;

class NotificationTemplateController extends Controller
{
    public function index()
    {
        return response()->json(
            NotificationTemplate::orderByDesc('id')->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'event_trigger' => 'required|string',
            'subject' => 'nullable|string',
            'template' => 'required|string',
            'variables' => 'nullable|array',
            'conditions' => 'nullable|array',
            'is_active' => 'boolean',
            'priority' => 'nullable|integer',
        ]);

        $template = NotificationTemplate::create($data);
        return response()->json($template, 201);
    }

    public function show(NotificationTemplate $template)
    {
        return response()->json($template);
    }

    public function update(Request $request, NotificationTemplate $template)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string',
            'event_trigger' => 'sometimes|string',
            'subject' => 'nullable|string',
            'template' => 'sometimes|string',
            'variables' => 'nullable|array',
            'conditions' => 'nullable|array',
            'is_active' => 'boolean',
            'priority' => 'nullable|integer',
        ]);

        $template->update($data);
        return response()->json($template);
    }

    public function destroy(NotificationTemplate $template)
    {
        $template->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

