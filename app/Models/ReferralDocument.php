<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ReferralDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'referral_id',
        'document_type',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'description',
        'uploaded_by'
    ];

    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFileUrl(): string
    {
        return Storage::url($this->file_path);
    }

    public function getFileSizeHuman(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function isImage(): bool
    {
        return in_array($this->file_type, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    }

    public function isPdf(): bool
    {
        return $this->file_type === 'application/pdf';
    }
}

?>