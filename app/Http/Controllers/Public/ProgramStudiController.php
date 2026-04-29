<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ProgramStudiSetting;
use App\Services\ImageService;
use Inertia\Inertia;

/**
 * Controller for public program studi pages (MIPA, IPS, Bahasa)
 * Refactored from routes/web.php closure
 */
class ProgramStudiController extends Controller
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    protected function getProgramData(string $programName): array
    {
        $settings = ProgramStudiSetting::where('program_name', $programName)
            ->with('media')
            ->get()
            ->keyBy('section_key');

        $pageData = [];
        foreach (array_keys(ProgramStudiSetting::getSectionFields()) as $key) {
            $dbRow = $settings->get($key);
            $dbContent = ($dbRow && isset($dbRow['content'])) ? $dbRow['content'] : null;
            $content = ProgramStudiSetting::getContent($key, $dbContent);

            if ($dbRow) {
                if ($key === 'hero') {
                    $media = $this->imageService->getFirstMediaData($dbRow, 'hero_background_image');
                    if ($media) {
                        $content['background_image'] = $media;
                    }
                }
                if ($key === 'facilities') {
                    $media = $this->imageService->getFirstMediaData($dbRow, 'facilities_main_image');
                    if ($media) {
                        $content['main_image'] = $media;
                    }

                    if (isset($content['items']) && is_array($content['items'])) {
                        foreach ($content['items'] as $index => &$item) {
                            $itemMedia = $this->imageService->getFirstMediaData($dbRow, "facilities_item_{$index}_image");
                            if ($itemMedia) {
                                $item['image'] = $itemMedia['original_url'];
                            }
                        }
                    }
                }
            }

            $pageData[$key] = $content;
        }

        return $pageData;
    }

    protected function renderProgram(string $programName)
    {
        return Inertia::render('ProgramStudiPage', [
            'content' => $this->getProgramData($programName),
            'programName' => $programName,
        ]);
    }

    public function mipa()
    {
        return $this->renderProgram('mipa');
    }

    public function ips()
    {
        return $this->renderProgram('ips');
    }

    public function bahasa()
    {
        return $this->renderProgram('bahasa');
    }
}
