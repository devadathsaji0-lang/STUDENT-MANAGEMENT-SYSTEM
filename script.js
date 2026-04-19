const API_URL = 'https://college-api-pohn.onrender.com/attendance';

// Login Logic - Simple
document.getElementById('loginBtn').onclick = () => {
  const user = document.getElementById('username').value;
  if (!user) {
    document.getElementById('loginError').innerText = 'Enter Username';
    return;
  }
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
};

document.getElementById('logoutBtn').onclick = () => {
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'block';
};

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  };
});

// ATTENDANCE LOGIC - ഇത് മാത്രം Backend-മായി Connect ആയി
async function loadAttendance() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    
    // 1. Show all attendance records in a list
    let html = '<table border="1"><tr><th>Name</th><th>Status</th><th>Date</th></tr>';
    data.forEach(i => {
      html += `<tr><td>${i.name}</td><td>${i.status}</td><td>${i.date}</td></tr>`;
    });
    document.getElementById('monthlyReport').innerHTML = html + '</table>';
    
    // 2. Simple mark attendance form
    document.getElementById('attendanceList').innerHTML = `
      <input type="text" id="att_name" placeholder="Student Name">
      <select id="att_status"><option>Present</option><option>Absent</option></select>
    `;
    
  } catch (err) {
    document.getElementById('monthlyReport').innerHTML = 'Error loading: ' + err;
  }
}

document.getElementById('saveAttendanceBtn').onclick = async () => {
  const name = document.getElementById('att_name').value;
  const status = document.getElementById('att_status').value;
  const date = document.getElementById('attendanceDate').value || new Date().toLocaleDateString();
  
  if (!name) return alert('Enter name');
  
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, status, date })
  });
  
  document.getElementById('att_name').value = '';
  loadAttendance(); // Refresh list
};

// Load attendance when page opens
loadAttendance();

// ബാക്കി Tabs-ന് ഇപ്പൊ Dummy Data
document.getElementById('saveStudentBtn').onclick = () => alert('Student API not ready yet. Only Attendance works.');
document.getElementById('saveCourseBtn').onclick = () => alert('Course API not ready yet.');
document.getElementById('saveFacultyBtn').onclick = () => alert('Faculty API not ready yet.');
