<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class AcademicDocument extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'year',
        'description',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'year' => 'integer',
    ];

    protected $appends = ['pdf_url'];

    public function getPdfUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('documents');
        if (! $media) {
            return null;
        }

        $url = $media->getUrl();

        return str_replace('/storage/', '/media/', $url);
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('documents')
            ->acceptsMimeTypes(['application/pdf'])
            ->singleFile();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('year', 'desc')->orderBy('sort_order')->orderBy('title');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByYear($query, int $year)
    {
        return $query->where('year', $year);
    }
}
