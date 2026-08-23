// supabase-config.js - MINIMAL VERSION
// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_URL = 'https://aqrwojihqnooaxiytgmv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_S1SjM1Gq-LxeCZks88QwgQ_rbXus_';

// Create the client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase connected!');

// ============================================================
// BASIC FUNCTIONS (MINIMAL)
// ============================================================

async function getUserByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function createUser(userData) {
    const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();
    if (error) throw error;
    return data;
}

async function createProfile(profileData) {
    const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select();
    if (error) throw error;
    return data;
}

async function createApplication(appData) {
    const { data, error } = await supabase
        .from('applications')
        .insert([appData])
        .select();
    if (error) throw error;
    return data;
}

async function createPermit(permitData) {
    const { data, error } = await supabase
        .from('permits')
        .insert([permitData])
        .select();
    if (error) throw error;
    return data;
}

async function createNotification(notifData) {
    const { data, error } = await supabase
        .from('notifications')
        .insert([notifData])
        .select();
    if (error) throw error;
    return data;
}

console.log('✅ Supabase functions ready!');