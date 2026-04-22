/**
 * Development-only logger utility
 * Automatically disabled in production builds
 */

const isDev = import.meta.env.DEV;

export const logger = {
    log: (...args) => {
        if (isDev) console.log(...args);
    },
    
    warn: (...args) => {
        if (isDev) console.warn(...args);
    },
    
    error: (...args) => {
        // Always log errors, even in production
        console.error(...args);
    },
    
    debug: (context, message, data = {}) => {
        if (isDev) {
            console.log(`[${context}] ${message}`, data);
        }
    },
    
    group: (label, callback) => {
        if (isDev) {
            console.group(label);
            callback();
            console.groupEnd();
        }
    },
    
    table: (data) => {
        if (isDev) console.table(data);
    },
    
    time: (label) => {
        if (isDev) console.time(label);
    },
    
    timeEnd: (label) => {
        if (isDev) console.timeEnd(label);
    }
};

// Performance monitoring logger (production-safe)
export const perfLogger = {
    mark: (name) => {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark(name);
            if (isDev) {
                console.log(`[Performance] Mark: ${name}`);
            }
        }
    },
    
    measure: (name, startMark, endMark) => {
        if (typeof performance !== 'undefined' && performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
                const entries = performance.getEntriesByName(name);
                if (entries.length > 0) {
                    const duration = entries[0].duration;
                    if (isDev) {
                        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
                    }
                    return duration;
                }
            } catch (e) {
                if (isDev) {
                    console.warn(`[Performance] Failed to measure ${name}:`, e);
                }
            }
        }
        return null;
    },
    
    // Web Vitals logging (production-safe, can be sent to analytics)
    logWebVital: (metric, value) => {
        if (isDev) {
            console.log(`[Web Vital] ${metric}:`, value);
        }
        // In production, send to analytics service
        // Example: sendToAnalytics({ metric, value });
    }
};

export default logger;
