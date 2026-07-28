// ============================================
// CLICK ARENA - Competition Mode
// Version 3.0 - No limits for free users!
// ============================================

const CONFIG = {
    RESET_HOUR: 0,
    SUBSCRIBED_BONUS: 2,
};

let appData = {
    users: [],
    currentUser: null,
    globalClicks: 0,
    lastResetDate: null,
    winners: [],
    dailyWinners: [],
    transactions: [],
    offers: [],
    activeSubscriptions: [],
};

function loadData() {
    const saved = localStorage.getItem('clickEarnData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appData = { ...appData, ...parsed };
        } catch (e) {
            console.warn('Failed to parse saved data');
        }
    }
    if (!appData.dailyWinners || appData.dailyWinners.length === 0) {
        appData.dailyWinners = [
            { rank: 1, username: '---', clicks: 0 },
            { rank: 2, username: '---', clicks: 0 },
            { rank: 3, username: '---', clicks: 0 },
            { rank: 4, username: '---', clicks: 0 },
        ];
    }
    checkDailyReset();
    saveData();
}

function saveData() {
    localStorage.setItem('clickEarnData', JSON.stringify(appData));
}

function checkDailyReset() {
    const today = new Date().toDateString();
    if (appData.lastResetDate !== today) {
        if (appData.users) {
            appData.users.forEach(u => {
                u.dailyClicks = 0;
                u.totalClicks = u.totalClicks || 0;
                u.isActive = u.isActive || false;
                u.subscriptionEnd = u.subscriptionEnd || null;
                u.referralCode = u.referralCode || generateReferralCode();
                u.referredBy = u.referredBy || null;
                u.coins = u.coins || 0;
            });
        }
        appData.globalClicks = 0;
        appData.lastResetDate = today;
        appData.winners = [];
        appData.dailyWinners = [
            { rank: 1, username: '---', clicks: 0 },
            { rank: 2, username: '---', clicks: 0 },
            { rank: 3, username: '---', clicks: 0 },
            { rank: 4, username: '---', clicks: 0 },
        ];
        calculateWinners();
        saveData();
    }
}

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function findUser(username) {
    return appData.users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

function findUserById(userId) {
    return appData.users.find(u => u.id === userId);
}

function generateUserId() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function createUser(username, email, password) {
    const userId = generateUserId();
    const newUser = {
        id: userId,
        username: username,
        email: email,
        password: password,
        balance: 0,
        coins: 0,
        dailyClicks: 0,
        totalClicks: 0,
        isActive: false,
        subscriptionEnd: null,
        referralCode: generateReferralCode(),
        referredBy: null,
        createdAt: new Date().toISOString(),
        rank: null,
    };
    appData.users.push(newUser);
    saveData();
    return newUser;
}

function login(username, password) {
    const user = findUser(username);
    if (!user) return { success: false, message: 'User not found' };
    if (user.password !== password) return { success: false, message: 'Invalid password' };
    appData.currentUser = user;
    saveData();
    return { success: true, user };
}

function register(username, email, password, confirm) {
    if (password !== confirm) return { success: false, message: 'Passwords do not match' };
    if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters' };
    if (findUser(username)) return { success: false, message: 'Username already exists' };
    if (appData.users.some(u => u.email === email)) return { success: false, message: 'Email already registered' };
    
    const user = createUser(username, email, password);
    return { success: true, user };
}

function logout() {
    appData.currentUser = null;
    saveData();
    showPage('authPage');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function updateUI() {
    const user = appData.currentUser;
    if (!user) return;

    document.getElementById('mainUsername').textContent = user.username;
    document.getElementById('mainUserId').textContent = `ID: ${user.id}`;
    document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    document.getElementById('headerBalance').textContent = user.balance.toFixed(2);
    document.getElementById('todayClicks').textContent = user.dailyClicks || 0;
    document.getElementById('clickCount').textContent = (user.dailyClicks || 0);
    document.getElementById('globalClicks').textContent = appData.globalClicks || 0;
    
    updateTimer();
    updateWinners();
    updateUserRank();
    updateOffersVisibility();
    updateUserStatus();
}

function updateTimer() {
    const timerEl = document.getElementById('globalTimer');
    if (!timerEl) return;
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = Math.floor((tomorrow - now) / 1000);
    
    if (diff <= 0) {
        timerEl.textContent = '00:00:00';
        return;
    }
    
    const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const seconds = String(diff % 60).padStart(2, '0');
    timerEl.textContent = `${hours}:${minutes}:${seconds}`;
}

function updateWinners() {
    const winners = appData.dailyWinners || [];
    const items = document.querySelectorAll('.winner-item');
    items.forEach((item, index) => {
        if (index < winners.length) {
            const w = winners[index];
            const spans = item.querySelectorAll('span');
            if (spans.length >= 3) {
                spans[0].textContent = `#${w.rank}`;
                spans[1].textContent = w.username || '---';
                spans[2].textContent = `${w.clicks || 0} clicks`;
            }
        }
    });
}

function updateUserRank() {
    const user = appData.currentUser;
    if (!user) return;
    
    const allUsers = appData.users.filter(u => u.isActive || u.dailyClicks > 0);
    const sorted = [...allUsers].sort((a, b) => (b.dailyClicks || 0) - (a.dailyClicks || 0));
    const rank = sorted.findIndex(u => u.id === user.id) + 1;
    user.rank = rank > 0 ? rank : null;
    document.getElementById('userRank').textContent = rank > 0 ? `#${rank}` : '-';
    saveData();
}

function updateOffersVisibility() {
    const user = appData.currentUser;
    if (!user) return;
    
    const offersSection = document.getElementById('offersSection');
    if (!offersSection) return;
    
    if (user.isActive && user.subscriptionEnd) {
        const endDate = new Date(user.subscriptionEnd);
        if (endDate > new Date()) {
            offersSection.style.display = 'none';
            return;
        }
    }
    offersSection.style.display = 'block';
}

function updateUserStatus() {
    const user = appData.currentUser;
    if (!user) return;
    
    const statusEl = document.getElementById('userStatus');
    if (!statusEl) return;
    
    const isSubscribed = user.isActive && user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();
    
    if (isSubscribed) {
        const end = new Date(user.subscriptionEnd);
        const daysLeft = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
        statusEl.textContent = `⭐ Subscribed (${daysLeft}d left) - 2x clicks!`;
        statusEl.style.color = '#ffd700';
        statusEl.className = 'subscribed';
    } else {
        statusEl.textContent = `🏃 Free User - Unlimited clicks!`;
        statusEl.style.color = '#00cec9';
        statusEl.className = 'free';
    }
}

function handleClick() {
    const user = appData.currentUser;
    if (!user) {
        showToast('Please login first', 'error');
        return;
    }

    const isSubscribed = user.isActive && user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();
    
    let clickCount = 1;
    let message = '';
    
    if (isSubscribed) {
        clickCount = CONFIG.SUBSCRIBED_BONUS;
        message = `⭐ +${clickCount} clicks (Subscriber bonus!)`;
    } else {
        clickCount = 1;
        message = `🏃 +1 click (Keep going!)`;
    }
    
    user.dailyClicks = (user.dailyClicks || 0) + clickCount;
    user.totalClicks = (user.totalClicks || 0) + clickCount;
    user.coins = (user.coins || 0) + clickCount;
    appData.globalClicks = (appData.globalClicks || 0) + clickCount;
    
    document.getElementById('todayClicks').textContent = user.dailyClicks;
    document.getElementById('clickCount').textContent = user.dailyClicks;
    document.getElementById('globalClicks').textContent = appData.globalClicks;
    
    animateClick(isSubscribed);
    
    calculateWinners();
    updateUserRank();
    updateUserStatus();
    saveData();
    
    showToast(message, 'success');
}

function animateClick(isSubscribed) {
    const circle = document.getElementById('clickCircle');
    const scale = isSubscribed ? 0.8 : 0.85;
    const glow = isSubscribed ? '0 0 80px rgba(255, 215, 0, 0.5)' : '0 0 60px rgba(108, 92, 231, 0.4)';
    
    circle.style.transform = `scale(${scale})`;
    circle.style.boxShadow = glow;
    
    if (isSubscribed) {
        createParticles();
    }
    
    setTimeout(() => {
        circle.style.transform = 'scale(1)';
        circle.style.boxShadow = '0 0 40px rgba(108, 92, 231, 0.2)';
    }, 150);
}

function createParticles() {
    const circle = document.getElementById('clickCircle');
    const rect = circle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        const angle = (i / 8) * 2 * Math.PI;
        const distance = 40 + Math.random() * 40;
        
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: #ffd700;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
            left: ${centerX}px;
            top: ${centerY}px;
            transition: all 0.6s ease-out;
            opacity: 1;
            box-shadow: 0 0 10px #ffd700;
        `;
        document.body.appendChild(particle);
        
        requestAnimationFrame(() => {
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            particle.style.opacity = '0';
        });
        
        setTimeout(() => {
            particle.remove();
        }, 700);
    }
}

function calculateWinners() {
    const activeUsers = appData.users.filter(u => (u.dailyClicks || 0) > 0);
    const sorted = [...activeUsers].sort((a, b) => (b.dailyClicks || 0) - (a.dailyClicks || 0));
    
    const top4 = sorted.slice(0, 4);
    const winners = top4.map((u, i) => ({
        rank: i + 1,
        username: u.username,
        clicks: u.dailyClicks || 0,
        userId: u.id,
    }));
    
    while (winners.length < 4) {
        winners.push({ rank: winners.length + 1, username: '---', clicks: 0, userId: null });
    }
    
    appData.dailyWinners = winners;
    updateWinners();
    saveData();
}

function subscribeToOffer(days, price) {
    const user = appData.currentUser;
    if (!user) return { success: false, message: 'Please login first' };
    
    if (user.isActive && user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()) {
        return { success: false, message: 'You already have an active subscription' };
    }
    
    if (user.balance < price) {
        return { success: false, message: 'Insufficient balance' };
    }
    
    user.balance -= price;
    
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);
    
    user.isActive = true;
    user.subscriptionEnd = endDate.toISOString();
    user.subscriptionStart = now.toISOString();
    user.subscriptionDays = days;
    
    appData.transactions.push({
        type: 'subscription',
        userId: user.id,
        username: user.username,
        days: days,
        price: price,
        date: now.toISOString(),
        endDate: endDate.toISOString(),
    });
    
    updateOffersVisibility();
    updateUI();
    saveData();
    
    return { success: true, message: `🎉 Subscribed for ${days} days! Now you get 2x clicks!` };
}

function deposit(amount, address) {
    const user = appData.currentUser;
    if (!user) return { success: false, message: 'Please login first' };
    if (amount <= 0) return { success: false, message: 'Amount must be greater than 0' };
    
    user.balance += amount;
    
    appData.transactions.push({
        type: 'deposit',
        userId: user.id,
        username: user.username,
        amount: amount,
        address: address,
        date: new Date().toISOString(),
        status: 'pending',
    });
    
    updateUI();
    saveData();
    return { success: true, message: 'Deposit request submitted' };
}

function withdraw(amount, address) {
    const user = appData.currentUser;
    if (!user) return { success: false, message: 'Please login first' };
    if (amount <= 0) return { success: false, message: 'Amount must be greater than 0' };
    if (user.balance < amount) return { success: false, message: 'Insufficient balance' };
    
    user.balance -= amount;
    
    appData.transactions.push({
        type: 'withdraw',
        userId: user.id,
        username: user.username,
        amount: amount,
        address: address,
        date: new Date().toISOString(),
        status: 'pending',
    });
    
    updateUI();
    saveData();
    return { success: true, message: 'Withdrawal request submitted' };
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 14px 28px;
        border-radius: 12px;
        background: ${type === 'error' ? '#e17055' : type === 'success' ? '#00b894' : '#6c5ce7'};
        color: white;
        font-weight: 600;
        z-index: 9999;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        animation: slideUp 0.3s ease;
        font-size: 0.95rem;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tab = this.dataset.tab;
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            if (tab === 'login') {
                document.getElementById('loginForm').classList.add('active');
            } else {
                document.getElementById('registerForm').classList.add('active');
            }
        });
    });
    
    document.getElementById('loginBtn').addEventListener('click', function() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const errorEl = document.getElementById('loginError');
        
        if (!username || !password) {
            errorEl.textContent = 'Please fill in all fields';
            return;
        }
        
        const result = login(username, password);
        if (result.success) {
            errorEl.textContent = '';
            showPage('mainPage');
            updateUI();
            showToast('Welcome back ' + result.user.username, 'success');
        } else {
            errorEl.textContent = result.message;
        }
    });
    
    document.getElementById('registerBtn').addEventListener('click', function() {
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        const errorEl = document.getElementById('registerError');
        
        if (!username || !email || !password || !confirm) {
            errorEl.textContent = 'Please fill in all fields';
            return;
        }
        
        const result = register(username, email, password, confirm);
        if (result.success) {
            errorEl.textContent = '';
            document.getElementById('loginUsername').value = username;
            document.getElementById('loginPassword').value = password;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-tab="login"]').classList.add('active');
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById('loginForm').classList.add('active');
            showToast('Registration successful! Please login', 'success');
        } else {
            errorEl.textContent = result.message;
        }
    });
    
    document.getElementById('clickCircle').addEventListener('click', handleClick);
    
    document.querySelectorAll('.modal-close').forEach(close => {
        close.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
    
    document.querySelectorAll('.offer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.offer-card');
            const days = parseInt(card.dataset.days);
            const price = parseFloat(card.querySelector('.offer-price').textContent);
            
            document.getElementById('offerDaysDisplay').textContent = days;
            document.getElementById('offerPriceDisplay').textContent = price;
            document.getElementById('paymentAddress').textContent = 'TCKxV... (USDT TRC20)';
            showModal('offerModal');
            
            window._offerData = { days, price };
        });
    });
    
    document.getElementById('confirmOffer').addEventListener('click', function() {
        const { days, price } = window._offerData || {};
        if (!days || !price) {
            document.getElementById('offerError').textContent = 'Invalid offer data';
            return;
        }
        
        const result = subscribeToOffer(days, price);
        if (result.success) {
            document.getElementById('offerError').textContent = '';
            hideModal('offerModal');
            updateUI();
            showToast(result.message, 'success');
        } else {
            document.getElementById('offerError').textContent = result.message;
        }
    });
    
    document.getElementById('depositBtn').addEventListener('click', function() {
        document.getElementById('depositAddress').textContent = 'TCKxV... (USDT TRC20)';
        showModal('depositModal');
    });
    
    document.getElementById('confirmDeposit').addEventListener('click', function() {
        const amount = parseFloat(document.getElementById('depositAmount').value);
        const address = document.getElementById('depositAddress').textContent;
        
        if (!amount || amount <= 0) {
            document.getElementById('depositError').textContent = 'Please enter a valid amount';
            return;
        }
        
        const result = deposit(amount, address);
        if (result.success) {
            document.getElementById('depositError').textContent = '';
            hideModal('depositModal');
            document.getElementById('depositAmount').value = '';
            updateUI();
            showToast(result.message, 'success');
        } else {
            document.getElementById('depositError').textContent = result.message;
        }
    });
    
    document.getElementById('withdrawBtn').addEventListener('click', function() {
        showModal('withdrawModal');
    });
    
    document.getElementById('confirmWithdraw').addEventListener('click', function() {
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const address = document.getElementById('withdrawAddress').value.trim();
        
        if (!amount || amount <= 0) {
            document.getElementById('withdrawError').textContent = 'Please enter a valid amount';
            return;
        }
        if (!address) {
            document.getElementById('withdrawError').textContent = 'Please enter a USDT TRC20 address';
            return;
        }
        
        const result = withdraw(amount, address);
        if (result.success) {
            document.getElementById('withdrawError').textContent = '';
            hideModal('withdrawModal');
            document.getElementById('withdrawAmount').value = '';
            document.getElementById('withdrawAddress').value = '';
            updateUI();
            showToast(result.message, 'success');
        } else {
            document.getElementById('withdrawError').textContent = result.message;
        }
    });
    
    if (appData.currentUser) {
        const user = appData.currentUser;
        if (user.isActive && user.subscriptionEnd) {
            const end = new Date(user.subscriptionEnd);
            if (end <= new Date()) {
                user.isActive = false;
                user.subscriptionEnd = null;
                saveData();
            }
        }
        showPage('mainPage');
        updateUI();
    }
    
    setInterval(updateTimer, 1000);
    
    setInterval(() => {
        calculateWinners();
        updateUI();
    }, 30000);
    
    addStatusElement();
});

function addStatusElement() {
    const header = document.querySelector('.main-header');
    if (header) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'userStatus';
        statusDiv.style.cssText = `
            font-size: 0.75rem;
            padding: 4px 12px;
            border-radius: 20px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            white-space: nowrap;
        `;
        statusDiv.textContent = '🔄 Loading...';
        header.appendChild(statusDiv);
    }
}
