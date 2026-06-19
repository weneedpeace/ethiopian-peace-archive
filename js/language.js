/* ============================================
   LANGUAGE TOGGLE — Ethiopian Peace Archive
   English, Amharic (አማርኛ), Afan Oromo
   ============================================ */

const translations = {
    en: {
        home: 'Home',
        voices: 'Voices',
        blog: 'Blog',
        courses: 'Courses',
        impact: 'Impact',
        media: 'Media',
        gallery: 'Gallery',
        thanks: 'Thank You',
        contribute: 'Contribute',
        support: 'Support',
        about: 'About',
        contact: 'Contact',
        tagline: '🌍 Global Peace Movement',
        heroTitle: 'Voices of Peace. Power of Unity.',
        heroSub: '1,000+ voices from Ethiopia and the world — preserved, amplified, and driving real change for diaspora and local communities.',
        exploreVoices: '🔍 Explore Voices',
        freeCourses: '🎓 Free Courses',
        supportUs: '❤️ Support',
        ethiopianVoices: 'Ethiopian Voices',
        globalVoices: 'Global Voices',
        regions: 'Regions',
        countries: 'Countries',
        mediaFeatures: 'Media Features',
        whatWeDo: 'What We Do',
        whatWeDoSub: 'A global platform preserving voices, educating communities, and driving peace action.',
        voiceArchive: 'Voice Archive',
        voiceArchiveDesc: 'Browse 1,000+ peace messages from all Ethiopian regions and global supporters.',
        peaceCourses: 'Free Peace Courses',
        peaceCoursesDesc: 'Learn conflict resolution, Ethiopian history, and peacebuilding. No signup required.',
        blogResearch: 'Blog & Research',
        blogResearchDesc: 'Stories from the field, research findings, and updates on peace initiatives.',
        impactDashboard: 'Impact Dashboard',
        impactDashboardDesc: 'Track our global reach. See how voices translate into action worldwide.',
        contributeTitle: 'Contribute',
        contributeDesc: 'Submit your voice, volunteer, partner with us, or share your expertise.',
        supportTitle: 'Support',
        supportDesc: 'Donate, sponsor, advise, or provide materials. Every contribution amplifies peace.',
        joinVoices: '🌍 Join 1,000+ Voices for Peace',
        joinVoicesSub: 'Whether you\'re in Ethiopia or the diaspora — your voice matters.',
        shareYourVoice: 'Share Your Voice →',
        footerTagline: 'A Global Movement for Peace · Built with ❤️ for Ethiopia and the World',
        privacy: 'Privacy',
        terms: 'Terms',
        allRegions: 'All Regions',
        allYears: 'All Years',
        allThemes: 'All Themes',
        allLanguages: 'All Languages',
        allCountries: 'All Countries',
        allContinents: 'All Continents',
        noVoices: 'No voices found.',
        loadingVoices: 'Loading voices...',
        readMore: 'Read More →',
        backToBlog: '← Back to Blog',
        backToCourses: '← Back to Courses',
        viewCourse: 'View Course →',
        submitVoice: 'Submit Your Voice →',
        sendMessage: 'Send Message →'
    },
    am: {
        home: 'መነሻ',
        voices: 'ድምጾች',
        blog: 'ብሎግ',
        courses: 'ኮርሶች',
        impact: 'ተጽዕኖ',
        media: 'ሚዲያ',
        gallery: 'ጋለሪ',
        thanks: 'አመሰግናለሁ',
        contribute: 'አስተዋጽኦ',
        support: 'ድጋፍ',
        about: 'ስለ እኛ',
        contact: 'አድራሻ',
        tagline: '🌍 ዓለም አቀፍ የሰላም ንቅናቄ',
        heroTitle: 'የሰላም ድምጾች። የአንድነት ኃይል።',
        heroSub: 'ከኢትዮጵያ እና ከዓለም ዙሪያ ከ1,000 በላይ ድምጾች — ተጠብቀው፣ ተደምጠው፣ እውነተኛ ለውጥ እያመጡ ነው።',
        exploreVoices: '🔍 ድምጾችን ያስሱ',
        freeCourses: '🎓 ነጻ ኮርሶች',
        supportUs: '❤️ ይደግፉ',
        ethiopianVoices: 'የኢትዮጵያ ድምጾች',
        globalVoices: 'ዓለም አቀፍ ድምጾች',
        regions: 'ክልሎች',
        countries: 'አገራት',
        mediaFeatures: 'ሚዲያ ሽፋን',
        whatWeDo: 'ምን እናደርጋለን',
        shareYourVoice: 'ድምጽዎን ያጋሩ →',
        privacy: 'የግላዊነት',
        terms: 'ውሎች',
        noVoices: 'ምንም ድምጽ አልተገኘም።',
        loadingVoices: 'ድምጾችን በመጫን ላይ...'
    },
    om: {
        home: 'Seensa',
        voices: 'Sagalee',
        blog: 'Blog',
        courses: 'Koorsii',
        impact: 'Dhiibbaa',
        media: 'Miidiyaa',
        gallery: 'Gaalerii',
        thanks: 'Galatoomi',
        contribute: 'Gumaacha',
        support: 'Deeggarsa',
        about: 'Waa\'ee',
        contact: 'Qunnamtii',
        tagline: '🌍 Sochii Nagaa Addunyaa',
        heroTitle: 'Sagalee Nagaa. Humna Tokkummaa.',
        heroSub: 'Sagalee 1,000 ol Itoophiyaa fi addunyaa irraa — kunuunfamanii, ol kaafamanii, jijjiirama dhugaa fidaniiru.',
        exploreVoices: '🔍 Sagalee Hordofaa',
        freeCourses: '🎓 Koorsii Bilisaa',
        supportUs: '❤️ Deeggarsa',
        ethiopianVoices: 'Sagalee Itoophiyaa',
        globalVoices: 'Sagalee Addunyaa',
        regions: 'Naannoo',
        countries: 'Biyyoota',
        mediaFeatures: 'Miidiyaa',
        whatWeDo: 'Maal Hojjenna',
        shareYourVoice: 'Sagalee Kee Qoodi →',
        privacy: 'Iccitii',
        terms: 'Seera',
        noVoices: 'Sagaleen hin argamne.',
        loadingVoices: 'Sagalee fechaa...'
    }
};

let currentLanguage = 'en';

/**
 * Set the language for the entire page
 * @param {string} lang - 'en', 'am', or 'om'
 */
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('epa_language', lang);

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // Update language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === lang) {
            btn.classList.add('active');
            btn.style.background = 'var(--green-dim)';
            btn.style.color = 'var(--green-bright)';
            btn.style.fontWeight = '700';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-dim)';
            btn.style.fontWeight = 'normal';
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;
}

/**
 * Get current language
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Get translation for a key
 */
function t(key) {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
}

// Load saved language on page load
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('epa_language') || 'en';
    setLanguage(saved);
});
