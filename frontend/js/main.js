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
    loginForm.addEventListener('submit', function(e) {
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



// Modal Functions
function openBooking(serviceName) {
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
window.onclick = function(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Handle Reservation Form
const reservationForm = document.getElementById('reservationForm');
if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('userEmail').value;
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;

        alert(`Success! A confirmation email has been sent to ${email} for your appointment on ${date} at ${time}.`);
        
        closeBooking();
        // Here is where you'd later refresh the calendar logic
    });
}



//Admin Dashboard Logic
// --- MOCK DATA ---
let reservations = [
    { id: 1, email: 'nina@test.com', service: 'Hair Styling', date: '2024-06-20', time: '14:00' },
    { id: 2, email: 'marco@test.com', service: 'Nail Art', date: '2024-06-15', time: '09:00' },
    { id: 3, email: 'sara@test.com', service: 'Spa', date: '2024-06-15', time: '11:00' }
];

let services = [
    { id: 1, name: 'Hair Styling', icon: '💇‍♀️', desc: 'Cuts and color.' },
    { id: 2, name: 'Nail Art', icon: '💅', desc: 'Manicures.' },
    { id: 3, name: 'Spa & Massage', icon: '🧖‍♀️', desc: 'Relaxation.' }
];

// --- SECTION TOGGLE ---
function showSection(section) {
    document.getElementById('reservations-section').style.display = section === 'reservations' ? 'block' : 'none';
    document.getElementById('services-section').style.display = section === 'services-manage' ? 'block' : 'none';
    
    document.getElementById('link-res').classList.toggle('active', section === 'reservations');
    document.getElementById('link-serv').classList.toggle('active', section === 'services-manage');

    if(section === 'reservations') renderReservations();
    else renderServices();
}

// --- RESERVATION LOGIC (SORTING) ---
function renderReservations() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    // SORTING: Earliest date first, then earliest time
    reservations.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA - dateTimeB;
    });

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

// --- SERVICE LOGIC ---
function renderServices() {
    const grid = document.getElementById('adminServicesGrid');
    if (!grid) return;

    grid.innerHTML = services.map(s => `
        <div class="admin-service-card">
            <h3>${s.icon} ${s.name}</h3>
            <p>${s.desc}</p>
            <button class="edit-btn" onclick="editService(${s.id})">Edit</button>
            <button class="delete-btn" onclick="deleteService(${s.id})">Delete</button>
        </div>
    `).join('');
}

// --- EDITING LOGIC ---
function editReservation(id) {
    const res = reservations.find(r => r.id === id);
    const modal = document.getElementById('adminModal');
    const inputArea = document.getElementById('modalInputs');
    
    document.getElementById('adminModalTitle').innerText = "Edit Reservation";
    inputArea.innerHTML = `
        <input type="hidden" id="editId" value="${res.id}">
        <label>Service</label>
        <select id="editService" class="input-group">
            ${services.map(s => `<option value="${s.name}" ${s.name === res.service ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
        <label>Date</label>
        <input type="date" id="editDate" value="${res.date}" class="input-group">
        <label>Time</label>
        <input type="time" id="editTime" value="${res.time}" class="input-group">
    `;
    modal.style.display = 'flex';

    document.getElementById('adminEditForm').onsubmit = function(e) {
        e.preventDefault();
        res.service = document.getElementById('editService').value;
        res.date = document.getElementById('editDate').value;
        res.time = document.getElementById('editTime').value;
        closeAdminModal();
        renderReservations();
    };
}

function deleteReservation(id) {
    reservations = reservations.filter(r => r.id !== id);
    renderReservations();
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

// Initialize
window.onload = renderReservations;