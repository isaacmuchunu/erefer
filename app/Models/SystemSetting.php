<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'group',
        'is_public'
    ];

    protected $casts = [
        'is_public' => 'boolean'
    ];

    public function value(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                return match($this->type) {
                    'boolean' => (bool) $value,
                    'integer' => (int) $value,
                    'json' => json_decode($value, true),
                    default => $value
                };
            },
            set: function ($value) {
                return match($this->type) {
                    'boolean' => $value ? '1' : '0',
                    'integer' => (string) $value,
                    'json' => json_encode($value),
                    default => $value
                };
            }
        );
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set($key, $value, $type = 'string')
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type]
        );
    }
}

?>