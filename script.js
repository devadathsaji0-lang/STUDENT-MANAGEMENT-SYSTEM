// ========== DATA ==========
let db = JSON.parse(localStorage.getItem('sms_data')) || {
  students: [], courses: [], faculty: [], enrollments: [],
  attendance: {}, marks: {}, photos: {}
};

let currentUser = '', currentRole = '', tempPhoto = '';

function saveDB() {
  localStorage.setItem('sms_data', JSON.stringify(db));
}

// ========== LOGIN ==========
function login() {
  const role = document.getElementById('userRole').value;
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  if (!user || !pass) {
    document.getElementById('loginError').innerText = 'Enter all fields';
    return;
  }

  if (role === 'teacher' && user === 'admin' && pass === '1234') {
    currentUser = user;
    currentRole = 'teacher';
  } else if (role === 'student' && db.students.some(s => s.id === user && pass === '1234')) {
    currentUser = user;
    currentRole = 'student';
  } else {
    document.getElementById('loginError').innerText = 'Invalid credentials';
    return;
  }

  localStorage.setItem('loggedIn', JSON.stringify({ user, role: currentRole }));
  showApp();
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  const btn = document.getElementById('attendanceTabBtn');
  if (btn) btn.style.display = currentRole === 'teacher' ? 'block' : 'none';

  refreshAll();
}

function logout() {
  localStorage.removeItem('loggedIn');
  location.reload();
}

// ========== PHOTO ==========
function previewPhoto(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      tempPhoto = e.target.result;
      document.getElementById('s_photo_preview').src = tempPhoto;
    };
    reader.readAsDataURL(file);
  }
}

// ========== STUDENTS ==========
function addStudent() {
  const id = document.getElementById('s_id').value;
  const name = document.getElementById('s_name').value;
  const phone = document.getElementById('s_phone').value;
  const course = document.getElementById('s_course').value;

  if (!id || !name) return alert('ID and Name required');

  const idx = db.students.findIndex(s => s.id === id);
  if (idx >= 0) db.students[idx] = { id, name, phone, course };
  else db.students.push({ id, name, phone, course });

  if (tempPhoto) db.photos[id] = tempPhoto;
  if (!db.marks[id]) db.marks[id] = { sem: {}, cgpa: 0 };

  saveDB();
  refreshStudents();
  clearStudentForm();
}

function clearStudentForm() {
  ['s_id','s_name','s_phone','s_course'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('s_photo_preview').src =
    'https://via.placeholder.com/120x150?text=Photo';
  tempPhoto = '';
}

function refreshStudents() {
  let html = '<table><tr><th>Photo</th><th>ID</th><th>Name</th><th>Phone</th><th>Course</th><th>CGPA</th><th>Action</th></tr>';

  db.students.forEach(s => {
    const photo = db.photos[s.id] || 'https://via.placeholder.com/40x50?text=No+Photo';
    const cgpa = db.marks[s.id]?.cgpa?.toFixed(2) || '0.00';

    html += `<tr>
      <td><img src="${photo}" style="width:40px;height:50px"></td>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.phone || '-'}</td>
      <td>${s.course || '-'}</td>
      <td>${cgpa}</td>
      <td>
        <button onclick="editStudent('${s.id}')">Edit</button>
        <button onclick="delStudent('${s.id}')">Del</button>
      </td>
    </tr>`;
  });

  document.getElementById('student_list').innerHTML = html + '</table>';
  updateDropdowns();
}

function editStudent(id) {
  const s = db.students.find(s => s.id === id);
  if (!s) return;

  document.getElementById('s_id').value = s.id;
  document.getElementById('s_name').value = s.name;
  document.getElementById('s_phone').value = s.phone;
  document.getElementById('s_course').value = s.course || '';

  if (db.photos[id]) {
    document.getElementById('s_photo_preview').src = db.photos[id];
  }
}

function delStudent(id) {
  if (!confirm('Delete student?')) return;

  db.students = db.students.filter(s => s.id !== id);
  delete db.photos[id];
  delete db.marks[id];

  saveDB();
  refreshStudents();
}

// ========== GRADE CARD FIX ==========
function updateSub(sid, sem, idx, field, val) {
  if (!db.marks[sid] || !db.marks[sid].sem[sem]) return;

  db.marks[sid].sem[sem][idx][field] =
    field === 'subject' ? val : Number(val || 0);

  saveDB();

  //  IMPORTANT FIX → avoid infinite reload
  setTimeout(() => loadSemData(sid), 100);
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

  const month = document.getElementById('reportMonth');
  if (month) month.value = new Date().getMonth() + 1;

  refreshAll();
};
