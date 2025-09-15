<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class EmailAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'email_message_id',
        'filename',
        'original_filename',
        'mime_type',
        'size_bytes',
        'storage_path',
        'content_id',
        'is_inline',
    ];

    protected $casts = [
        'is_inline' => 'boolean',
    ];

    // Relationships
    public function emailMessage(): BelongsTo
    {
        return $this->belongsTo(EmailMessage::class);
    }

    // Accessors
    protected function humanReadableSize(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->formatBytes($this->size_bytes)
        );
    }

    protected function downloadUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => route('email.attachment.download', $this->id)
        );
    }

    protected function isImage(): Attribute
    {
        return Attribute::make(
            get: fn () => str_starts_with($this->mime_type, 'image/')
        );
    }

    protected function isDocument(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->mime_type, [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ])
        );
    }

    protected function fileExtension(): Attribute
    {
        return Attribute::make(
            get: fn () => pathinfo($this->original_filename, PATHINFO_EXTENSION)
        );
    }

    // Methods
    public function getContent(): string
    {
        return Storage::disk('private')->get($this->storage_path);
    }

    public function exists(): bool
    {
        return Storage::disk('private')->exists($this->storage_path);
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

    public function getPreviewUrl(): ?string
    {
        if ($this->is_image) {
            return route('email.attachment.preview', $this->id);
        }

        return null;
    }

    public function canBePreviewedInline(): bool
    {
        return $this->is_image || $this->mime_type === 'application/pdf';
    }

    public function getIconClass(): string
    {
        if ($this->is_image) {
            return 'fa-image';
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

    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'human_readable_size' => $this->human_readable_size,
            'download_url' => $this->download_url,
            'preview_url' => $this->getPreviewUrl(),
            'is_image' => $this->is_image,
            'is_document' => $this->is_document,
            'file_extension' => $this->file_extension,
            'icon_class' => $this->getIconClass(),
            'can_preview' => $this->canBePreviewedInline(),
        ]);
    }
}
