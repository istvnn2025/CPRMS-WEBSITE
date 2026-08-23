(function() {
    "use strict";

    // ===== CHECK IF USER IS LOGGED IN =====
    const userType = sessionStorage.getItem('userType');
    const userEmail = sessionStorage.getItem('userEmail');
    const userName = sessionStorage.getItem('userName');

    if (!userType || !userEmail) {
        alert('Please login first.');
        window.location.href = 'index.html';
        return;
    }

    // ============================================================
    // DATA ACCESS - USING localStorage (shared with admin)
    // ============================================================
    function getApplications() {
        return JSON.parse(localStorage.getItem('userApplications') || '[]');
    }

    function setApplications(apps) {
        localStorage.setItem('userApplications', JSON.stringify(apps));
    }

    function getPermits() {
        return JSON.parse(localStorage.getItem('userPermits') || '[]');
    }

    function setPermits(permits) {
        localStorage.setItem('userPermits', JSON.stringify(permits));
    }

    function getNotifications() {
        return JSON.parse(localStorage.getItem('userNotifications') || '[]');
    }

    function setNotifications(notifs) {
        localStorage.setItem('userNotifications', JSON.stringify(notifs));
    }

    function getActiveUsers() {
        return JSON.parse(localStorage.getItem('activeUsers') || '[]');
    }

    function setActiveUsers(users) {
        localStorage.setItem('activeUsers', JSON.stringify(users));
    }

    // ============================================================
    // PROFILE DATA MANAGEMENT
    // ============================================================
    function getProfileData() {
        const defaultProfile = {
            name: userName || 'Juan Dela Cruz',
            email: userEmail || 'juan.delacruz@email.com',
            phone: '+63 912 3456 789',
            address: 'Brgy. Poblacion, Pagbilao, Quezon',
            bio: 'Municipal employee passionate about community service.',
            memberSince: 'January 2025',
            avatar: '',
            username: 'juan_delacruz',
            userType: userType || 'Resident',
            lastLogin: new Date().toLocaleString()
        };

        const saved = localStorage.getItem('userProfile');
        if (saved) {
            try {
                return { ...defaultProfile, ...JSON.parse(saved) };
            } catch {
                return defaultProfile;
            }
        }
        return defaultProfile;
    }

    function saveProfileData(data) {
        localStorage.setItem('userProfile', JSON.stringify(data));
    }

    // ============================================================
    // HELPER: GET TIME LABEL - FIXED with proper date handling
    // ============================================================
    function getTimeLabel(dateString) {
        if (!dateString) return 'Just now';
        
        const now = new Date();
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Just now';
        }
        
        const diffTime = now - date;
        const diffSeconds = Math.floor(diffTime / 1000);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        
        if (diffSeconds < 60) return 'Just now';
        if (diffMinutes < 60) return diffMinutes + ' minute' + (diffMinutes > 1 ? 's' : '') + ' ago';
        if (diffHours < 24) return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
        if (diffWeeks < 4) return diffWeeks + ' week' + (diffWeeks > 1 ? 's' : '') + ' ago';
        if (diffMonths < 12) return diffMonths + ' month' + (diffMonths > 1 ? 's' : '') + ' ago';
        return Math.floor(diffMonths / 12) + ' year' + (Math.floor(diffMonths / 12) > 1 ? 's' : '') + ' ago';
    }

    // ============================================================
    // DISPLAY USER INFO
    // ============================================================
    function displayProfile() {
        const profile = getProfileData();

        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.textContent = 'Welcome, ' + profile.name;
        }

        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        const profileAddress = document.getElementById('profileAddress');
        const profileBio = document.getElementById('profileBio');
        const profileMemberSince = document.getElementById('profileMemberSince');

        if (profileName) profileName.textContent = profile.name;
        if (profileEmail) profileEmail.textContent = profile.email;
        if (profilePhone) profilePhone.textContent = profile.phone;
        if (profileAddress) profileAddress.textContent = profile.address;
        if (profileBio) profileBio.textContent = profile.bio || 'No bio provided yet.';
        if (profileMemberSince) profileMemberSince.textContent = profile.memberSince;

        const settingsName = document.getElementById('settingsName');
        const settingsEmail = document.getElementById('settingsEmail');
        const settingsPhone = document.getElementById('settingsPhone');
        const settingsAddress = document.getElementById('settingsAddress');
        const settingsUsername = document.getElementById('settingsUsername');
        const settingsUserType = document.getElementById('settingsUserType');
        const settingsLastLogin = document.getElementById('settingsLastLogin');

        if (settingsName) settingsName.value = profile.name;
        if (settingsEmail) settingsEmail.value = profile.email;
        if (settingsPhone) settingsPhone.value = profile.phone;
        if (settingsAddress) settingsAddress.value = profile.address;
        if (settingsUsername) settingsUsername.value = profile.username || 'juan_delacruz';
        if (settingsUserType) settingsUserType.value = profile.userType || 'Resident';
        if (settingsLastLogin) settingsLastLogin.value = profile.lastLogin || new Date().toLocaleString();

        const avatarImg = document.getElementById('profileAvatarImg');
        const defaultIcon = document.getElementById('defaultAvatarIcon');
        if (avatarImg && defaultIcon) {
            if (profile.avatar) {
                avatarImg.src = profile.avatar;
                avatarImg.classList.add('show');
                defaultIcon.style.display = 'none';
            } else {
                avatarImg.classList.remove('show');
                avatarImg.src = '';
                defaultIcon.style.display = 'block';
            }
        }

        updateProfileStats();
    }

    // ============================================================
    // UPDATE PROFILE STATS
    // ============================================================
    function updateProfileStats() {
        const applications = getApplications();
        const permits = getPermits();
        const total = applications.length;
        const totalPermits = permits.length;
        const cancelled = applications.filter(function(a) {
            return a.status === 'Cancelled' || a.status === 'Rejected';
        }).length;

        const today = new Date();
        var activeCount = 0;
        var expiredCount = 0;
        var pendingCount = 0;

        permits.forEach(function(p) {
            if (p.archived === true) return;
            
            if (p.isPending === true || p.status === 'Pending') {
                pendingCount++;
            } else if (p.status === 'Active' || p.status === 'Approved') {
                if (p.expiryDate && p.expiryDate !== '-' && p.expiryDate !== '—' && p.expiryDate !== 'N/A') {
                    var expiryDate = new Date(p.expiryDate);
                    if (expiryDate < today) {
                        expiredCount++;
                        p.status = 'Expired';
                    } else {
                        activeCount++;
                    }
                } else {
                    activeCount++;
                }
            } else if (p.status === 'Expired') {
                expiredCount++;
            }
        });

        setPermits(permits);

        const statApps = document.getElementById('statApplications');
        const statPermits = document.getElementById('statPermits');
        const statCancelled = document.getElementById('statCancelled');
        const statActive = document.getElementById('statActive');
        const statExpired = document.getElementById('statExpired');
        const statPending = document.getElementById('statPending');

        if (statApps) statApps.textContent = total;
        if (statPermits) statPermits.textContent = totalPermits;
        if (statCancelled) statCancelled.textContent = cancelled;
        if (statActive) statActive.textContent = activeCount;
        if (statExpired) statExpired.textContent = expiredCount;
        if (statPending) statPending.textContent = pendingCount;
    }

    // ============================================================
    // LOAD APPLICATIONS TABLE
    // ============================================================
    function loadApplications() {
        const applications = getApplications();
        const tbody = document.getElementById('applicationsTableBody');
        if (!tbody) return;

        if (applications.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center; padding:2rem; color:#755a5a;">
                        <i class="fas fa-inbox" style="font-size:2rem; display:block; margin-bottom:0.5rem;"></i>
                        No applications filed yet. 
                        <a href="#" onclick="document.querySelector('[data-page=\\'file-permit\\']').click(); return false;" style="color:#b31b1b; font-weight:600;">
                            File a permit now
                        </a>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        applications.forEach(function(app) {
            const statusClass = app.status === 'Approved' ? 'approved' :
                app.status === 'Pending' ? 'pending' : 
                app.status === 'Cancelled' || app.status === 'Rejected' ? 'rejected' : 'rejected';
            
            html += `
                <tr>
                    <td>${app.type}</td>
                    <td>${app.dateFiled}</td>
                    <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    // ============================================================
    // LOAD PERMITS TABLE
    // ============================================================
    function loadPermits() {
        const permits = getPermits();
        const tbody = document.getElementById('permitsTableBody');
        if (!tbody) return;

        if (permits.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:3rem 2rem;">
                        <i class="fas fa-file-circle-plus" style="font-size:3rem; display:block; margin:0 auto 0.8rem; color:#b31b1b;"></i>
                        <p style="font-size:1.1rem; font-weight:600; color:#2d1c1c; margin-bottom:0.3rem;">No permits yet</p>
                        <p style="font-size:0.95rem; color:#999; margin-bottom:1.2rem;">File a permit to get started.</p>
                        <a href="#" onclick="document.querySelector('[data-page=\\'file-permit\\']').click(); return false;" style="display:inline-block; background:#b31b1b; color:white; padding:0.7rem 2rem; border-radius:8px; text-decoration:none; font-weight:500; transition:0.2s;">
                            <i class="fas fa-file-circle-plus"></i> File a Permit Now
                        </a>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        let hasVisiblePermits = false;
        
        permits.forEach(function(permit) {
            if (permit.archived === true) return;
            
            hasVisiblePermits = true;
            
            let statusClass = '';
            let displayStatus = permit.status || 'Pending';
            
            const isPending = permit.isPending === true || displayStatus === 'Pending';
            
            if (isPending) {
                statusClass = 'pending';
                displayStatus = 'Pending';
            } else if (displayStatus === 'Active' || displayStatus === 'Approved') {
                statusClass = 'active';
            } else if (displayStatus === 'Expired') {
                statusClass = 'expired';
            } else {
                statusClass = 'rejected';
            }
            
            let displayPermitNo = permit.permitNo;
            if (isPending || displayPermitNo === 'PENDING' || displayPermitNo === 'Pending' || !displayPermitNo || displayPermitNo === '—') {
                displayPermitNo = 'Pending';
            }
            
            let displayDateIssued = permit.dateIssued || '—';
            let displayExpiry = permit.expiryDate || '—';
            
            if (isPending) {
                displayDateIssued = '—';
                displayExpiry = '—';
            }
            
            html += `
                <tr>
                    <td><strong>${displayPermitNo}</strong></td>
                    <td>${permit.type}</td>
                    <td>${displayDateIssued}</td>
                    <td>${displayExpiry}</td>
                    <td><span class="status-badge ${statusClass}">${displayStatus}</span></td>
                </tr>
            `;
        });
        
        if (!hasVisiblePermits) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:3rem 2rem;">
                        <i class="fas fa-file-circle-plus" style="font-size:3rem; display:block; margin:0 auto 0.8rem; color:#b31b1b;"></i>
                        <p style="font-size:1.1rem; font-weight:600; color:#2d1c1c; margin-bottom:0.3rem;">No permits yet</p>
                        <p style="font-size:0.95rem; color:#999; margin-bottom:1.2rem;">File a permit to get started.</p>
                        <a href="#" onclick="document.querySelector('[data-page=\\'file-permit\\']').click(); return false;" style="display:inline-block; background:#b31b1b; color:white; padding:0.7rem 2rem; border-radius:8px; text-decoration:none; font-weight:500; transition:0.2s;">
                            <i class="fas fa-file-circle-plus"></i> File a Permit Now
                        </a>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = html;
        }
    }

    // ============================================================
    // CLEAR FUNCTIONS
    // ============================================================
    window.clearApplicationHistory = function() {
        if (!confirm('Are you sure you want to clear all your application history? This action cannot be undone.')) {
            return;
        }
        setApplications([]);
        loadApplications();
        updateDashboardStats();
        updateProfileStats();
        showToast('Application history cleared successfully!', 'success');
    };

    window.clearNotificationHistory = function() {
        if (!confirm('Are you sure you want to clear all your notifications? This action cannot be undone.')) {
            return;
        }
        setNotifications([]);
        const badge = document.getElementById('notifBadge');
        if (badge) badge.textContent = '0';
        loadNotifications();
        showToast('All notifications cleared!', 'success');
    };

    // ============================================================
    // TOAST NOTIFICATION
    // ============================================================
    function showToast(message, type) {
        type = type || 'info';
        const container = document.getElementById('toastContainer') || createToastContainer();
        const toast = document.createElement('div');
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-triangle-exclamation',
            info: 'fa-info-circle'
        };
        toast.className = 'toast ' + type;
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        container.appendChild(toast);
        setTimeout(function() {
            if (toast.parentElement) toast.remove();
        }, 3000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(container);
        
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                .toast {
                    padding: 0.8rem 1.2rem;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 500;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                    animation: slideIn 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 250px;
                }
                .toast.success { background: #28a745; }
                .toast.error { background: #dc3545; }
                .toast.info { background: #0d6efd; }
                .toast.warning { background: #e8a317; }
                .toast .toast-close {
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 1.1rem;
                    opacity: 0.7;
                }
                .toast .toast-close:hover { opacity: 1; }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }
        return container;
    }

    // ============================================================
    // UPDATE DASHBOARD STATS
    // ============================================================
    function updateDashboardStats() {
        const applications = getApplications();
        const permits = getPermits();
        const total = applications.length;
        const totalPermits = permits.length;
        const approved = applications.filter(function(a) { return a.status === 'Approved'; }).length;
        const pendingApps = applications.filter(function(a) { return a.status === 'Pending'; }).length;
        
        const today = new Date();
        const expiringPermits = permits.filter(function(p) {
            if (p.archived === true) return false;
            if (p.isPending === true || p.status === 'Pending') return false;
            if (p.status !== 'Active' && p.status !== 'Approved') return false;
            if (!p.expiryDate || p.expiryDate === '-' || p.expiryDate === '—' || p.expiryDate === 'N/A') return false;
            const expiryDate = new Date(p.expiryDate);
            const diffTime = expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 30;
        });

        const totalAppsEl = document.getElementById('totalApps');
        const totalPermitsEl = document.getElementById('totalPermits');
        const approvedAppsEl = document.getElementById('approvedApps');
        const expiringCountEl = document.getElementById('expiringCount');
        const pendingAppsEl = document.getElementById('pendingApps');

        if (totalAppsEl) totalAppsEl.textContent = total;
        if (totalPermitsEl) totalPermitsEl.textContent = totalPermits;
        if (approvedAppsEl) approvedAppsEl.textContent = approved;
        if (expiringCountEl) expiringCountEl.textContent = expiringPermits.length;
        if (pendingAppsEl) pendingAppsEl.textContent = pendingApps;

        updateRecentActivity(applications, permits);
    }

    // ============================================================
    // UPDATE RECENT ACTIVITY - Clean version (no emojis)
    // ============================================================
    function updateRecentActivity(applications, permits) {
        const container = document.getElementById('activityList');
        
        if (!container) {
            console.error('activityList element not found!');
            return;
        }

        let activities = [];
        const now = Date.now();

        // ===== 1. PROCESS APPLICATIONS =====
        applications.forEach(function(app) {
            let icon, iconClass, text, time;
            
            if (app.status === 'Pending') {
                icon = 'yellow';
                iconClass = 'fa-clock';
                text = 'You filed a new <strong>' + app.type + '</strong> application';
            } else if (app.status === 'Approved') {
                icon = 'green';
                iconClass = 'fa-check-circle';
                text = 'Your <strong>' + app.type + '</strong> application was <strong>approved</strong>';
            } else if (app.status === 'Rejected') {
                icon = 'red';
                iconClass = 'fa-times-circle';
                text = 'Your <strong>' + app.type + '</strong> application was <strong>rejected</strong>';
            } else if (app.status === 'Cancelled') {
                icon = 'orange';
                iconClass = 'fa-ban';
                text = 'Your <strong>' + app.type + '</strong> application was <strong>cancelled</strong>';
            } else {
                icon = 'blue';
                iconClass = 'fa-info-circle';
                text = '<strong>' + app.type + '</strong> application (' + app.status + ')';
            }
            
            time = app.dateFiled || 'Recently';
            
            let timestamp = now;
            if (app.dateFiled) {
                const parsed = new Date(app.dateFiled);
                if (!isNaN(parsed.getTime())) {
                    timestamp = parsed.getTime();
                }
            }
            
            activities.push({
                text: text,
                time: time,
                icon: icon,
                iconClass: iconClass,
                isAlert: false,
                timestamp: timestamp
            });
        });

        // ===== 2. PROCESS PERMITS =====
        permits.forEach(function(p) {
            if (p.archived === true) return;
            
            if (p.isPending === true || p.status === 'Pending') {
                activities.push({
                    text: '<strong>' + p.type + '</strong> is pending approval',
                    time: 'Pending review',
                    icon: 'yellow',
                    iconClass: 'fa-clock',
                    isAlert: false,
                    timestamp: new Date(p.created || now).getTime() || now
                });
            } else if (p.status === 'Active' || p.status === 'Approved') {
                let timeText = 'Issued on ' + (p.dateIssued || 'N/A');
                let timestamp = new Date(p.dateIssued || now).getTime() || now;
                
                if (p.expiryDate && p.expiryDate !== '-' && p.expiryDate !== '—' && p.expiryDate !== 'N/A') {
                    const expiryDate = new Date(p.expiryDate);
                    const diffTime = expiryDate - new Date();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays > 0 && diffDays <= 30) {
                        activities.push({
                            text: '<strong>' + p.type + ' #' + p.permitNo + '</strong> expires in <strong>' + diffDays + ' days</strong>',
                            time: 'Expiring soon - Renew now',
                            icon: 'orange',
                            iconClass: 'fa-exclamation-triangle',
                            isAlert: true,
                            timestamp: expiryDate.getTime()
                        });
                        return;
                    }
                }
                
                activities.push({
                    text: '<strong>' + p.type + ' #' + p.permitNo + '</strong> is active',
                    time: timeText,
                    icon: 'green',
                    iconClass: 'fa-check',
                    isAlert: false,
                    timestamp: timestamp
                });
            } else if (p.status === 'Expired') {
                activities.push({
                    text: '<strong>' + p.type + ' #' + p.permitNo + '</strong> has expired',
                    time: 'Expired on ' + (p.expiryDate || 'N/A'),
                    icon: 'red',
                    iconClass: 'fa-hourglass-end',
                    isAlert: true,
                    timestamp: new Date(p.expiryDate || now).getTime() || now
                });
            }
        });

        // ===== 3. ADD LOGIN ACTIVITY =====
        const profile = getProfileData();
        if (profile && profile.lastLogin) {
            activities.push({
                text: 'You logged in to your account',
                time: profile.lastLogin || 'Recently',
                icon: 'blue',
                iconClass: 'fa-sign-in-alt',
                isAlert: false,
                timestamp: new Date(profile.lastLogin).getTime() || now
            });
        }

        // ===== 4. ADD NOTIFICATIONS =====
        const notifications = getNotifications();
        notifications.slice(0, 5).forEach(function(notif) {
            let icon = notif.icon || 'blue';
            let iconClass = notif.iconClass || 'fa-info-circle';
            let timeLabel = getTimeLabel(notif.timestamp || notif.time || new Date().toISOString());
            let timestamp = new Date(notif.timestamp || notif.time || now).getTime();
            
            activities.push({
                text: notif.message,
                time: timeLabel,
                icon: icon,
                iconClass: iconClass,
                isAlert: false,
                timestamp: timestamp
            });
        });

        // ===== SORT BY TIMESTAMP =====
        activities.sort(function(a, b) {
            return (b.timestamp || 0) - (a.timestamp || 0);
        });

        // Limit to 15
        activities = activities.slice(0, 15);

        // ===== RENDER =====
        if (activities.length === 0) {
            container.innerHTML = `
                <p style="color:#8a7a7a; text-align:center; padding:1rem;">
                    <i class="fas fa-info-circle"></i> No recent activity. 
                    <a href="#" onclick="document.querySelector('[data-page=\\'file-permit\\']').click(); return false;" style="color:#b31b1b; font-weight:600;">
                        File a permit now
                    </a>
                </p>
            `;
            return;
        }

        let html = '';
        activities.forEach(function(act) {
            const alertClass = act.isAlert ? 'expiring-alert' : '';
            const iconMap = {
                green: 'green',
                blue: 'blue',
                red: 'red',
                orange: 'orange',
                yellow: 'yellow'
            };
            const iconColor = iconMap[act.icon] || 'blue';
            
            html += `
                <div class="activity-item ${alertClass}">
                    <div class="activity-icon ${iconColor}">
                        <i class="fas ${act.iconClass}"></i>
                    </div>
                    <div class="activity-detail">
                        <p>${act.text}</p>
                        <span class="activity-time">${act.time}</span>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    // ============================================================
    // LOAD NOTIFICATIONS
    // ============================================================
    function loadNotifications() {
        const notifications = getNotifications();
        const container = document.getElementById('notificationList');
        const badge = document.getElementById('notifBadge');
        if (!container) return;

        if (notifications.length === 0) {
            container.innerHTML = `
                <p style="color:#8a7a7a; text-align:center; padding:1rem;">
                    <i class="fas fa-bell" style="font-size:2rem; display:block; margin-bottom:0.5rem; color:#b31b1b;"></i>
                    No notifications yet
                </p>
            `;
            if (badge) badge.textContent = '0';
            return;
        }

        const unreadCount = notifications.filter(function(n) { return n.unread; }).length;
        if (badge) badge.textContent = unreadCount > 0 ? unreadCount : '0';

        let html = '';
        notifications.forEach(function(notif) {
            const unreadClass = notif.unread ? 'unread' : '';
            const badgeHtml = notif.unread ? '<span class="notif-badge">New</span>' : '';
            const iconMap = {
                green: 'fa-check-circle',
                yellow: 'fa-clock',
                blue: 'fa-info-circle',
                red: 'fa-exclamation-circle',
                orange: 'fa-exclamation-triangle'
            };
            const icon = iconMap[notif.icon] || 'fa-info-circle';
            
            // Use timestamp for accurate time display
            const timeLabel = getTimeLabel(notif.timestamp || notif.time || new Date().toISOString());
            
            html += `
                <div class="notification-item ${unreadClass}" data-notif-id="${notif.id || ''}" onclick="markNotifRead(this)">
                    <div class="notif-icon ${notif.icon}"><i class="fas ${icon}"></i></div>
                    <div class="notif-content">
                        <p>${notif.message}</p>
                        <span class="notif-time">${timeLabel}</span>
                    </div>
                    ${badgeHtml}
                </div>
            `;
        });
        container.innerHTML = html;
    }

    // ============================================================
    // MARK NOTIFICATION AS READ
    // ============================================================
    window.markNotifRead = function(el) {
        el.classList.remove('unread');
        const badge = el.querySelector('.notif-badge');
        if (badge) badge.remove();

        const notifId = el.dataset.notifId;
        const notifications = getNotifications();
        
        if (notifId) {
            const updated = notifications.map(function(n) {
                if (n.id == notifId) {
                    n.unread = false;
                }
                return n;
            });
            setNotifications(updated);
        } else {
            const updated = notifications.map(function(n) {
                n.unread = false;
                return n;
            });
            setNotifications(updated);
        }

        const unreadCount = getNotifications().filter(function(n) { return n.unread; }).length;
        const badgeEl = document.getElementById('notifBadge');
        if (badgeEl) badgeEl.textContent = unreadCount > 0 ? unreadCount : '0';
        
        showToast('Notification marked as read', 'success');
    };

    // ============================================================
    // NAVIGATION
    // ============================================================
    const navItems = document.querySelectorAll('.sidebar-nav li');
    const pageContents = document.querySelectorAll('.page-content');
    const pageTitle = document.getElementById('pageTitle');
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');

    const pageTitles = {
        'dashboard': 'Dashboard',
        'file-permit': 'File Permit',
        'my-applications': 'My Applications',
        'my-permits': 'My Permits',
        'notifications': 'Notifications',
        'profile': 'My Profile',
        'settings': 'Settings'
    };

    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            navItems.forEach(function(nav) { nav.classList.remove('active'); });
            this.classList.add('active');

            const page = this.dataset.page;
            
            if (page === 'file-permit') {
                window.location.href = 'permit-form.html';
                return;
            }
            
            pageContents.forEach(function(content) { content.classList.remove('active'); });
            const targetPage = document.getElementById('page-' + page);
            if (targetPage) {
                targetPage.classList.add('active');
                if (page === 'my-applications') loadApplications();
                else if (page === 'my-permits') loadPermits();
                else if (page === 'notifications') loadNotifications();
                else if (page === 'profile') displayProfile();
                else if (page === 'settings') displayProfile();
                else if (page === 'dashboard') updateDashboardStats();
            }

            pageTitle.textContent = pageTitles[page] || page;

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (sidebar && toggleBtn) {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        }
    });

    // ============================================================
    // OPEN PERMIT FORM
    // ============================================================
    window.openPermit = function(permitType, displayName) {
        sessionStorage.setItem('permitType', permitType);
        sessionStorage.setItem('permitName', displayName);
        window.location.href = 'permit-form.html';
    };

    // ============================================================
    // LOGOUT
    // ============================================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                const activeUsers = getActiveUsers();
                const updated = activeUsers.filter(function(u) { return u.email !== userEmail; });
                setActiveUsers(updated);
                localStorage.removeItem('userProfile');
                sessionStorage.clear();
                alert('Logging out...');
                window.location.href = 'index.html';
            }
        });
    }

    // ============================================================
    // EDIT PROFILE MODAL
    // ============================================================
    const editProfileBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('editProfileModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    function openModal() {
        const profile = getProfileData();
        document.getElementById('editName').value = profile.name;
        document.getElementById('editEmail').value = profile.email;
        document.getElementById('editPhone').value = profile.phone;
        document.getElementById('editAddress').value = profile.address;
        document.getElementById('editBio').value = profile.bio || '';
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function() {
            const name = document.getElementById('editName').value.trim();
            const email = document.getElementById('editEmail').value.trim();
            const phone = document.getElementById('editPhone').value.trim();
            const address = document.getElementById('editAddress').value.trim();
            const bio = document.getElementById('editBio').value.trim();

            if (!name || !email) {
                alert('Name and Email are required.');
                return;
            }

            const profile = getProfileData();
            profile.name = name;
            profile.email = email;
            profile.phone = phone || profile.phone;
            profile.address = address || profile.address;
            profile.bio = bio || profile.bio;

            const avatarInput = document.getElementById('editAvatar');
            if (avatarInput && avatarInput.files && avatarInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profile.avatar = e.target.result;
                    saveProfileData(profile);
                    displayProfile();
                    closeModal();
                    alert('Profile updated successfully!');
                };
                reader.readAsDataURL(avatarInput.files[0]);
            } else {
                saveProfileData(profile);
                displayProfile();
                closeModal();
                alert('Profile updated successfully!');
            }

            sessionStorage.setItem('userName', name);
            sessionStorage.setItem('userEmail', email);
        });
    }

    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const profile = getProfileData();
                    profile.avatar = e.target.result;
                    saveProfileData(profile);
                    displayProfile();
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // ============================================================
    // LANGUAGE CHANGE
    // ============================================================
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        const savedLang = localStorage.getItem('language') || 'en';
        languageSelect.value = savedLang;

        languageSelect.addEventListener('change', function() {
            localStorage.setItem('language', this.value);
            const indicator = document.querySelector('.auto-save-indicator');
            if (indicator) {
                indicator.style.opacity = '0.5';
                setTimeout(function() { indicator.style.opacity = '1'; }, 300);
            }
        });
    }

    // ============================================================
    // CHANGE PASSWORD & DELETE ACCOUNT
    // ============================================================
    window.changePassword = function() {
        const newPassword = prompt('Enter new password (min 6 characters):');
        if (newPassword && newPassword.length >= 6) {
            const confirmPass = prompt('Confirm new password:');
            if (confirmPass === newPassword) {
                alert('Password changed successfully!');
                const indicator = document.querySelector('.auto-save-indicator');
                if (indicator) {
                    indicator.style.opacity = '0.5';
                    setTimeout(function() { indicator.style.opacity = '1'; }, 300);
                }
            } else {
                alert('Passwords do not match.');
            }
        } else if (newPassword) {
            alert('Password must be at least 6 characters.');
        }
    };

    window.confirmDeleteAccount = function() {
        if (confirm('Are you sure you want to delete your account? This cannot be undone!')) {
            if (confirm('All your data will be permanently removed. Are you sure?')) {
                const password = prompt('Enter your password to confirm:');
                if (password) {
                    alert('Account deleted. You will be logged out.');
                    localStorage.removeItem('userApplications');
                    localStorage.removeItem('userPermits');
                    localStorage.removeItem('userNotifications');
                    localStorage.removeItem('userProfile');
                    sessionStorage.clear();
                    window.location.href = 'index.html';
                } else {
                    alert('Deletion cancelled.');
                }
            }
        }
    };

    document.querySelectorAll('.settings-group .form-control:not([readonly])').forEach(function(input) {
        input.addEventListener('change', function() {
            const profile = getProfileData();
            const id = this.id;
            if (id === 'settingsName') profile.name = this.value;
            else if (id === 'settingsEmail') profile.email = this.value;
            else if (id === 'settingsPhone') profile.phone = this.value;
            else if (id === 'settingsAddress') profile.address = this.value;
            
            saveProfileData(profile);
            displayProfile();
            
            const indicator = document.querySelector('.auto-save-indicator');
            if (indicator) {
                indicator.style.opacity = '0.5';
                setTimeout(function() { indicator.style.opacity = '1'; }, 300);
            }
        });
    });

    // ============================================================
    // STORAGE LISTENER
    // ============================================================
    window.addEventListener('storage', function(e) {
        if (e.key === 'userApplications' || e.key === 'userPermits' || e.key === 'userNotifications') {
            console.log('Data changed by admin, refreshing...');
            loadApplications();
            loadPermits();
            loadNotifications();
            updateDashboardStats();
            updateProfileStats();
            displayProfile();
        }
    });

    // ============================================================
    // CHECK URL PARAMS FOR SUCCESS
    // ============================================================
    (function() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'submitted') {
            setTimeout(function() {
                const notificationItem = document.querySelector('.notification-item.unread');
                if (notificationItem) {
                    notificationItem.style.borderLeftColor = '#28a745';
                }
                setTimeout(function() {
                    showToast('Your application has been submitted successfully!', 'success');
                }, 500);
            }, 500);
        }
    })();

    // ============================================================
    // REGISTER ACTIVE USER
    // ============================================================
    function registerActiveUser() {
        const activeUsers = getActiveUsers();
        const exists = activeUsers.some(function(u) { return u.email === userEmail; });
        if (!exists) {
            activeUsers.push({
                id: userEmail,
                name: userName || 'User',
                email: userEmail,
                initials: (userName || 'U').split(' ').map(function(n) { return n[0]; }).join('').toUpperCase(),
                lastActive: Date.now(),
                status: 'online'
            });
            setActiveUsers(activeUsers);
        }
    }

    // ============================================================
    // INITIAL LOAD
    // ============================================================
    registerActiveUser();
    displayProfile();
    loadApplications();
    loadPermits();
    loadNotifications();
    updateDashboardStats();

    console.log('Pagbilao Dashboard ready (localStorage)');
    console.log('Logged in as: ' + userType + ' - ' + userEmail);
    console.log('Applications: ' + getApplications().length);
    console.log('Permits: ' + getPermits().length);
    console.log('Notifications: ' + getNotifications().length);

})();