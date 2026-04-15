function handleBooking(serviceName) {
    // For now, we simulate a check
    const isLoggedIn = false; // This will later be handled by your login logic

    if (!isLoggedIn) {
        alert(`To book a ${serviceName} appointment, please login first!`);
        window.location.href = "login.html";
    } else {
        // Redirect to user dashboard or booking form
        window.location.href = "dashboard-user.html";
    }
}


// Variable to track the current role (default: user)
let currentRole = 'user';

function setRole(role) {
    currentRole = role;

    // Update UI buttons
    const userBtn = document.getElementById('userBtn');
    const adminBtn = document.getElementById('adminBtn');

    if (role === 'admin') {
        adminBtn.classList.add('active');
        userBtn.classList.remove('active');
    } else {
        userBtn.classList.add('active');
        adminBtn.classList.remove('active');
    }
}

// Handle Form Submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent page refresh

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log(`Logging in as ${currentRole}:`, email);

        // Redirect logic based on role
        if (currentRole === 'admin') {
            window.location.href = "dashboard-admin.html";
        } else {
            window.location.href = "dashboard-user.html";
        }
    });
}







// --- NEW USER BOOKING LOGIC ---
// We need this variable to remember which service was clicked 
// because the form itself doesn't know.
let selectedServiceForBooking = "";

function openBooking(serviceName) {
    selectedServiceForBooking = serviceName;
    const modal = document.getElementById('bookingModal');
    const title = document.getElementById('modalTitle');

    if (modal) {
        title.innerText = `Book ${serviceName}`;
        modal.style.display = 'flex';
    }
}

function closeBooking() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal if user clicks outside the box
window.onclick = function (event) {
    const modal = document.getElementById('bookingModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Handle Reservation Form
const reservationForm = document.getElementById('reservationForm');
if (reservationForm) {
    reservationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('userEmail').value;
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;

        // 1. Create a new reservation object
        const newReservation = {
            id: Date.now(), // Unique ID
            email: email,
            service: selectedServiceForBooking,
            date: date,
            time: time
        };

        // 2. Add to the global reservations array
        reservations.push(newReservation);

        // 3. SAVE to LocalStorage so the Admin Panel can read it
        saveData();

        alert(`Success! Your appointment for ${selectedServiceForBooking} is confirmed for ${date} at ${time}.`);

        closeBooking();
        reservationForm.reset(); // Clear the form for next time
    });
}








//Admin Dashboard Logic
// --- DATA MANAGEMENT (Local Storage) ---
// This ensures that changes made by Admin persist and show up for the User.
let services = JSON.parse(localStorage.getItem('services')) || [
    { id: 1, name: 'Hair Styling', icon: '💇‍♀️', desc: 'Cuts, coloring, and treatments.' },
    { id: 2, name: 'Nail Art', icon: '💅', desc: 'Manicures and pedicures.' },
    { id: 3, name: 'Spa & Massage', icon: '🧖‍♀️', desc: 'Deep tissue relaxation.' }
];

let reservations = JSON.parse(localStorage.getItem('reservations')) || [];

function saveData() {
    localStorage.setItem('services', JSON.stringify(services));
    localStorage.setItem('reservations', JSON.stringify(reservations));
}

// --- SHARED UI RENDERING ---

// Run this on dashboard-user.html to show services the Admin added
function renderUserServices() {
    const grid = document.querySelector('.services-grid');
    if (!grid) return;

    grid.innerHTML = services.map(s => `
        <div class="service-card">
            <div class="service-icon">${s.icon}</div>
            <h3>${s.name}</h3>
            <p>${s.desc}</p>
            <button onclick="openBooking('${s.name}')" class="book-btn">Book Now</button>
        </div>
    `).join('');
}

// --- ADMIN SIDEBAR & TOGGLE ---
function showSection(section) {
    const resSec = document.getElementById('reservations-section');
    const servSec = document.getElementById('services-section');

    if (!resSec || !servSec) return;

    resSec.style.display = section === 'reservations' ? 'block' : 'none';
    servSec.style.display = section === 'services-manage' ? 'block' : 'none';

    document.getElementById('link-res').classList.toggle('active', section === 'reservations');
    document.getElementById('link-serv').classList.toggle('active', section === 'services-manage');

    if (section === 'reservations') renderAdminReservations();
    else renderAdminServices();
}

// --- ADMIN: MANAGE RESERVATIONS ---
function renderAdminReservations() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    // Sort by Date and Time (Earliest First)
    reservations.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    tbody.innerHTML = reservations.map(res => `
        <tr>
            <td>${res.email}</td>
            <td>${res.service}</td>
            <td>${res.date} | ${res.time}</td>
            <td>
                <button class="edit-btn" onclick="editReservation(${res.id})">Edit</button>
                <button class="delete-btn" onclick="deleteReservation(${res.id})">Cancel</button>
            </td>
        </tr>
    `).join('');
}

// --- ADMIN: MANAGE SERVICES ---
function renderAdminServices() {
    const grid = document.getElementById('adminServicesGrid');
    if (!grid) return;

    grid.innerHTML = services.map(s => `
        <div class="admin-service-card">
            <h3>${s.icon} ${s.name}</h3>
            <p>${s.desc}</p>
            <div style="margin-top:10px">
                <button class="edit-btn" onclick="openServiceModal(${s.id})">Edit</button>
                <button class="delete-btn" onclick="deleteService(${s.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// --- MODAL LOGIC (ADD/EDIT) ---
function openServiceModal(id = null) {
    const modal = document.getElementById('adminModal');
    const inputArea = document.getElementById('modalInputs');
    const title = document.getElementById('adminModalTitle');

    const service = id ? services.find(s => s.id === id) : { name: '', icon: '✨', desc: '' };

    title.innerText = id ? "Edit Service" : "Add New Service";
    inputArea.innerHTML = `
        <input type="hidden" id="serviceId" value="${id || ''}">
        <div class="input-group">
            <label>Service Name</label>
            <input type="text" id="sName" value="${service.name}" required>
        </div>
        <div class="input-group">
            <label>Icon (Emoji)</label>
            <input type="text" id="sIcon" value="${service.icon}" required>
        </div>
        <div class="input-group">
            <label>Description</label>
            <textarea id="sDesc" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ddd;">${service.desc}</textarea>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('adminForm').onsubmit = function (e) {
        e.preventDefault();
        const sId = document.getElementById('serviceId').value;
        const newService = {
            id: sId ? parseInt(sId) : Date.now(),
            name: document.getElementById('sName').value,
            icon: document.getElementById('sIcon').value,
            desc: document.getElementById('sDesc').value
        };

        if (sId) {
            const index = services.findIndex(s => s.id === parseInt(sId));
            services[index] = newService;
        } else {
            services.push(newService);
        }

        saveData();
        closeAdminModal();
        renderAdminServices();
    };
}

function deleteService(id) {
    if (confirm("Delete this service? It will disappear for users too.")) {
        services = services.filter(s => s.id !== id);
        saveData();
        renderAdminServices();
    }
}

// --- HELPER FUNCTIONS ---
function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

// Run correct render based on which page we are on
window.onload = () => {
    renderUserServices(); // Works on dashboard-user.html
    renderAdminReservations(); // Works on dashboard-admin.html
};