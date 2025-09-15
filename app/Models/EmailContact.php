<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class EmailContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'name',
        'organization',
        'phone',
        'notes',
        'custom_fields',
        'is_favorite',
        'email_count',
        'last_email_at',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'is_favorite' => 'boolean',
        'last_email_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(EmailContactGroup::class, 'email_contact_group_members');
    }

    // Accessors
    protected function displayName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->name ?: $this->email
        );
    }

    protected function initials(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->name 
                ? collect(explode(' ', $this->name))->map(fn($word) => strtoupper(substr($word, 0, 1)))->join('')
                : strtoupper(substr($this->email, 0, 2))
        );
    }

    // Scopes
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeFavorites($query)
    {
        return $query->where('is_favorite', true);
    }

    public function scopeByEmail($query, string $email)
    {
        return $query->where('email', 'like', "%{$email}%");
    }

    public function scopeByName($query, string $name)
    {
        return $query->where('name', 'like', "%{$name}%");
    }

    public function scopeByOrganization($query, string $organization)
    {
        return $query->where('organization', 'like', "%{$organization}%");
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('last_email_at', '>=', now()->subDays($days));
    }

    public function scopeFrequent($query, int $minEmails = 5)
    {
        return $query->where('email_count', '>=', $minEmails);
    }

    // Methods
    public function incrementEmailCount(): void
    {
        $this->increment('email_count');
        $this->update(['last_email_at' => now()]);
    }

    public function toggleFavorite(): bool
    {
        $this->update(['is_favorite' => !$this->is_favorite]);
        return $this->is_favorite;
    }

    public function addToGroup(EmailContactGroup $group): void
    {
        $this->groups()->syncWithoutDetaching($group->id);
    }

    public function removeFromGroup(EmailContactGroup $group): void
    {
        $this->groups()->detach($group->id);
    }

    public function updateCustomField(string $key, $value): void
    {
        $customFields = $this->custom_fields ?? [];
        $customFields[$key] = $value;
        $this->update(['custom_fields' => $customFields]);
    }

    public function getCustomField(string $key, $default = null)
    {
        return $this->custom_fields[$key] ?? $default;
    }

    public static function findOrCreateByEmail(int $userId, string $email, array $attributes = []): self
    {
        return static::firstOrCreate(
            ['user_id' => $userId, 'email' => $email],
            array_merge($attributes, ['email_count' => 0])
        );
    }

    public function getRecentEmails(int $limit = 10)
    {
        return EmailMessage::forUser($this->user_id)
            ->where(function ($query) {
                $query->where('sender_email', $this->email)
                      ->orWhereJsonContains('recipients->to', $this->email)
                      ->orWhereJsonContains('recipients->cc', $this->email);
            })
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }

    public function getEmailStats(): array
    {
        $emails = $this->getRecentEmails(100);
        
        return [
            'total_emails' => $this->email_count,
            'sent_to_contact' => $emails->where('type', 'outbound')->count(),
            'received_from_contact' => $emails->where('type', 'inbound')->count(),
            'last_email_date' => $this->last_email_at?->format('Y-m-d'),
            'avg_response_time' => $this->calculateAverageResponseTime($emails),
        ];
    }

    private function calculateAverageResponseTime($emails): ?float
    {
        $responseTimes = [];
        $inboundEmails = $emails->where('type', 'inbound')->sortBy('created_at');
        
        foreach ($inboundEmails as $inbound) {
            $response = $emails->where('type', 'outbound')
                ->where('created_at', '>', $inbound->created_at)
                ->sortBy('created_at')
                ->first();
                
            if ($response) {
                $responseTimes[] = $inbound->created_at->diffInHours($response->created_at);
            }
        }
        
        return empty($responseTimes) ? null : array_sum($responseTimes) / count($responseTimes);
    }

    public function export(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'organization' => $this->organization,
            'phone' => $this->phone,
            'notes' => $this->notes,
            'is_favorite' => $this->is_favorite,
            'email_count' => $this->email_count,
            'last_email_at' => $this->last_email_at?->toISOString(),
            'custom_fields' => $this->custom_fields,
            'groups' => $this->groups->pluck('name')->toArray(),
        ];
    }

    public static function import(int $userId, array $data): self
    {
        $contact = static::findOrCreateByEmail($userId, $data['email'], [
            'name' => $data['name'] ?? null,
            'organization' => $data['organization'] ?? null,
            'phone' => $data['phone'] ?? null,
            'notes' => $data['notes'] ?? null,
            'custom_fields' => $data['custom_fields'] ?? [],
            'is_favorite' => $data['is_favorite'] ?? false,
        ]);

        // Add to groups if specified
        if (!empty($data['groups'])) {
            $user = User::find($userId);
            foreach ($data['groups'] as $groupName) {
                $group = EmailContactGroup::firstOrCreate([
                    'user_id' => $userId,
                    'name' => $groupName
                ]);
                $contact->addToGroup($group);
            }
        }

        return $contact;
    }
}
