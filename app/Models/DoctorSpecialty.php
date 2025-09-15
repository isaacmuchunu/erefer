<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorSpecialty extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'specialty_id',
        'primary_specialty',
        'years_of_experience_in_specialty',
        'certifications'
    ];

    protected $casts = [
        'primary_specialty' => 'boolean',
        'certifications' => 'array'
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class);
    }

    public function scopePrimary($query)
    {
        return $query->where('primary_specialty', true);
    }

    public function scopeBySpecialty($query, $specialtyId)
    {
        return $query->where('specialty_id', $specialtyId);
    }
}

?>