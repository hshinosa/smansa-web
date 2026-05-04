<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SiteSettingRequest extends FormRequest
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
        ];

        switch ($section) {
            case 'general':
                $rules['content.site_name'] = 'required|string|max:255';
                $rules['content.email'] = 'nullable|email|max:255';
                $rules['content.phone'] = 'nullable|string|max:50';
                $rules['content.whatsapp'] = 'nullable|string|max:50';
                $rules['content.address'] = 'nullable|string|max:500';
                $rules['content.google_maps_url'] = 'nullable|url|max:1000';
                $rules['content.google_maps_embed_url'] = 'nullable|string|max:2000';
                $rules['content.site_logo'] = 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10240';
                $rules['content.hero_image'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
                break;

            case 'social_media':
                $rules['content.instagram'] = 'nullable|url|max:500';
                $rules['content.facebook'] = 'nullable|url|max:500';
                $rules['content.youtube'] = 'nullable|url|max:500';
                $rules['content.twitter'] = 'nullable|url|max:500';
                $rules['content.linkedin'] = 'nullable|url|max:500';
                break;

            case 'footer':
                $rules['content.copyright_text'] = 'nullable|string|max:255';
                $rules['content.footer_description'] = 'nullable|string|max:1000';
                break;

            case 'announcement':
                $rules['content.enabled'] = 'nullable|boolean';
                $rules['content.text'] = 'nullable|string|max:500';
                $rules['content.link_url'] = 'nullable|url|max:500';
                $rules['content.link_text'] = 'nullable|string|max:100';
                $rules['content.bg_color'] = 'nullable|string|max:20';
                $rules['content.text_color'] = 'nullable|string|max:20';
                break;

            default:
                if (str_starts_with($section, 'hero_')) {
                    $rules['content.title'] = 'nullable|string|max:255';
                    $rules['content.subtitle'] = 'nullable|string|max:500';
                    $rules['content.image_file'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240';
                }
                break;
        }

        return $rules;
    }
}
