<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EmailFolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'color',
        'sort_order',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function emailMessages(): BelongsToMany
    {
        return $this->belongsToMany(EmailMessage::class, 'email_message_folders')
                    ->withPivot('user_id')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    public function scopeCustom($query)
    {
        return $query->where('is_system', false);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Methods
    public function getUnreadCount(): int
    {
        return $this->emailMessages()
            ->wherePivot('user_id', $this->user_id)
            ->where('status', '!=', 'read')
            ->count();
    }

    public function getTotalCount(): int
    {
        return $this->emailMessages()
            ->wherePivot('user_id', $this->user_id)
            ->count();
    }

    public static function createDefaultFolders(User $user): void
    {
        $defaultFolders = [
            ['name' => 'Inbox', 'type' => 'inbox', 'sort_order' => 1, 'is_system' => true],
            ['name' => 'Sent', 'type' => 'sent', 'sort_order' => 2, 'is_system' => true],
            ['name' => 'Drafts', 'type' => 'drafts', 'sort_order' => 3, 'is_system' => true],
            ['name' => 'Trash', 'type' => 'trash', 'sort_order' => 4, 'is_system' => true],
            ['name' => 'Spam', 'type' => 'spam', 'sort_order' => 5, 'is_system' => true],
        ];

        foreach ($defaultFolders as $folderData) {
            self::create(array_merge($folderData, ['user_id' => $user->id]));
        }
    }
}
