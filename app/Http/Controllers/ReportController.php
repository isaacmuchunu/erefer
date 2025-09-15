<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Referral;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function downloadReport($filename)
    {
        $path = 'reports/' . $filename;
        if (!Storage::exists($path)) {
            abort(404);
        }
        return Storage::download($path);
    }

    public function generateReferralReport(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $referrals = Referral::whereBetween('created_at', [$request->start_date, $request->end_date])->get();

        $csv = "ID,Patient Name,Status\n";
        foreach ($referrals as $referral) {
            $patientName = isset($referral->patient) ? $referral->patient->name : 'N/A';
            $csv .= "{$referral->id},{$patientName},{$referral->status}\n";
        }

        $filename = 'referral_report_' . now()->timestamp . '.csv';
        Storage::put('reports/' . $filename, $csv);

        return response()->json(['message' => 'Referral report generated', 'filename' => $filename]);
    }

    public function generatePatientReport(Request $request): JsonResponse
    {
        $patients = Patient::all();

        $csv = "ID,Name,Date of Birth\n";
        foreach ($patients as $patient) {
            $csv .= "{$patient->id},{$patient->name},{$patient->dob}\n";
        }

        $filename = 'patient_report_' . now()->timestamp . '.csv';
        Storage::put('reports/' . $filename, $csv);

        return response()->json(['message' => 'Patient report generated', 'filename' => $filename]);
    }

    // Add more report generation methods as needed
}