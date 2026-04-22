import { useEffect } from 'react';
import { perfLogger } from './logger';

export function usePerformanceMonitoring() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            return;
        }

        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                perfLogger.logWebVital('LCP', lastEntry.startTime);
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (_e) {
                // Observer not supported
            }

            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const delay = entry.processingStart - entry.startTime;
                    perfLogger.logWebVital('FID', delay);
                }
            });
            
            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (_e) {
                // Observer not supported
            }

            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                perfLogger.logWebVital('CLS', clsValue);
            });
            
            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (_e) {
                // Observer not supported
            }

            window.addEventListener('load', () => {
                const navEntry = performance.getEntriesByType('navigation')[0];
                if (navEntry) {
                    perfLogger.logWebVital('TTFB', navEntry.responseStart);
                    perfLogger.logWebVital('FCP', navEntry.domContentLoadedEventEnd);
                }
            });

            return () => {
                lcpObserver.disconnect();
                fidObserver.disconnect();
                clsObserver.disconnect();
            };
        }
    }, []);
}

export function preloadCriticalImage(src) {
    if (!src || typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
}

export function markPerformance(name) {
    perfLogger.mark(name);
}

export function measurePerformance(name, startMark, endMark) {
    return perfLogger.measure(name, startMark, endMark);
}
