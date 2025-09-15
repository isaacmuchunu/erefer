<?php

namespace App\Http\Controllers;

use App\Models\PatientFollowUp;
use Illuminate\Http\Request;

class PatientFollowUpController extends Controller
{
    public function index(Request $request)
    {
        $followUps = PatientFollowUp::with(['patient', 'doctor'])
            ->orderByDesc('id')
            ->paginate(20);
        return response()->json($followUps);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'follow_up_type' => 'required|string',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'scheduled_date' => 'required|date',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'questions' => 'nullable|array',
        ]);

        $data['status'] = 'pending';

        $followUp = PatientFollowUp::create($data);
        return response()->json($followUp, 201);
    }

    public function show(PatientFollowUp $followUp)
    {
        return response()->json($followUp->load(['patient', 'doctor']));
    }

    public function update(Request $request, PatientFollowUp $followUp)
    {
        $data = $request->validate([
            'priority' => 'nullable|in:low,normal,high,urgent',
            'scheduled_date' => 'nullable|date',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'questions' => 'nullable|array',
            'status' => 'nullable|in:pending,completed,cancelled',
        ]);

        $followUp->update($data);
        return response()->json($followUp);
    }

    public function destroy(PatientFollowUp $followUp)
    {
        $followUp->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function complete(PatientFollowUp $followUp, Request $request)
    {
        $followUp->complete($request->only(['patient_responses', 'doctor_notes', 'outcome', 'patient_satisfaction', 'next_follow_up_date']));
        return response()->json(['message' => 'Completed']);
    }

    public function sendReminder(PatientFollowUp $followUp)
    {
        $followUp->sendReminder();
        return response()->json(['message' => 'Reminder sent']);
    }

    public function escalate(PatientFollowUp $followUp, Request $request)
    {
        $data = $request->validate([
            'escalated_to' => 'required|exists:users,id',
            'reason' => 'nullable|string',
        ]);
        $followUp->escalate($data['escalated_to'], $data['reason'] ?? null);
        return response()->json(['message' => 'Escalated']);
    }

    public function scheduleNext(PatientFollowUp $followUp, Request $request)
    {
        $data = $request->validate(['date' => 'required|date']);
        $next = $followUp->scheduleNextFollowUp(new \DateTime($data['date']));
        return response()->json($next, 201);
    }

    public function getComplianceAnalytics()
    {
        return response()->json(['average_compliance' => 82.4]);
    }

    public function getOutcomeAnalytics()
    {
        return response()->json(['outcomes' => []]);
    }

    public function generateAIQuestions(PatientFollowUp $followUp)
    {
        $questions = $followUp->generateAIQuestions();
        return response()->json(['questions' => $questions]);
    }

    public function analyzeResponses(PatientFollowUp $followUp)
    {
        $followUp->analyzeResponses();
        return response()->json(['message' => 'Analyzed']);
    }
}

