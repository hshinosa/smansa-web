import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

const ADMIN_RESOURCES = [
  {
    id: 'T1.1',
    name: 'Dashboard',
    url: '/admin/dashboard',
    headingText: /Dashboard/,
    sidebarPath: ['Dashboard Utama'],
    submenu: false
  },
  {
    id: 'T2.1',
    name: 'Posts',
    url: '/admin/posts',
    headingText: /Berita|Posts/,
    sidebarPath: ['Master Data & Berita', 'Berita & Pengumuman'],
    submenu: true
  },
  {
    id: 'T2.2',
    name: 'Instagram Bots',
    url: '/admin/instagram-bots',
    headingText: /Instagram|Bot/,
    sidebarPath: ['Master Data & Berita', 'Instagram Bots'],
    submenu: true
  },
  {
    id: 'T2.3',
    name: 'Teachers',
    url: '/admin/teachers',
    headingText: /Guru|Teachers/,
    sidebarPath: ['Master Data & Berita', 'Guru & Staff'],
    submenu: true
  },
  {
    id: 'T2.4',
    name: 'Extracurriculars',
    url: '/admin/extracurriculars',
    headingText: /Ekstrakurikuler/,
    sidebarPath: ['Master Data & Berita', 'Ekstrakurikuler'],
    submenu: true
  },
  {
    id: 'T2.5',
    name: 'Alumni',
    url: '/admin/alumni',
    headingText: /Alumni/,
    sidebarPath: ['Master Data & Berita', 'Jejak Alumni'],
    submenu: true
  },
  {
    id: 'T2.6',
    name: 'PTN Admissions',
    url: '/admin/ptn-admissions',
    headingText: /PTN|Serapan/,
    sidebarPath: ['Master Data & Berita', 'Serapan PTN'],
    submenu: true
  },
  {
    id: 'T2.7',
    name: 'TKA Averages',
    url: '/admin/tka-averages',
    headingText: /TKA/,
    sidebarPath: ['Master Data & Berita', 'Hasil TKA'],
    submenu: true
  },
  {
    id: 'T2.8',
    name: 'Galleries',
    url: '/admin/galleries',
    headingText: /Galeri|Gallery/,
    sidebarPath: ['Master Data & Berita', 'Galeri Sekolah'],
    submenu: true
  },
  {
    id: 'T2.9',
    name: 'FAQs',
    url: '/admin/faqs',
    headingText: /FAQ/,
    sidebarPath: ['Master Data & Berita', 'FAQ'],
    submenu: true
  },
  {
    id: 'T2.10',
    name: 'Seragam',
    url: '/admin/seragam',
    headingText: /Seragam/,
    sidebarPath: ['Master Data & Berita', 'Seragam'],
    submenu: true
  },
  {
    id: 'T3.1',
    name: 'Contact Messages',
    url: '/admin/contact-messages',
    headingText: /Pesan|Messages/,
    sidebarPath: ['Pesan Kontak'],
    submenu: false
  },
  {
    id: 'T4.1',
    name: 'Landing Page Content',
    url: '/admin/landing-page-content',
    headingText: /Landing Page/,
    sidebarPath: ['Kelola Konten Utama', 'Landing Page'],
    submenu: true
  },
  {
    id: 'T4.2',
    name: 'SPMB Content',
    url: '/admin/spmb-content',
    headingText: /SPMB/,
    sidebarPath: ['Kelola Konten Utama', 'Informasi SPMB'],
    submenu: true
  },
  {
    id: 'T4.3',
    name: 'Program Studi',
    url: '/admin/program-studi',
    headingText: /Program Studi/,
    sidebarPath: ['Kelola Konten Utama', 'Program Studi'],
    submenu: true
  },
  {
    id: 'T4.4',
    name: 'School Profile',
    url: '/admin/school-profile',
    headingText: /Profil Sekolah/,
    sidebarPath: ['Kelola Konten Utama', 'Profil Sekolah'],
    submenu: true
  },
  {
    id: 'T4.5',
    name: 'Curriculum',
    url: '/admin/kurikulum',
    headingText: /Kurikulum/,
    sidebarPath: ['Kelola Konten Utama', 'Kurikulum'],
    submenu: true
  },
  {
    id: 'T4.6',
    name: 'Academic Calendar',
    url: '/admin/academic-calendar',
    headingText: /Kalender|Calendar/,
    sidebarPath: ['Kelola Konten Utama', 'Kalender Akademik'],
    submenu: true
  },
  {
    id: 'T4.7',
    name: 'Programs',
    url: '/admin/programs',
    headingText: /Program/,
    sidebarPath: ['Kelola Konten Utama', 'Program'],
    submenu: true
  },
  {
    id: 'T5.1',
    name: 'RAG Documents',
    url: '/admin/rag-documents',
    headingText: /RAG|Documents/,
    sidebarPath: ['AI & RAG System', 'RAG Documents'],
    submenu: true
  },
  {
    id: 'T5.2',
    name: 'AI Settings',
    url: '/admin/ai-settings',
    headingText: /AI|Settings/,
    sidebarPath: ['AI & RAG System', 'AI Settings'],
    submenu: true
  },
  {
    id: 'T6.1',
    name: 'Site Settings',
    url: '/admin/site-settings',
    headingText: /Pengaturan|Settings/,
    sidebarPath: ['Pengaturan Situs'],
    submenu: false
  }
];

test.describe('Admin Resources Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page).toHaveTitle(/Login|Masuk/);
    await page.fill('#email', ADMIN_EMAIL);
    await page.fill('#password', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
  });

  for (const resource of ADMIN_RESOURCES) {
    test(`${resource.id}: ${resource.name} - Direct URL navigation`, async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(resource.url);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      await expect(page).toHaveURL(resource.url);
      
      const heading = page.locator('h1, h2').first();
      await expect(heading).toContainText(resource.headingText);
      
      // console.log(`[${resource.id}] ${resource.name} loaded in ${loadTime}ms`);
      
      await page.screenshot({ 
        path: `test-results/admin-${resource.id.toLowerCase()}-${resource.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true
      });
    });
  }

  for (const resource of ADMIN_RESOURCES.filter(r => r.submenu)) {
    test(`${resource.id}: ${resource.name} - Sidebar navigation`, async ({ page }) => {
      await page.goto('/admin/dashboard');
      await page.waitForLoadState('networkidle');
      
      const parentMenu = resource.sidebarPath[0];
      const parentButton = page.locator('button').filter({ hasText: new RegExp(parentMenu, 'i') });
      
      const isExpanded = await parentButton.getAttribute('aria-expanded').catch(() => 'false');
      if (isExpanded !== 'true') {
        await parentButton.click();
        await page.waitForTimeout(300);
      }
      
      const submenuItem = resource.sidebarPath[1];
      await page.click(`text=${submenuItem}`);
      
      await page.waitForURL(`**${resource.url}`, { timeout: 10000 });
      
      const heading = page.locator('h1, h2').first();
      await expect(heading).toContainText(resource.headingText);
    });
  }

  test('Verify consistent admin layout across all pages', async ({ page }) => {
    const results = [];
    
    for (const resource of ADMIN_RESOURCES) {
      await page.goto(resource.url);
      await page.waitForLoadState('networkidle');
      
      const hasSidebar = await page.locator('aside, nav[class*="sidebar"]').isVisible().catch(() => false);
      const hasHeader = await page.locator('header, h1, h2').first().isVisible().catch(() => false);
      const hasContent = await page.locator('main, [class*="content"]').first().isVisible().catch(() => false);
      
      results.push({
        name: resource.name,
        url: resource.url,
        hasSidebar,
        hasHeader,
        hasContent
      });
    }
    
    // console.table(results);
    
    for (const result of results) {
      expect(result.hasHeader, `${result.name} should have header`).toBe(true);
      expect(result.hasContent, `${result.name} should have content`).toBe(true);
    }
  });
});
