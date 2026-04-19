const BASE_URL = 'https://college-api-pohn.onrender.com';

// LOGIN/LOGOUT
document.getElementById('loginBtn').onclick = () => {
  const user = document.getElementById('username').value;
  if (!user) return document.getElementById('loginError').innerText = 'Enter Username';
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  loadAllData();
};

document.getElementById('logoutBtn').onclick = () => {
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'block';
};

// TABS
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  };
});

// LOAD ALL DATA ON START
async function loadAllData() {
  loadStudents();
  loadCourses();
  loadFaculty();
  loadAttendance();
}

// 1. STUDENTS
async function loadStudents() {
  const res = await fetch(`${BASE_URL}/students`);
  const data = await res.json();
  let html = '<table border="1"><tr><th>ID</th><th>Name</th><th>Phone</th><th>Course</th></tr>';
  data.forEach(i => {
    html += `<tr><td>${i.id}</td><td>${i.name}</td><td>${i.phone}</td><td>${i.course}</td></tr>`;
  });
  document.getElementById('student_list').innerHTML = html + '</table>';
}

document.getElementById('saveStudentBtn').onclick = async () => {
  const body = {
    id: document.getElementById('s_id').value,
    name: document.getElementById('s_name').value,
    phone: document.getElementById('s_phone').value,
    course: document.getElementById('s_course').value,
    photo: document.getElementById('s_photo_preview').src
  };
  if (!body.id ||!body.name) return alert('ID and Name required');
  await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  alert('Student Saved to MongoDB!');
  loadStudents();
};

// 2. COURSES
async function loadCourses() {
  const res = await fetch(`${BASE_URL}/courses`);
  const data = await res.json();
  let html = '<table border="1"><tr><th>ID</th><th>Name</th><th>Credits</th></tr>';
  data.forEach(i => {
    html += `<tr><td>${i.id}</td><td>${i.name}</td><td>${i.credits}</td></tr>`;
  });
  document.getElementById('course_list').innerHTML = html + '</table>';
}

document.getElementById('saveCourseBtn').onclick = async () => {
  const body = {
    id: document.getElementById('c_id').value,
    name: document.getElementById('c_name').value,
    credits: document.getElementById('c_credits').value
  };
  if (!body.id) return alert('Course ID required');
  await fetch(`${BASE_URL}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  alert('Course Saved to MongoDB!');
  loadCourses();
};

// 3. FACULTY
async function loadFaculty() {
  const res = await fetch(`${BASE_URL}/faculty`);
  const data = await res.json();
  let html = '<table border="1"><tr><th>ID</th><th>Name</th><th>Dept</th></tr>';
  data.forEach(i => {
    html += `<tr><td>${i.id}</td><td>${i.name}</td><td>${i.dept}</td></tr>`;
  });
  document.getElementById('faculty_list').innerHTML = html + '</table>';
}

document.getElementById('saveFacultyBtn').onclick = async () => {
  const body = {
    id: document.getElementById('f_id').value,
    name: document.getElementById('f_name').value,
    dept: document.getElementById('f_dept').value
  };
  if (!body.id) return alert('Faculty ID required');
  await fetch(`${BASE_URL}/faculty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  alert('Faculty Saved to MongoDB!');
  loadFaculty();
};

// 4. ATTENDANCE
async function loadAttendance() {
  const res = await fetch(`${BASE_URL}/attendance`);
  const data = await res.json();
  let html = '<table border="1"><tr><th>Name</th><th>Status</th><th>Date</th></tr>';
  data.forEach(i => {
    html += `<tr><td>${i.name}</td><td>${i.status}</td><td>${i.date}</td></tr>`;
  });
  document.getElementById('monthlyReport').innerHTML = html + '</table>';
  document.getElementById('attendanceList').innerHTML = `
    <input type="text" id="att_name" placeholder="Student Name">
    <select id="att_status"><option>Present</option><option>Absent</option></select>
  `;
}

document.getElementById('saveAttendanceBtn').onclick = async () => {
  const name = document.getElementById('att_name').value;
  const status = document.getElementById('att_status').value;
  const date = document.getElementById('attendanceDate').value || new Date().toLocaleDateString();
  if (!name) return alert('Enter name');
  await fetch(`${BASE_URL}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, status, date })
  });
  alert('Saved to MongoDB!');
  document.getElementById('att_name').value = '';
  loadAttendance();
};

// PHOTO PREVIEW
document.getElementById('s_photo').onchange = e => {
  const reader = new FileReader();
  reader.onload = () => document.getElementById('s_photo_preview').src = reader.result;
  reader.readAsDataURL(e.target.files[0]);
};
