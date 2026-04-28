<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AcademicDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = AcademicDocument::query()->ordered();

        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('year') && $request->year) {
            $query->where('year', $request->year);
        }

        $documents = $query->get()->map(function ($doc) {
            return [
                'id' => $doc->id,
                'title' => $doc->title,
                'slug' => $doc->slug,
                'category' => $doc->category,
                'year' => $doc->year,
                'description' => $doc->description,
                'sort_order' => $doc->sort_order,
                'is_active' => $doc->is_active,
                'pdf_url' => $doc->pdf_url,
            ];
        });

        return inertia('Admin/AcademicDocumentPage', [
            'documents' => $documents,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:academic_documents,slug',
            'category' => 'required|string|max:255',
            'year' => 'required|integer|min:2000|max:2100',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'pdf' => 'required|file|mimes:pdf|max:10240',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $originalSlug = $validated['slug'];
        $counter = 1;
        while (AcademicDocument::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug.'-'.$counter;
            $counter++;
        }

        if (! isset($validated['sort_order'])) {
            $validated['sort_order'] = AcademicDocument::where('year', $validated['year'])->max('sort_order') + 1;
        }

        $document = AcademicDocument::create($validated);

        if ($request->hasFile('pdf')) {
            $document->addMediaFromRequest('pdf')->toMediaCollection('documents');
        }

        return redirect()->route('admin.academic-documents.index')
            ->with('success', 'Dokumen berhasil ditambahkan.');
    }

    public function update(Request $request, AcademicDocument $academicDocument)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('academic_documents', 'slug')->ignore($academicDocument->id)],
            'category' => 'required|string|max:255',
            'year' => 'required|integer|min:2000|max:2100',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'pdf' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $academicDocument->update($validated);

        if ($request->hasFile('pdf')) {
            $academicDocument->clearMediaCollection('documents');
            $academicDocument->addMediaFromRequest('pdf')->toMediaCollection('documents');
        }

        return redirect()->route('admin.academic-documents.index')
            ->with('success', 'Dokumen berhasil diperbarui.');
    }

    public function destroy(AcademicDocument $academicDocument)
    {
        $academicDocument->delete();

        return redirect()->route('admin.academic-documents.index')
            ->with('success', 'Dokumen berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:academic_documents,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            AcademicDocument::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Urutan berhasil diperbarui.']);
    }
}
