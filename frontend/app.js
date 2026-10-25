/* =============================================
   app.js - Shared Frontend Logic
   ============================================= */

const API = 'http://localhost:5000/api';

// ---- Token / Auth Helpers ----
const Auth = {
  getToken: () => localStorage.getItem('vsm_token'),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('vsm_user')); }
    catch { return null; }
  },
  setSession: (token, user) => {
    localStorage.setItem('vsm_token', token);
    localStorage.setItem('vsm_user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('vsm_token');
    localStorage.removeItem('vsm_user');
  },
  isLoggedIn: () => !!localStorage.getItem('vsm_token'),
  isAdmin: () => {
    const user = Auth.getUser();
    return user && user.role === 'admin';
  },
  requireAuth: (redirectTo = '/login.html') => {
    if (!Auth.isLoggedIn()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },
  requireAdmin: () => {
    if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
      window.location.href = '/admin.html';
      return false;
    }
    return true;
  },
};

// ---- API Request Helper ----
async function apiRequest(endpoint, method = 'GET', data = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  try {
    const res = await fetch(`${API}${endpoint}`, options);
    const json = await res.json();
    return { ok: res.ok, status: res.status, data: json };
  } catch (err) {
    return { ok: false, status: 0, data: { message: 'Network error. Please check your connection.' } };
  }
}

// ---- Toast Notification System ----
const Toast = (() => {
  let container;
  const init = () => {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  };
  const show = (message, type = 'info', duration = 4000) => {
    init();
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-msg">${message}</span>
      <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };
  return {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info: (msg, dur) => show(msg, 'info', dur),
  };
})();

// ---- Modal Helpers ----
const Modal = {
  show: (id) => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  },
  hide: (id) => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; document.body.style.overflow = ''; }
  },
  hideAll: () => {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.style.display = 'none';
    });
    document.body.style.overflow = '';
  },
};

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) Modal.hideAll();
});

// ---- Navbar Scroll Effect ----
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// ---- Hamburger Menu ----
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }
});

// ---- Logout ----
function logout() {
  Auth.clearSession();
  Toast.info('Logged out successfully');
  setTimeout(() => window.location.href = '/index.html', 800);
}

// ---- Format helpers ----
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getStatusBadge(status) {
  const map = {
    pending: '<span class="badge badge-pending">🕐 Pending</span>',
    confirmed: '<span class="badge badge-confirmed">✅ Confirmed</span>',
    'in-progress': '<span class="badge badge-in-progress">🔧 In Progress</span>',
    completed: '<span class="badge badge-completed">✔️ Completed</span>',
    cancelled: '<span class="badge badge-cancelled">✕ Cancelled</span>',
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

// ---- Vehicle Brands List ----
const VEHICLE_BRANDS = [
  { name: "Maruti Suzuki", country: "Japan/India" },
  { name: "Hyundai", country: "South Korea" },
  { name: "Tata Motors", country: "India" },
  { name: "Mahindra", country: "India" },
  { name: "Honda", country: "Japan" },
  { name: "Toyota", country: "Japan" },
  { name: "Kia", country: "South Korea" },
  { name: "Renault", country: "France" },
  { name: "Volkswagen", country: "Germany" },
  { name: "Skoda", country: "Czech Republic" },
  { name: "MG Motor", country: "UK/China" },
  { name: "Ford", country: "USA" },
  { name: "Nissan", country: "Japan" },
  { name: "Jeep", country: "USA" },
  { name: "BMW", country: "Germany" },
  { name: "Mercedes-Benz", country: "Germany" },
  { name: "Audi", country: "Germany" },
  { name: "Volvo", country: "Sweden" },
  { name: "Land Rover", country: "UK" },
  { name: "Jaguar", country: "UK" },
  { name: "Lexus", country: "Japan" },
  { name: "Porsche", country: "Germany" },
  { name: "Ferrari", country: "Italy" },
  { name: "Lamborghini", country: "Italy" },
  { name: "Maserati", country: "Italy" },
  { name: "Rolls-Royce", country: "UK" },
  { name: "Bentley", country: "UK" },
  { name: "Aston Martin", country: "UK" },
  { name: "McLaren", country: "UK" },
  { name: "Bugatti", country: "France" },
  { name: "Fiat", country: "Italy" },
  { name: "Alfa Romeo", country: "Italy" },
  { name: "SEAT", country: "Spain" },
  { name: "Peugeot", country: "France" },
  { name: "Citroen", country: "France" },
  { name: "Opel/Vauxhall", country: "Germany/UK" },
  { name: "Chevrolet", country: "USA" },
  { name: "Dodge", country: "USA" },
  { name: "Cadillac", country: "USA" },
  { name: "Lincoln", country: "USA" },
  { name: "GMC", country: "USA" },
  { name: "Chrysler", country: "USA" },
  { name: "Subaru", country: "Japan" },
  { name: "Mitsubishi", country: "Japan" },
  { name: "Mazda", country: "Japan" },
  { name: "Suzuki", country: "Japan" },
  { name: "Isuzu", country: "Japan" },
  { name: "Daihatsu", country: "Japan" },
  { name: "Infiniti", country: "Japan" },
  { name: "Acura", country: "Japan" },
  { name: "BYD", country: "China" },
  { name: "Geely", country: "China" },
  { name: "Great Wall", country: "China" },
  { name: "Haval", country: "China" },
  { name: "Chery", country: "China" },
  { name: "Force Motors", country: "India" },
  { name: "Datsun", country: "Japan" },
  { name: "Bajaj Qute", country: "India" },
  { name: "MINI", country: "UK" },
  { name: "Smart", country: "Germany" },
];

// ---- Vehicle Models by Brand ----
const VEHICLE_MODELS = {
  "Maruti Suzuki": ["Alto", "Alto K10", "S-Presso", "Celerio", "Wagon R", "Swift", "Dzire", "Baleno", "Ignis", "Ciaz", "Ertiga", "XL6", "Brezza", "Grand Vitara", "Jimny", "Invicto", "Eeco", "Super Carry"],
  "Hyundai": ["Santro", "Grand i10 Nios", "i20", "Aura", "Verna", "Exter", "Venue", "Creta", "Alcazar", "Tucson", "Ioniq 5", "Kona Electric"],
  "Tata Motors": ["Tiago", "Tiago EV", "Tigor", "Tigor EV", "Altroz", "Punch", "Punch EV", "Nexon", "Nexon EV", "Harrier", "Safari", "Curvv", "Curvv EV", "Sierra EV"],
  "Mahindra": ["KUV100", "Bolero", "Bolero Neo", "XUV300", "Thar", "XUV400 EV", "Scorpio Classic", "Scorpio N", "XUV700", "BE 6e", "XEV 9e"],
  "Honda": ["Amaze", "City", "City Hybrid", "Elevate", "WR-V"],
  "Toyota": ["Glanza", "Urban Cruiser Taisor", "Rumion", "Camry", "Innova Crysta", "Innova HyCross", "Fortuner", "Hilux", "Vellfire", "Land Cruiser"],
  "Kia": ["Sonet", "Seltos", "Carens", "EV6", "EV9"],
  "Renault": ["Kwid", "Triber", "Kiger"],
  "Volkswagen": ["Polo", "Virtus", "Taigun", "Tiguan"],
  "Skoda": ["Slavia", "Kushaq", "Kodiaq", "Superb", "Octavia"],
  "MG Motor": ["Hector", "Hector Plus", "Astor", "Gloster", "Comet EV", "ZS EV", "Windsor EV"],
  "Ford": ["EcoSport", "Endeavour", "Mustang", "Bronco", "F-150"],
  "Nissan": ["Magnite", "GT-R", "X-Trail", "Kicks"],
  "Jeep": ["Compass", "Meridian", "Wrangler", "Grand Cherokee"],
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series GT", "7 Series", "8 Series", "X1", "X3", "X4", "X5", "X6", "X7", "iX", "iX1", "iX3", "M3", "M5", "M8"],
  "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "AMG GT", "EQS", "EQB", "EQE"],
  "Audi": ["A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "RS5", "RS7", "e-tron", "e-tron GT"],
  "Volvo": ["S60", "S90", "V60", "XC40", "XC60", "XC90", "C40 Recharge"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Freelander", "Range Rover", "Range Rover Sport", "Range Rover Velar", "Range Rover Evoque"],
  "Jaguar": ["XE", "XF", "XJ", "E-Pace", "F-Pace", "I-Pace", "F-Type"],
  "Lexus": ["ES", "LS", "NX", "RX", "GX", "LX", "LC", "UX"],
  "Porsche": ["911", "718 Cayman", "718 Boxster", "Taycan", "Macan", "Cayenne", "Panamera"],
  "Ferrari": ["Roma", "Portofino", "SF90 Stradale", "F8 Tributo", "812 Superfast", "Purosangue"],
  "Lamborghini": ["Huracan", "Urus", "Revuelto"],
  "Maserati": ["Ghibli", "Quattroporte", "Levante", "Grecale", "GranTurismo"],
  "Rolls-Royce": ["Ghost", "Wraith", "Dawn", "Cullinan", "Spectre"],
  "Bentley": ["Continental GT", "Flying Spur", "Bentayga"],
  "Aston Martin": ["DB11", "DBS", "Vantage", "DBX"],
  "McLaren": ["Artura", "GT", "720S", "765LT"],
  "Bugatti": ["Chiron", "Veyron", "Divo"],
  "Fiat": ["Punto", "Linea", "Avventura", "Urbana", "500"],
  "Alfa Romeo": ["Giulia", "Giulietta", "Stelvio", "Tonale"],
  "SEAT": ["Ibiza", "Leon", "Ateca", "Tarraco"],
  "Peugeot": ["208", "308", "408", "3008", "5008", "2008"],
  "Citroen": ["C3", "C3 Aircross", "C5 Aircross", "C6"],
  "Opel/Vauxhall": ["Astra", "Corsa", "Mokka", "Grandland"],
  "Chevrolet": ["Spark", "Beat", "Cruze", "Malibu", "Camaro", "Corvette", "Tahoe", "Suburban", "Trailblazer"],
  "Dodge": ["Challenger", "Charger", "Durango", "RAM 1500"],
  "Cadillac": ["CT4", "CT5", "XT4", "XT5", "XT6", "Escalade", "LYRIQ"],
  "Lincoln": ["Corsair", "Nautilus", "Aviator", "Navigator"],
  "GMC": ["Sierra", "Canyon", "Terrain", "Acadia", "Yukon"],
  "Chrysler": ["300", "Pacifica", "Voyager"],
  "Subaru": ["Impreza", "Outback", "Forester", "Crosstrek", "Ascent", "WRX", "BRZ", "Solterra"],
  "Mitsubishi": ["Colt", "Eclipse Cross", "Outlander", "Pajero", "L200", "ASX"],
  "Mazda": ["2", "3", "6", "CX-3", "CX-5", "CX-8", "CX-9", "MX-5 Miata", "MX-30"],
  "Suzuki": ["Alto", "Swift", "Vitara", "S-Cross", "Jimny", "Baleno", "Ignis"],
  "Isuzu": ["D-Max", "MU-X"],
  "Daihatsu": ["Move", "Tanto", "Mira", "Terios", "Sirion"],
  "Infiniti": ["Q50", "Q60", "QX50", "QX60", "QX80"],
  "Acura": ["ILX", "TLX", "RDX", "MDX", "NSX"],
  "BYD": ["Atto 3", "Seal", "Dolphin", "Han", "Tang", "Seagull"],
  "Geely": ["Coolray", "Azkarra", "Okavango", "Radar RD6"],
  "Great Wall": ["Haval H6", "Haval Jolion", "ORA R1", "Poer"],
  "Haval": ["H2", "H4", "H6", "H9", "Jolion", "Dargo"],
  "Chery": ["Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 6"],
  "Force Motors": ["Gurkha", "Trax", "Traveller"],
  "Datsun": ["Go", "Go+", "Redi-Go"],
  "Bajaj Qute": ["Qute RE60"],
  "MINI": ["Cooper", "Cooper S", "Clubman", "Countryman", "Paceman", "Cabrio"],
  "Smart": ["#1", "#3", "EQ Fortwo", "EQ Forfour"],
};

// Get models for a specific brand
function getModelsForBrand(brandName) {
  return VEHICLE_MODELS[brandName] || [];
}

// Populate brand dropdown
function populateBrandSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">-- Select Vehicle Brand --</option>';
  const groups = {};
  VEHICLE_BRANDS.forEach(b => {
    if (!groups[b.country]) groups[b.country] = [];
    groups[b.country].push(b.name);
  });
  // Flatten to simple sorted list
  VEHICLE_BRANDS.sort((a, b) => a.name.localeCompare(b.name)).forEach(brand => {
    const opt = document.createElement('option');
    opt.value = brand.name;
    opt.textContent = `${brand.name} (${brand.country})`;
    select.appendChild(opt);
  });
}

// ---- Update Navbar based on auth state ----
function updateNavbar() {
  const user = Auth.getUser();
  const navActions = document.getElementById('navActions');
  if (!navActions) return;

  if (user) {
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    if (user.role === 'admin') {
      navActions.innerHTML = `
        <div class="nav-user-info">
          <div class="nav-avatar" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">${initial}</div>
          <span style="font-size:0.875rem; color:var(--text-secondary);">Admin</span>
        </div>
        <a href="/admin-dashboard.html" class="btn btn-accent btn-sm">Dashboard</a>
        <button onclick="logout()" class="btn btn-secondary btn-sm">Logout</button>
      `;
    } else {
      navActions.innerHTML = `
        <div class="nav-user-info">
          <div class="nav-avatar">${initial}</div>
          <span style="font-size:0.875rem; color:var(--text-secondary);">${user.name}</span>
        </div>
        <a href="/dashboard.html" class="btn btn-primary btn-sm">My Bookings</a>
        <button onclick="logout()" class="btn btn-secondary btn-sm">Logout</button>
      `;
    }
  } else {
    navActions.innerHTML = `
      <a href="/login.html" class="btn btn-secondary btn-sm">Login</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }
}

// Call on every page load
document.addEventListener('DOMContentLoaded', updateNavbar);
