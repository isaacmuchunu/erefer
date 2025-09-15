<?php
namespace App\Services;

use App\Models\Patient;
use App\Models\ReferralDocument;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PatientService
{
    /**
     * Create a new patient
     *
     * @param array $data
     * @return Patient
     */
    public function create(array $data): Patient
    {
        return Patient::create([
            'mrn' => $data['mrn'] ?? $this->generateMRN(),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'date_of_birth' => $data['date_of_birth'],
            'gender' => $data['gender'],
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'state' => $data['state'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'country' => $data['country'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
            'blood_type' => $data['blood_type'] ?? null,
            'allergies' => $data['allergies'] ?? null,
            'medical_conditions' => $data['medical_conditions'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Update an existing patient
     *
     * @param Patient $patient
     * @param array $data
     * @return Patient
     */
    public function update(Patient $patient, array $data): Patient
    {
        $patient->update($data);
        return $patient->fresh();
    }

    /**
     * Delete a patient
     *
     * @param Patient $patient
     * @return bool
     */
    public function delete(Patient $patient): bool
    {
        return $patient->delete();
    }

    /**
     * Find a patient by MRN
     *
     * @param string $mrn
     * @return Patient|null
     */
    public function findByMRN(string $mrn): ?Patient
    {
        return Patient::where('mrn', $mrn)->first();
    }

    /**
     * Upload a document for a patient
     *
     * @param Patient $patient
     * @param array $data
     * @return ReferralDocument
     */
    public function uploadDocument(Patient $patient, array $data): ReferralDocument
    {
        $document = $data['document'];
        $path = $document->store('patient-documents/' . $patient->id);
        
        return ReferralDocument::create([
            'patient_id' => $patient->id,
            'referral_id' => $data['referral_id'] ?? null,
            'file_path' => $path,
            'file_name' => $document->getClientOriginalName(),
            'file_type' => $document->getClientMimeType(),
            'file_size' => $document->getSize(),
            'document_type' => $data['document_type'] ?? 'other',
            'description' => $data['description'] ?? null,
            'uploaded_by' => auth()->id(),
        ]);
    }

    /**
     * Get patient medical history
     *
     * @param Patient $patient
     * @return array
     */
    public function getMedicalHistory(Patient $patient): array
    {
        // Get all referrals for the patient
        $referrals = $patient->referrals()
            ->with(['referringFacility', 'referringDoctor', 'receivingFacility', 'receivingDoctor', 'specialty'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
        
        // Get all documents for the patient
        $documents = $patient->documents()
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
        
        return [
            'patient' => $patient->toArray(),
            'referrals' => $referrals,
            'documents' => $documents,
        ];
    }

    /**
     * Generate a unique MRN
     *
     * @return string
     */
    private function generateMRN(): string
    {
        $prefix = 'MRN';
        $timestamp = now()->format('YmdHis');
        $random = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
        
        return $prefix . $timestamp . $random;
    }
}