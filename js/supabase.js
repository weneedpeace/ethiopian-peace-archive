/* ============================================
   SUPABASE CONNECTION — Ethiopian Peace Archive
   All database operations through one file.
   ============================================ */

const SUPABASE_URL = 'https://rnafjznurgnrdonyxfgs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuYWZqem51cmducmRvbnl4ZmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzA1OTEsImV4cCI6MjA5NzM0NjU5MX0.lfJYkGg37CdOwsrvcgvD7I4T054yrPQj-ztfsSo2S0s';

/**
 * Fetch data from Supabase table
 * @param {string} table - Table name
 * @param {string} query - Query string (e.g., 'is_published=eq.true&order=year.desc')
 * @returns {Promise<Array>} - Array of results
 */
async function fetchFromSupabase(table, query = '') {
    try {
        const url = `${SUPABASE_URL}/rest/v1/${table}?select=*${query ? '&' + query : ''}`;
        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch ${table}: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Supabase fetch error (${table}):`, error);
        return [];
    }
}

/**
 * Insert data into Supabase table
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @returns {Promise<boolean>} - Success status
 */
async function insertToSupabase(table, data) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
        });
        return response.ok;
    } catch (error) {
        console.error(`Supabase insert error (${table}):`, error);
        return false;
    }
}

/**
 * Update data in Supabase table
 * @param {string} table - Table name
 * @param {object} data - Data to update
 * @param {string} matchColumn - Column to match (e.g., 'id')
 * @param {*} matchValue - Value to match
 * @returns {Promise<boolean>} - Success status
 */
async function updateInSupabase(table, data, matchColumn, matchValue) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${table}?${matchColumn}=eq.${matchValue}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data)
            }
        );
        return response.ok;
    } catch (error) {
        console.error(`Supabase update error (${table}):`, error);
        return false;
    }
}

/**
 * Delete data from Supabase table
 * @param {string} table - Table name
 * @param {string} matchColumn - Column to match
 * @param {*} matchValue - Value to match
 * @returns {Promise<boolean>} - Success status
 */
async function deleteFromSupabase(table, matchColumn, matchValue) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${table}?${matchColumn}=eq.${matchValue}`,
            {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.ok;
    } catch (error) {
        console.error(`Supabase delete error (${table}):`, error);
        return false;
    }
}

/**
 * Get live counts for dashboard
 * @returns {Promise<object>} - Counts object
 */
async function getLiveCounts() {
    try {
        const [eth, global, media, courses, blogs] = await Promise.all([
            fetchFromSupabase('ethiopian_voices', 'is_published=eq.true'),
            fetchFromSupabase('global_voices', 'is_published=eq.true'),
            fetchFromSupabase('media_coverage', 'is_published=eq.true'),
            fetchFromSupabase('courses', 'is_published=eq.true'),
            fetchFromSupabase('blog_posts', 'is_published=eq.true')
        ]);

        return {
            ethiopianVoices: eth.length,
            globalVoices: global.length,
            regions: new Set(eth.map(v => v.region).filter(Boolean)).size,
            countries: new Set(global.map(v => v.country).filter(Boolean)).size,
            mediaFeatures: media.length,
            courses: courses.length,
            blogPosts: blogs.length,
            totalVoices: eth.length + global.length
        };
    } catch (error) {
        console.error('Error getting counts:', error);
        return null;
    }
}

/**
 * Get voices with filters
 * @param {string} type - 'ethiopian' or 'global'
 * @param {object} filters - Filter object {region, year, theme, language, country, continent}
 * @returns {Promise<Array>} - Filtered voices
 */
async function getFilteredVoices(type = 'ethiopian', filters = {}) {
    const table = type === 'ethiopian' ? 'ethiopian_voices' : 'global_voices';
    let query = 'is_published=eq.true&order=year.desc';

    if (filters.region) query += `&region=eq.${encodeURIComponent(filters.region)}`;
    if (filters.year) query += `&year=eq.${filters.year}`;
    if (filters.country) query += `&country=eq.${encodeURIComponent(filters.country)}`;
    if (filters.continent) query += `&continent=eq.${encodeURIComponent(filters.continent)}`;

    return await fetchFromSupabase(table, query);
}

/**
 * Submit a voice from the contribute form
 * @param {object} voiceData - Voice submission data
 * @returns {Promise<boolean>} - Success status
 */
async function submitVoice(voiceData) {
    const data = {
        document_id: 'SUB-' + Date.now(),
        region: voiceData.location,
        language: voiceData.language,
        year: new Date().getFullYear(),
        quote_original: voiceData.message,
        quote_english: voiceData.message,
        themes: ['Peace'],
        sentiment: 0.95,
        is_published: false
    };
    return await insertToSupabase('ethiopian_voices', data);
}
