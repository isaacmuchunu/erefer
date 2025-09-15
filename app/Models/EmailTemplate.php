<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject',
        'body_html',
        'body_text',
        'category',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function emailMessages(): HasMany
    {
        return $this->hasMany(EmailMessage::class);
    }

    public function emailCampaigns(): HasMany
    {
        return $this->hasMany(EmailCampaign::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // Methods
    public function render(array $variables = []): array
    {
        $subject = $this->subject;
        $bodyHtml = $this->body_html;
        $bodyText = $this->body_text;

        // Replace variables in template
        foreach ($variables as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $subject = str_replace($placeholder, $value, $subject);
            $bodyHtml = str_replace($placeholder, $value, $bodyHtml);
            $bodyText = str_replace($placeholder, $value, $bodyText);
        }

        return [
            'subject' => $subject,
            'body_html' => $bodyHtml,
            'body_text' => $bodyText,
        ];
    }

    public function getVariableList(): array
    {
        return $this->variables ?? [];
    }

    public function extractVariablesFromContent(): array
    {
        $content = $this->subject . ' ' . $this->body_html . ' ' . $this->body_text;
        preg_match_all('/\{\{([^}]+)\}\}/', $content, $matches);
        
        return array_unique($matches[1] ?? []);
    }
}
