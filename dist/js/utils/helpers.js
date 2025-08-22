/**
 * PersonalitySpark - Utility Helper Functions
 * Common utility functions used throughout the application
 */

/**
 * Debounce function to limit how often a function can be called
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Throttle function to limit execution frequency
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate a random UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Validate email address
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize HTML content
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Format date for display
 */
function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleDateString();
    } else if (format === 'long') {
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (format === 'relative') {
        return formatRelativeDate(d);
    }
    
    return d.toString();
}

/**
 * Format relative date (e.g., "2 hours ago")
 */
function formatRelativeDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

/**
 * Format duration in seconds to human readable format
 */
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `0:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert camelCase to Title Case
 */
function camelToTitle(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}

/**
 * Generate random number between min and max (inclusive)
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const clonedObj = {};
        Object.keys(obj).forEach(key => {
            clonedObj[key] = deepClone(obj[key]);
        });
        return clonedObj;
    }
}

/**
 * Check if object is empty
 */
function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Get query parameter from URL
 */
function getQueryParam(param, url = window.location.href) {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get(param);
}

/**
 * Set query parameter in URL
 */
function setQueryParam(param, value, url = window.location.href) {
    const urlObj = new URL(url);
    urlObj.searchParams.set(param, value);
    return urlObj.toString();
}

/**
 * Remove query parameter from URL
 */
function removeQueryParam(param, url = window.location.href) {
    const urlObj = new URL(url);
    urlObj.searchParams.delete(param);
    return urlObj.toString();
}

/**
 * Check if device is mobile
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is iOS
 */
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if device is Android
 */
function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

/**
 * Check if browser supports a feature
 */
function supportsFeature(feature) {
    const features = {
        webgl: () => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
            } catch (e) {
                return false;
            }
        },
        webworker: () => typeof Worker !== 'undefined',
        localstorage: () => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        },
        serviceworker: () => 'serviceWorker' in navigator,
        pushnotifications: () => 'PushManager' in window,
        webshare: () => 'share' in navigator,
        geolocation: () => 'geolocation' in navigator,
        camera: () => 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        vibration: () => 'vibrate' in navigator
    };
    
    return features[feature] ? features[feature]() : false;
}

/**
 * Smooth scroll to element
 */
function scrollToElement(element, offset = 0) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Check if element is in viewport
 */
function isInViewport(element, threshold = 0) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
        rect.top <= windowHeight - threshold &&
        rect.bottom >= threshold &&
        rect.left <= windowWidth - threshold &&
        rect.right >= threshold
    );
}

/**
 * Wait for specified time (Promise-based delay)
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, i);
            await sleep(delay);
        }
    }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate color from string (for consistent avatars, etc.)
 */
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
}

/**
 * Check if color is light or dark
 */
function isLightColor(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('Failed to copy using Clipboard API:', error);
        }
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (error) {
        document.body.removeChild(textArea);
        console.warn('Failed to copy using fallback method:', error);
        return false;
    }
}

/**
 * Download data as file
 */
function downloadAsFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

/**
 * Calculate percentage
 */
function calculatePercentage(value, total, decimals = 0) {
    if (total === 0) return 0;
    return Number(((value / total) * 100).toFixed(decimals));
}

/**
 * Clamp number between min and max
 */
function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

/**
 * Linear interpolation
 */
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

/**
 * Map number from one range to another
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Get contrast color (white or black) for a given background color
 */
function getContrastColor(hexcolor) {
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

/**
 * Parse CSS time value to milliseconds
 */
function parseTimeToMs(timeStr) {
    const value = parseFloat(timeStr);
    if (timeStr.includes('ms')) {
        return value;
    } else if (timeStr.includes('s')) {
        return value * 1000;
    }
    return value;
}

/**
 * Create element with attributes
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key.startsWith('data-')) {
            element.setAttribute(key, value);
        } else {
            element[key] = value;
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    
    return element;
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
    window.PSHelpers = {
        debounce,
        throttle,
        generateUUID,
        validateEmail,
        sanitizeHTML,
        formatDate,
        formatRelativeDate,
        formatDuration,
        capitalize,
        camelToTitle,
        randomBetween,
        shuffleArray,
        deepClone,
        isEmptyObject,
        getQueryParam,
        setQueryParam,
        removeQueryParam,
        isMobile,
        isIOS,
        isAndroid,
        supportsFeature,
        scrollToElement,
        isInViewport,
        sleep,
        retryWithBackoff,
        formatFileSize,
        stringToColor,
        isLightColor,
        copyToClipboard,
        downloadAsFile,
        calculatePercentage,
        clamp,
        lerp,
        mapRange,
        getContrastColor,
        parseTimeToMs,
        createElement
    };
}