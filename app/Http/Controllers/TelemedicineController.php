<?php

namespace App\Http\Controllers;

use App\Models\TelemedicineSession;
use Illuminate\Http\Request;

class TelemedicineController extends Controller
{
    public function index(Request $request)
    {
        $sessions = TelemedicineSession::orderByDesc('id')->paginate(20);
        return response()->json($sessions);
    }

    public function createSession(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'scheduled_at' => 'nullable|date',
        ]);

        $data['status'] = 'scheduled';
        $session = TelemedicineSession::create($data);
        return response()->json($session, 201);
    }

    public function show(TelemedicineSession $session)
    {
        return response()->json($session);
    }

    public function update(Request $request, TelemedicineSession $session)
    {
        $data = $request->validate([
            'status' => 'sometimes|string',
            'scheduled_at' => 'nullable|date',
        ]);
        $session->update($data);
        return response()->json($session);
    }

    public function startSession(TelemedicineSession $session)
    {
        $session->update(['status' => 'active', 'started_at' => now()]);
        return response()->json(['message' => 'Session started']);
    }

    public function endSession(TelemedicineSession $session)
    {
        $session->update(['status' => 'ended', 'ended_at' => now()]);
        return response()->json(['message' => 'Session ended']);
    }

    public function joinSession(TelemedicineSession $session)
    {
        return response()->json(['message' => 'Joined']);
    }

    public function sendChatMessage(TelemedicineSession $session, Request $request)
    {
        return response()->json(['message' => 'Chat sent']);
    }

    public function getChatHistory(TelemedicineSession $session)
    {
        return response()->json(['messages' => []]);
    }

    public function shareFile(TelemedicineSession $session)
    {
        return response()->json(['message' => 'File shared']);
    }

    public function toggleRecording(TelemedicineSession $session)
    {
        $session->update(['is_recorded' => !($session->is_recorded ?? false)]);
        return response()->json(['recording' => $session->is_recorded]);
    }

    public function reportQuality(TelemedicineSession $session, Request $request)
    {
        return response()->json(['message' => 'Quality reported']);
    }

    public function reportTechnicalIssue(TelemedicineSession $session, Request $request)
    {
        return response()->json(['message' => 'Issue reported']);
    }

    public function getUsageAnalytics()
    {
        return response()->json(['usage' => []]);
    }

    public function getQualityAnalytics()
    {
        return response()->json(['quality' => []]);
    }
}

