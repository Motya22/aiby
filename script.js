const supportedLangs = ['en', 'de', 'fr', 'es', 'ja', 'pt'];
const urlParams = new URLSearchParams(window.location.search);
let lang = urlParams.get('lang');

if (!lang || !supportedLangs.includes(lang)) {
    const systemLang = navigator.language.slice(0, 2).toLowerCase();

    lang = supportedLangs.includes(systemLang) ? systemLang : 'en';
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`./assets/i18n/${lang}.json`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.error(`Translation load error for ${lang}:`, e);

        if (lang !== 'en') {
            console.log('Trying fallback to English...');

            return await loadTranslations('en');
        }

        return {};
    }
}

function interpolateFromDataAttrs(template, element) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
        const dataValue = element.dataset[key];

        return dataValue !== undefined ? dataValue : `{{${key}}}`;
    });
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        let value = translations[key];

        if (!value) {
            console.warn(`Missing translation for key: ${key}`);

            return;
        }

        value = interpolateFromDataAttrs(value, el);

        if (typeof DOMPurify !== 'undefined') {
            el.innerHTML = DOMPurify.sanitize(value);
        } else {
            console.warn('DOMPurify not found, using textContent as fallback');

            el.textContent = value;
        }
    });
}

(async () => {
    const translations = await loadTranslations(lang);

    applyTranslations(translations);

    document.documentElement.lang = lang;
})();
