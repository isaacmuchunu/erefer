<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class WhatsAppTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_account_id',
        'template_id',
        'name',
        'language',
        'category',
        'status',
        'components',
        'variables',
        'rejection_reason',
        'approved_at',
    ];

    protected $casts = [
        'components' => 'array',
        'variables' => 'array',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function businessAccount(): BelongsTo
    {
        return $this->belongsTo(WhatsAppBusinessAccount::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class, 'template_id');
    }

    // Accessors
    protected function isApproved(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'approved'
        );
    }

    protected function isPending(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'pending'
        );
    }

    protected function isRejected(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'rejected'
        );
    }

    protected function isDisabled(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'disabled'
        );
    }

    protected function headerComponent(): Attribute
    {
        return Attribute::make(
            get: fn () => collect($this->components)->firstWhere('type', 'header')
        );
    }

    protected function bodyComponent(): Attribute
    {
        return Attribute::make(
            get: fn () => collect($this->components)->firstWhere('type', 'body')
        );
    }

    protected function footerComponent(): Attribute
    {
        return Attribute::make(
            get: fn () => collect($this->components)->firstWhere('type', 'footer')
        );
    }

    protected function buttonComponents(): Attribute
    {
        return Attribute::make(
            get: fn () => collect($this->components)->where('type', 'buttons')->first()['buttons'] ?? []
        );
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    public function scopeForBusinessAccount($query, int $businessAccountId)
    {
        return $query->where('business_account_id', $businessAccountId);
    }

    // Methods
    public function canBeUsed(): bool
    {
        return $this->is_approved;
    }

    public function getVariableCount(): int
    {
        $count = 0;
        
        foreach ($this->components as $component) {
            if (isset($component['parameters'])) {
                $count += count($component['parameters']);
            }
            
            if (isset($component['text'])) {
                preg_match_all('/\{\{(\d+)\}\}/', $component['text'], $matches);
                $count += count($matches[1]);
            }
        }
        
        return $count;
    }

    public function getRequiredVariables(): array
    {
        $variables = [];
        
        foreach ($this->components as $component) {
            if (isset($component['text'])) {
                preg_match_all('/\{\{(\d+)\}\}/', $component['text'], $matches);
                foreach ($matches[1] as $variableIndex) {
                    $variables[] = (int) $variableIndex;
                }
            }
        }
        
        return array_unique($variables);
    }

    public function preview(array $variables = []): array
    {
        $preview = [];
        
        foreach ($this->components as $component) {
            $componentPreview = $component;
            
            if (isset($component['text'])) {
                $text = $component['text'];
                
                // Replace variables
                foreach ($variables as $index => $value) {
                    $text = str_replace("{{" . ($index + 1) . "}}", $value, $text);
                }
                
                $componentPreview['text'] = $text;
            }
            
            $preview[] = $componentPreview;
        }
        
        return $preview;
    }

    public function render(array $variables = []): string
    {
        $output = [];
        
        // Header
        if ($this->header_component) {
            $header = $this->header_component;
            if (isset($header['text'])) {
                $text = $header['text'];
                foreach ($variables as $index => $value) {
                    $text = str_replace("{{" . ($index + 1) . "}}", $value, $text);
                }
                $output[] = "**{$text}**";
            }
        }
        
        // Body
        if ($this->body_component) {
            $body = $this->body_component;
            if (isset($body['text'])) {
                $text = $body['text'];
                foreach ($variables as $index => $value) {
                    $text = str_replace("{{" . ($index + 1) . "}}", $value, $text);
                }
                $output[] = $text;
            }
        }
        
        // Footer
        if ($this->footer_component) {
            $footer = $this->footer_component;
            if (isset($footer['text'])) {
                $output[] = "_{$footer['text']}_";
            }
        }
        
        // Buttons
        if (!empty($this->button_components)) {
            $buttons = [];
            foreach ($this->button_components as $button) {
                $buttons[] = "[{$button['text']}]";
            }
            $output[] = implode(' ', $buttons);
        }
        
        return implode("\n\n", $output);
    }

    public function getUsageStats(int $days = 30): array
    {
        $startDate = now()->subDays($days);
        
        $messages = $this->messages()
            ->where('created_at', '>=', $startDate)
            ->get();
        
        return [
            'total_sent' => $messages->count(),
            'delivered' => $messages->where('status', 'delivered')->count(),
            'read' => $messages->where('status', 'read')->count(),
            'failed' => $messages->where('status', 'failed')->count(),
            'delivery_rate' => $messages->count() > 0 
                ? ($messages->where('status', 'delivered')->count() / $messages->count()) * 100 
                : 0,
            'read_rate' => $messages->where('status', 'delivered')->count() > 0 
                ? ($messages->where('status', 'read')->count() / $messages->where('status', 'delivered')->count()) * 100 
                : 0,
        ];
    }

    public function duplicate(string $newName = null): self
    {
        $newTemplate = $this->replicate();
        $newTemplate->name = $newName ?: $this->name . '_copy';
        $newTemplate->template_id = null;
        $newTemplate->status = 'pending';
        $newTemplate->approved_at = null;
        $newTemplate->rejection_reason = null;
        $newTemplate->save();
        
        return $newTemplate;
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'is_approved' => $this->is_approved,
            'is_pending' => $this->is_pending,
            'is_rejected' => $this->is_rejected,
            'is_disabled' => $this->is_disabled,
            'variable_count' => $this->getVariableCount(),
            'required_variables' => $this->getRequiredVariables(),
            'can_be_used' => $this->canBeUsed(),
        ]);
    }
}
