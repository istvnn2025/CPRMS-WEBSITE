// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

// Your Supabase credentials
const SUPABASE_URL = 'https://aqrwojihqnooaxiytgmv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_S1SjM1Gq-LxeCZks88QwgQ_rbXus_';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase connected!');
console.log('🔗 URL:', SUPABASE_URL);

// ============================================================
// DATABASE FUNCTIONS
// ============================================================

// ---- USERS ----
async function createUser(userData) {
    const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();
    if (error) throw error;
    return data;
}

async function getUserByEmail(email) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function updateUser(email, updates) {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('email', email)
        .select();
    if (error) throw error;
    return data;
}

// ---- APPLICATIONS ----
async function createApplication(appData) {
    const { data, error } = await supabase
        .from('applications')
        .insert([appData])
        .select();
    if (error) throw error;
    return data;
}

async function getApplicationsByEmail(email) {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

async function getAllApplications() {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

async function updateApplicationStatus(appId, status) {
    const { data, error } = await supabase
        .from('applications')
        .update({ status: status, updated_at: new Date() })
        .eq('app_id', appId)
        .select();
    if (error) throw error;
    return data;
}

// ---- PERMITS ----
async function createPermit(permitData) {
    const { data, error } = await supabase
        .from('permits')
        .insert([permitData])
        .select();
    if (error) throw error;
    return data;
}

async function getPermitsByEmail(email) {
    const { data, error } = await supabase
        .from('permits')
        .select('*')
        .eq('email', email)
        .eq('archived', false)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

async function getAllPermits() {
    const { data, error } = await supabase
        .from('permits')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

async function updatePermit(appId, updates) {
    const { data, error } = await supabase
        .from('permits')
        .update(updates)
        .eq('app_id', appId)
        .select();
    if (error) throw error;
    return data;
}

// ---- NOTIFICATIONS ----
async function createNotification(notifData) {
    const { data, error } = await supabase
        .from('notifications')
        .insert([notifData])
        .select();
    if (error) throw error;
    return data;
}

async function getNotificationsByEmail(email) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

async function markNotificationRead(notifId) {
    const { data, error } = await supabase
        .from('notifications')
        .update({ unread: false })
        .eq('id', notifId)
        .select();
    if (error) throw error;
    return data;
}

async function clearNotificationsByEmail(email) {
    const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_email', email);
    if (error) throw error;
    return data;
}

// ---- ACTIVE USERS ----
async function upsertActiveUser(userData) {
    const { data, error } = await supabase
        .from('active_users')
        .upsert([userData], { onConflict: 'id' })
        .select();
    if (error) throw error;
    return data;
}

async function getActiveUsers() {
    const { data, error } = await supabase
        .from('active_users')
        .select('*')
        .order('last_active', { ascending: false });
    if (error) throw error;
    return data;
}

async function removeActiveUser(email) {
    const { data, error } = await supabase
        .from('active_users')
        .delete()
        .eq('email', email);
    if (error) throw error;
    return data;
}

// ---- PROFILES ----
async function createProfile(profileData) {
    const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select();
    if (error) throw error;
    return data;
}

async function getProfileByEmail(email) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function updateProfile(email, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('email', email)
        .select();
    if (error) throw error;
    return data;
}

console.log('✅ Supabase functions ready!');