// ========== DATABASE ==========
const db = {
  students: JSON.parse(localStorage.getItem('students') || '[]')
};

// ========== LOGIN SYSTEM ==========
let currentUser = null;
let currentRole = null;

function login() {
  const role = document.getElementById('userRole').value;
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value;
  
  if(role === 'teacher' && user === 'teacher' && pass === '1234') {
    currentUser = user;
    currentRole = 'teacher';
    showApp();
  } else if(role === 'student') {
    const student = db.students.find(s => s.id === user && pass === '1234');
    if(student) {
      currentUser = user;
      currentRole = 'student';
      showApp();
    } else {
      document.getElementById('loginError').innerText = 'Invalid ID or Password';
    }
  } else {
    document.getElementById('loginError').innerText = 'Invalid login';
  }
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
  localStorage.setItem('loggedIn', JSON.stringify({
    user: currentUser,
    role: currentRole
  }));
  refreshAll();
  loadAttendance();
}

function logout() {
  localStorage.removeItem('loggedIn');
  location.reload();
}

// ========== STUDENT FUNCTIONS ==========
function addStudent() {
  const id = document.getElementById('s_id').value.trim();
  const name = document.getElementById('s_name').value.trim();
  const phone = document.getElementById('s_phone').value.trim();
  
  if(!id ||!name) {
    alert('ID and Name required');
    return;
  }
  
  const exists = db.students.find(s => s.id === id);
  if(exists) {
    exists.name = name;
    exists.phone = phone;
  } else {
    db.students.push({id, name, phone});
  }
  
  localStorage.setItem('students', JSON.stringify(db.students));
  document.getElementById('s_id').value = '';
  document.getElementById('s_name').value = '';
  document.getElementById('s_phone').value = '';
  refreshStudents();
}

function refreshStudents() {
  db.students = JSON.parse(localStorage.getItem('students') || '[]');
  let html = '<table border="1" style="width:100%; margin-top:10px"><tr><th>ID</th><th>Name</th><th>Phone</th></tr>';
  db.students.forEach(s => {
    html += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.phone}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('student_list').innerHTML = html;
  updateDropdowns();
}

// ========== ATTENDANCE SYSTEM ==========
function loadAttendance() {
  const date = document.getElementById('attendanceDate').value;
  const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
  const dayData = attendance[date] || {};
  
  let html = '<table border="1" style="width:100%; border-collapse:collapse"><tr><th>ID</th><th>Name</th><th>Present</th></tr>';
  db.students.forEach(s => {
    const checked = dayData[s.id]? 'checked' : '';
    const disabled = currentRole === 'student'? 'disabled' : '';
    html += `<tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td><input type="checkbox" class="attCheck" data-id="${s.id}" ${checked} ${disabled}></td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('attendanceList').innerHTML = html;
  loadMonthlyReport();
}

function saveAttendance() {
  if (currentRole!== 'teacher') {
    alert('Only teacher allowed');
    return;
  }
  const date = document.getElementById('attendanceDate').value;
  const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
  attendance[date] = {};
  document.querySelectorAll('.attCheck').forEach(box => {
    attendance[date][box.dataset.id] = box.checked;
  });
  localStorage.setItem('attendance', JSON.stringify(attendance));
  alert('Saved!');
  loadMonthlyReport();
}

function loadMonthlyReport() {
  const month = document.getElementById('reportMonth').value;
  const year = new Date().getFullYear();
  const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');
  let totalDays = 0;
  
  for (let d in attendance) {
    if (d.startsWith(`${year}-${String(month).padStart(2,'0')}`)) {
      totalDays++;
    }
  }
  
  let html = `<p><b>Total Working Days: ${totalDays}</b></p>`;
  html += '<table border="1" style="width:100%; border-collapse:collapse"><tr><th>ID</th><th>Name</th><th>Present</th><th>%</th></tr>';
  
  db.students.forEach(s => {
    let present = 0;
    for (let d in attendance) {
      if (d.startsWith(`${year}-${String(month).padStart(2,'0')}`) && attendance[d][s.id]) {
        present++;
      }
    }
    const percent = totalDays? ((present / totalDays) * 100).toFixed(1) : 0;
    if (currentRole === 'teacher' || currentUser === s.id) {
      html += `<tr><td>${s.id}</td><td>${s.name}</td><td>${present}</td><td>${percent}%</td></tr>`;
    }
  });
  html += '</table>';
  document.getElementById('monthlyReport').innerHTML = html;
}

// ========== UTILS ==========
function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById(tab).style.display = 'block';
  if(tab === 'attendance') loadAttendance();
}

function refreshAll() {
  refreshStudents();
  // Add other refresh functions here later
}

function updateDropdowns() {
  // For enrollment/marks tabs later
}

// ========== AUTO LOGIN ==========
window.onload = function () {
  const saved = JSON.parse(localStorage.getItem('loggedIn') || 'null');
  if (saved) {
    currentUser = saved.user;
    currentRole = saved.role;
    document.getElementById('userRole').value = currentRole;
    document.getElementById('username').value = currentUser;
    document.getElementById('password').value = '1234';
    showApp();
  }
  document.getElementById('reportMonth').value = new Date().getMonth() + 1;
  refreshAll();
};
