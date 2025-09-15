<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralFeedback extends Model
{
    use HasFactory;

    protected $table = 'referral_feedback';

    protected $fillable = [
        'referral_id',
        'feedback_by',
        'type',
        'rating',
        'comments',
        'specific_ratings',
        'would_refer_again'
    ];

    protected $casts = [
        'specific_ratings' => 'array',
        'would_refer_again' => 'boolean'
    ];

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function feedbackBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'feedback_by');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopePositive($query)
    {
        return $query->where('rating', '>=', 4);
    }

    public function scopeNegative($query)
    {
        return $query->where('rating', '<=', 2);
    }

    public function getOverallSatisfaction(): string
    {
        return match($this->rating) {
            5 => 'Excellent',
            4 => 'Good',
            3 => 'Average',
            2 => 'Poor',
            1 => 'Very Poor',
            default => 'Not Rated'
        };
    }
}

?>