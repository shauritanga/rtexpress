<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_code',
        'name',
        'description',
        'type',
        'channel',
        'subject',
        'content',
        'variables',
        'settings',
        'is_active',
        'is_system',
        'language',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'variables' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    /**
     * Get the user who created this template.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this template.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Render template with variables.
     */
    public function render(array $variables = []): array
    {
        $subject = $this->renderString($this->subject, $variables);
        $content = $this->renderString($this->content, $variables);

        return [
            'subject' => $subject,
            'content' => $content,
        ];
    }

    /**
     * Render string with variables.
     */
    private function renderString(?string $template, array $variables): ?string
    {
        if (!$template) {
            return null;
        }

        foreach ($variables as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $template = str_replace($placeholder, $value, $template);
        }

        return $template;
    }

    /**
     * Get available variables for this template.
     */
    public function getAvailableVariables(): array
    {
        return $this->variables ?? [];
    }

    /**
     * Validate template variables.
     */
    public function validateVariables(array $variables): array
    {
        $required = $this->getRequiredVariables();
        $missing = [];

        foreach ($required as $variable) {
            if (!isset($variables[$variable])) {
                $missing[] = $variable;
            }
        }

        return $missing;
    }

    /**
     * Get required variables for this template.
     */
    public function getRequiredVariables(): array
    {
        $content = $this->subject . ' ' . $this->content;
        preg_match_all('/\{\{([^}]+)\}\}/', $content, $matches);

        return array_unique($matches[1] ?? []);
    }

    /**
     * Clone template with new code.
     */
    public function cloneTemplate(string $newCode, string $newName): self
    {
        $clone = $this->replicate();
        $clone->template_code = $newCode;
        $clone->name = $newName;
        $clone->is_system = false;
        $clone->created_by = auth()->id();
        $clone->updated_by = auth()->id();
        $clone->save();

        return $clone;
    }

    /**
     * Get template preview.
     */
    public function getPreview(): array
    {
        $sampleVariables = $this->getSampleVariables();
        return $this->render($sampleVariables);
    }

    /**
     * Get sample variables for preview.
     */
    private function getSampleVariables(): array
    {
        $samples = [
            'customer_name' => 'John Doe',
            'tracking_number' => 'RT-2024-001234',
            'shipment_status' => 'In Transit',
            'delivery_date' => '2024-07-20',
            'amount' => '$150.00',
            'invoice_number' => 'INV-2024-001',
            'company_name' => 'RT Express',
            'support_email' => 'support@rtexpress.com',
            'support_phone' => '+1-555-0123',
        ];

        $required = $this->getRequiredVariables();
        $result = [];

        foreach ($required as $variable) {
            $result[$variable] = $samples[$variable] ?? '[' . $variable . ']';
        }

        return $result;
    }

    /**
     * Scope for active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for system templates.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope for custom templates.
     */
    public function scopeCustom($query)
    {
        return $query->where('is_system', false);
    }

    /**
     * Scope for templates by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for templates by channel.
     */
    public function scopeByChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope for templates by language.
     */
    public function scopeByLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }
}
