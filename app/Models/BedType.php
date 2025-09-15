<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BedType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'equipment_included',
        'daily_rate',
    ];

    protected $casts = [
        'equipment_included' => 'array',
        'daily_rate' => 'decimal:2',
    ];

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class);
    }
}
?>