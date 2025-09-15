<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class WhatsAppMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'media_id',
        'filename',
        'mime_type',
        'file_size',
        'storage_path',
        'download_url',
        'expires_at',
        'is_downloaded',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_downloaded' => 'boolean',
    ];

    // Relationships
    public function message(): BelongsTo
    {
        return $this->belongsTo(WhatsAppMessage::class);
    }

    // Accessors
    protected function isImage(): Attribute
    {
        return Attribute::make(
            get: fn () => str_starts_with($this->mime_type, 'image/')
        );
    }

    protected function isVideo(): Attribute
    {
        return Attribute::make(
            get: fn () => str_starts_with($this->mime_type, 'video/')
        );
    }

    protected function isAudio(): Attribute
    {
        return Attribute::make(
            get: fn () => str_starts_with($this->mime_type, 'audio/')
        );
    }

    protected function isDocument(): Attribute
    {
        return Attribute::make(
            get: fn () => !$this->is_image && !$this->is_video && !$this->is_audio
        );
    }

    protected function humanReadableSize(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->formatBytes($this->file_size)
        );
    }

    protected function fileExtension(): Attribute
    {
        return Attribute::make(
            get: fn () => pathinfo($this->filename, PATHINFO_EXTENSION)
        );
    }

    protected function localUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->storage_path 
                ? route('whatsapp.media.download', $this->id)
                : null
        );
    }

    // Methods
    public function download(): bool
    {
        if ($this->is_downloaded || !$this->download_url) {
            return false;
        }

        try {
            $response = \Http::get($this->download_url);
            
            if ($response->successful()) {
                $filename = $this->filename ?: $this->media_id . '.' . $this->guessExtension();
                $path = 'whatsapp-media/' . $filename;
                
                Storage::disk('private')->put($path, $response->body());
                
                $this->update([
                    'storage_path' => $path,
                    'is_downloaded' => true,
                    'file_size' => strlen($response->body()),
                ]);
                
                return true;
            }
        } catch (\Exception $e) {
            \Log::error('Failed to download WhatsApp media', [
                'media_id' => $this->media_id,
                'error' => $e->getMessage()
            ]);
        }
        
        return false;
    }

    public function exists(): bool
    {
        return $this->storage_path && Storage::disk('private')->exists($this->storage_path);
    }

    public function getContent(): ?string
    {
        if (!$this->exists()) {
            return null;
        }
        
        return Storage::disk('private')->get($this->storage_path);
    }

    public function delete(): bool
    {
        // Delete file from storage
        if ($this->exists()) {
            Storage::disk('private')->delete($this->storage_path);
        }
        
        // Delete database record
        return parent::delete();
    }

    public function getThumbnailUrl(): ?string
    {
        if (!$this->is_image) {
            return null;
        }
        
        return route('whatsapp.media.thumbnail', $this->id);
    }

    public function getIconClass(): string
    {
        if ($this->is_image) {
            return 'fa-image';
        }
        
        if ($this->is_video) {
            return 'fa-video';
        }
        
        if ($this->is_audio) {
            return 'fa-music';
        }
        
        return match ($this->mime_type) {
            'application/pdf' => 'fa-file-pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'fa-file-word',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'fa-file-excel',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'fa-file-powerpoint',
            'application/zip',
            'application/x-zip-compressed' => 'fa-file-archive',
            'text/plain' => 'fa-file-text',
            default => 'fa-file',
        };
    }

    public function canBePreviewedInline(): bool
    {
        return $this->is_image || $this->mime_type === 'application/pdf';
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at < now();
    }

    private function formatBytes(?int $bytes, int $precision = 2): string
    {
        if (!$bytes) {
            return 'Unknown size';
        }
        
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }

    private function guessExtension(): string
    {
        return match ($this->mime_type) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'video/mp4' => 'mp4',
            'video/quicktime' => 'mov',
            'audio/mpeg' => 'mp3',
            'audio/wav' => 'wav',
            'audio/ogg' => 'ogg',
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/vnd.ms-excel' => 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
            'text/plain' => 'txt',
            default => 'bin',
        };
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'is_image' => $this->is_image,
            'is_video' => $this->is_video,
            'is_audio' => $this->is_audio,
            'is_document' => $this->is_document,
            'human_readable_size' => $this->human_readable_size,
            'file_extension' => $this->file_extension,
            'local_url' => $this->local_url,
            'thumbnail_url' => $this->getThumbnailUrl(),
            'icon_class' => $this->getIconClass(),
            'can_preview' => $this->canBePreviewedInline(),
            'is_expired' => $this->isExpired(),
        ]);
    }
}
