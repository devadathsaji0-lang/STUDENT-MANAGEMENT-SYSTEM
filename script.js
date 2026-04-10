// ========== DATABASE + DEMO DATA ==========
const TEACHER_ACCOUNTS = [
  {username: "teacher", password: "1234"},
  {username: "admin", password: "1234"},
  {username: "principal", password: "1234"}
];

let savedStudents = JSON.parse(localStorage.getItem('students') || '[]');

const db = {
  students: savedStudents,
  courses: JSON.parse(localStorage.getItem('courses') || '[]'),
  faculty: JSON.parse(localStorage.getItem('faculty') || '[]'),
  enroll: JSON.parse(localStorage.getItem('enroll') || '[]'),
  marks: JSON.parse(localStorage.getItem('marks') || '[]')
};

// ========== GRADE CALCULATION ==========
function getGrade(marks) {
  const m = parseInt(marks);
  if(m >= 90) return {grade: 'A+', status: 'Pass'};
  if(m >= 80) return {grade: 'A', status: 'Pass'};
  if(m >= 70) return {grade: 'B+', status: 'Pass'};
  if(m >= 60) return {grade: 'B', status: 'Pass'};
  if(m >= 50) return {grade: 'C', status: 'Pass'};
  if(m >= 40) return {grade: 'D', status: 'Pass'};
  return {grade: 'F', status: 'Fail'};
}

// ========== LOGIN SYSTEM ==========
let currentUser = null;
let currentRole = null;

function login() {
  const role = document.getElementById('userRole').value;
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value;
  
  if(role === 'teacher') {
    const teacher = TEACHER_ACCOUNTS.find(t => t.username === user && t.password === pass);
    if(teacher) {
      currentUser = user;
      currentRole = 'teacher';
      showApp();
    } else {
      document.getElementById('loginError').innerText = 'Invalid teacher credentials';
    }
  } else if(role === 'student') {
    if(pass === '1234' && user) {
      let student = db.students.find(s => s.id === user);
      if(!student) {
        student = {id: user, name: `Student ${user}`, phone: ""};
        db.students.push(student);
        localStorage.setItem('students', JSON.stringify(db.students));
      }
      currentUser = user;
      currentRole = 'student';
      showApp();
    } else {
      document.getElementById('loginError').innerText = 'Password must be 1234';
    }
  } else {
    document.getElementById('loginError').innerText = 'Select a role';
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
  
  if(currentRole === 'student') {
    ['students','courses','faculty','enroll'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.style.display = 'none';
    });
    showTab('marks'); // Students see results first
  }
  
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

// ========== COURSE FUNCTIONS ==========
function addCourse() {
  const id = document.getElementById('c_id').value.trim();
  const name = document.getElementById('c_name').value.trim();
  const credits = document.getElementById('c_credits').value.trim();
  if(!id ||!name) {
    alert('Course ID and Name required');
    return;
  }
  db.courses.push({id, name, credits});
  localStorage.setItem('courses', JSON.stringify(db.courses));
  refreshCourses();
}

function refreshCourses() {
  db.courses = JSON.parse(localStorage.getItem('courses') || '[]');
  let html = '<table border="1" style="width:100%; margin-top:10px"><tr><th>ID</th><th>Name</th><th>Credits</th></tr>';
  db.courses.forEach(c => {
    html += `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.credits}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('course_list').innerHTML = html;
  updateDropdowns();
}

// ========== FACULTY FUNCTIONS ==========
function addFaculty() {
  const id = document.getElementById('f_id').value.trim();
  const name = document.getElementById('f_name').value.trim();
  const dept = document.getElementById('f_dept').value.trim();
  if(!id ||!name) {
    alert('Faculty ID and Name required');
    return;
  }
  db.faculty.push({id, name, dept});
  localStorage.setItem('faculty', JSON.stringify(db.faculty));
  refreshFaculty();
}

function refreshFaculty() {
  db.faculty = JSON.parse(localStorage.getItem('faculty') || '[]');
  let html = '<table border="1" style="width:100%; margin-top:10px"><tr><th>ID</th><th>Name</th><th>Dept</th></tr>';
  db.faculty.forEach(f => {
    html += `<tr><td>${f.id}</td><td>${f.name}</td><td>${f.dept}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('faculty_list').innerHTML = html;
}

// ========== ENROLL FUNCTIONS ==========
function enrollStudent() {
  const studentId = document.getElementById('e_student').value;
  const courseId = document.getElementById('e_course').value;
  if(!studentId ||!courseId) {
    alert('Select both student and course');
    return;
  }
  db.enroll.push({studentId, courseId});
  localStorage.setItem('enroll', JSON.stringify(db.enroll));
  refreshEnroll();
}

function refreshEnroll() {
  db.enroll = JSON.parse(localStorage.getItem('enroll') || '[]');
  let html = '<table border="1" style="width:100%; margin-top:10px"><tr><th>Student</th><th>Course</th></tr>';
  db.enroll.forEach(e => {
    html += `<tr><td>${e.studentId}</td><td>${e.courseId}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('enroll_list').innerHTML = html;
}

// ========== MARKS FUNCTIONS WITH GRADE ==========
function addMarks() {
  const studentId = document.getElementById('m_student').value;
  const courseId = document.getElementById('m_course').value;
  const marks = document.getElementById('m_marks').value;
  
  if(!studentId ||!courseId ||!marks) {
    alert('Fill all fields');
    return;
  }
  
  if(marks < 0 || marks > 100) {
    alert('Marks must be 0-100');
    return;
  }
  
  // Update if exists, else add new
  const existing = db.marks.findIndex(m => m.studentId === studentId && m.courseId === courseId);
  if(existing >= 0) {
    db.marks[existing].marks = marks;
  } else {
    db.marks.push({studentId, courseId, marks});
  }
  
  localStorage.setItem('marks', JSON.stringify(db.marks));
  document.getElementById('m_marks').value = '';
  refreshMarks();
}

function refreshMarks() {
  db.marks = JSON.parse(localStorage.getItem('marks') || '[]');
  let html = '<table border="1" style="width:100%; margin-top:10px; border-collapse:collapse"><tr><th>Student</th><th>Course</th><th>Marks</th><th>Grade</th><th>Result</th></tr>';
  
  db.marks.forEach(m => {
    // Show only current student's marks if student logged in
    if(currentRole === 'teacher' || currentUser === m.studentId) {
      const g = getGrade(m.marks);
      const color = g.status === 'Pass'? 'green' : 'red';
      html += `<tr>
        <td>${m.studentId}</td>
        <td>${m.courseId}</td>
        <td>${m.marks}</td>
        <td><b>${g.grade}</b></td>
        <td style="color:${color}"><b>${g.status}</b></td>
      </tr>`;
    }
  });
  html += '</table>';
  document.getElementById('marks_list').innerHTML = html;
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
  if(tab === 'marks') refreshMarks();
}

function refreshAll() {
  refreshStudents();
  refreshCourses();
  refreshFaculty();
  refreshEnroll();
  refreshMarks();
}

function updateDropdowns() {
  const studentSelects = ['e_student', 'm_student'];
  const courseSelects = ['e_course', 'm_course'];
  
  studentSelects.forEach(id => {
    const sel = document.getElementById(id);
    if(sel) {
      sel.innerHTML = '<option value="">Select Student</option>';
      db.students.forEach(s => sel.innerHTML += `<option value="${s.id}">${s.id} - ${s.name}</option>`);
    }
  });
  
  courseSelects.forEach(id => {
    const sel = document.getElementById(id);
    if(sel) {
      sel.innerHTML = '<option value="">Select Course</option>';
      db.courses.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.id} - ${c.name}</option>`);
    }
  });
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
