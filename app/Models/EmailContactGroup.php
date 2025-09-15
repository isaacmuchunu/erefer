<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class EmailContactGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'color',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(EmailContact::class, 'email_contact_group_members');
    }

    // Accessors
    protected function contactCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->contacts()->count()
        );
    }

    // Scopes
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByName($query, string $name)
    {
        return $query->where('name', 'like', "%{$name}%");
    }

    // Methods
    public function addContact(EmailContact $contact): void
    {
        $this->contacts()->syncWithoutDetaching($contact->id);
    }

    public function removeContact(EmailContact $contact): void
    {
        $this->contacts()->detach($contact->id);
    }

    public function addContacts(array $contactIds): void
    {
        $this->contacts()->syncWithoutDetaching($contactIds);
    }

    public function removeContacts(array $contactIds): void
    {
        $this->contacts()->detach($contactIds);
    }

    public function getContactEmails(): array
    {
        return $this->contacts()->pluck('email')->toArray();
    }

    public function canBeDeletedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }
}
