<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CurriculumUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('admin') !== null;
    }

    public function rules(): array
    {
        $section = $this->input('section');
        $rules = [
            'section' => 'required|string',
            'content' => 'required|array',
            'media' => 'nullable|file|image|max:10240',
        ];

        switch ($section) {
            case 'hero':
                $rules['content.title'] = 'required|string|max:255';
                $rules['content.subtitle'] = 'nullable|string|max:500';
                break;

            case 'problem':
                $rules['content.title'] = 'required|string|max:255';
                $rules['content.description'] = 'nullable|string|max:2000';
                $rules['content.stats'] = 'nullable|array';
                $rules['content.stats.*.label'] = 'nullable|string|max:100';
                $rules['content.stats.*.value'] = 'nullable|string|max:50';
                break;

            case 'definition':
            case 'principles':
            case 'learning_cycle':
            case 'design_framework':
            case 'competency_dimensions':
            case 'learner_profile':
                $rules['content.title'] = 'required|string|max:255';
                $rules['content.description'] = 'nullable|string|max:2000';
                $rules['content.items'] = 'nullable|array';
                $rules['content.items.*.title'] = 'nullable|string|max:255';
                $rules['content.items.*.description'] = 'nullable|string|max:1000';
                break;

            case 'journey':
                $rules['content.title'] = 'required|string|max:255';
                $rules['content.items'] = 'nullable|array';
                $rules['content.items.*.year'] = 'nullable|string|max:20';
                $rules['content.items.*.title'] = 'nullable|string|max:255';
                $rules['content.items.*.description'] = 'nullable|string|max:1000';
                break;
        }

        return $rules;
    }
}
