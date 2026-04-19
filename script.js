const API_URL = 'https://college-api-pohn.onrender.com/attendance';

// ========== GLOBAL DB FOR LOCALSTORAGE PARTS ==========
let db = JSON.parse(localStorage.getItem('sms_db')) || {
  students: [], courses: [], faculty: [], enroll: [], marks: {}, attendance: {}
};

function saveDB() {
  localStorage.setItem('sms_db', JSON.stringify(db));
}

let currentRole = 'teacher';
let currentUser = '';

// ========== LOGIN ==========
document.getElementById('loginBtn').onclick = () => {
  const role = document.getElementById('userRole').value;
  const user = document.getElementById('username').value;
  if (!user) {
    document.getElementById('loginError').innerText = 'Enter Username';
    return;
  }
  currentRole = role;
  currentUser = user;
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  // Hide attendance tab for students if needed
  if(currentRole === 'student') {
    document.getElementById('attendanceTabBtn').style.display = 'none';
  }
  refreshAll();
};

document.getElementById('logoutBtn').onclick = () => {
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'block';
  currentUser = '';
};

// ========== TABS ==========
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab === 'attendance') loadAttendanceFromAPI();
    if(btn.dataset.tab === 'marks') refreshMarks();
  };
});

// ========== STUDENTS - LOCALSTORAGE ONLY ==========
document.getElementById('saveStudentBtn').onclick = () => {
  const id = document.getElementById('s_id').value;
  const name = document.getElementById('s_name').value;
  if (!id ||!name) return alert('ID and Name required');

  const existing = db.students.findIndex(s => s.id === id);
  const student = {
    id, name,
    phone: document.getElementById('s_phone').value,
    course: document.getElementById('s_course').value,
    photo: document.getElementById('s_photo_preview').src
  };

  if (existing >= 0) db.students[existing] = student;
  else db.students.push(student);

  saveDB();
  refreshStudents();
  alert('Student Saved - LocalStorage Only');
};

function refreshStudents() {
  let html = '<table><tr><th>ID</th><th>Name</th><th>Course</th></tr>';
  db.students.forEach(s => {
    html += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.course}</td></tr>`;
  });
  document.getElementById('student_list').innerHTML = html + '</table>';
  updateDropdowns();
}

// Photo preview
document.getElementById('s_photo').onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => document.getElementById('s_photo_preview').src = ev.target.result;
    reader.readAsDataURL(file);
  }
};

// ========== COURSES - LOCALSTORAGE ONLY ==========
document.getElementById('saveCourseBtn').onclick = () => {
  const id = document.getElementById('c_id').value;
  const name = document.getElementById('c_name').value;
  if (!id ||!name) return alert('ID and Name required');

  const existing = db.courses.findIndex(c => c.id === id);
  const course = { id, name, credits: document.getElementById('c_credits').value };

  if (existing >= 0) db.courses[existing] = course;
  else db.courses.push(course);

  saveDB();
  refreshCourses();
};

function refreshCourses() {
  let html = '<table><tr><th>ID</th><th>Name</th><th>Credits</th></tr>';
  db.courses.forEach(c => {
    html += `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.credits}</td></tr>`;
  });
  document.getElementById('course_list').innerHTML = html + '</table>';
  updateDropdowns();
}

// ========== FACULTY - LOCALSTORAGE ONLY ==========
document.getElementById('saveFacultyBtn').onclick = () => {
  const id = document.getElementById('f_id').value;
  const name = document.getElementById('f_name').value;
  if (!id ||!name) return alert('ID and Name required');

  const existing = db.faculty.findIndex(f => f.id === id);
  const faculty = { id, name, dept: document.getElementById('f_dept').value };

  if (existing >= 0) db.faculty[existing] = faculty;
  else db.faculty.push(faculty);

  saveDB();
  refreshFaculty();
};

function refreshFaculty() {
  let html = '<table><tr><th>ID</th><th>Name</th><th>Dept</th></tr>';
  db.faculty.forEach(f => {
    html += `<tr><td>${f.id}</td><td>${f.name}</td><td>${f.dept}</td></tr>`;
  });
  document.getElementById('faculty_list').innerHTML = html + '</table>';
}

// ========== ENROLL - LOCALSTORAGE ONLY ==========
document.getElementById('enrollBtn').onclick = () => {
  const sid = document.getElementById('e_student').value;
  const cid = document.getElementById('e_course').value;
  if (!sid ||!cid) return alert('Select both');

  db.enroll.push({ sid, cid });
  saveDB();
  refreshEnroll();
};

function refreshEnroll() {
  let html = '<table><tr><th>Student</th><th>Course</th></tr>';
  db.enroll.forEach(e => {
    const s = db.students.find(st => st.id === e.sid);
    const c = db.courses.find(co => co.id === e.cid);
    html += `<tr><td>${s?.name || e.sid}</td><td>${c?.name || e.cid}</td></tr>`;
  });
  document.getElementById('enroll_list').innerHTML = html + '</table>';
}

// ========== MARKS - LOCALSTORAGE ONLY ==========
function getGradePoint(marks) {
  marks = Number(marks);
  if (marks >= 90) return { grade: 'S', point: 10 };
  if (marks >= 80) return { grade: 'A', point: 9 };
  if (marks >= 70) return { grade: 'B', point: 8 };
  if (marks >= 60) return { grade: 'C', point: 7 };
  if (marks >= 50) return { grade: 'D', point: 6 };
  if (marks >= 40) return { grade: 'E', point: 5 };
  return { grade: 'F', point: 0 };
}

function loadStudentGradeCard() {
  const sid = document.getElementById('m_student').value;
  if (!sid) return;
  if (!db.marks[sid]) db.marks[sid] = { sem: {}, cgpa: 0 };

  let html = '';
  for (let sem = 1; sem <= 8; sem++) {
    if (!db.marks[sid].sem[sem]) db.marks[sid].sem[sem] = [];
    html += `<h3>Semester ${sem}
      <button onclick="addSub('${sid}',${sem})">Add Subject</button>
      SGPA: <span id="sgpa${sem}">0.00</span>
      Result: <span id="semResult${sem}"></span>
    </h3>`;
    html += `<table id="semTable${sem}"><tr><th>Subject</th><th>Marks</th><th>Credit</th><th>Grade</th><th>Status</th>${currentRole==='teacher'?'<th>Action</th>':''}</tr></table>`;
  }
  html += `<h3>Overall CGPA: <span id="cgpaDisplay">0.00</span> Status: <span id="overallStatus"></span></h3>`;
  document.getElementById('gradeCardContainer').innerHTML = html;

  for (let sem = 1; sem <= 8; sem++) loadSemData(sid, sem);
}

window.addSub = (sid, sem) => {
  db.marks[sid].sem[sem].push({ subject: '', marks: 0, credit: 3, grade: 'F', point: 0 });
  saveDB();
  loadSemData(sid, sem);
};

function loadSemData(sid, sem) {
  const table = document.getElementById('semTable' + sem);
  table.innerHTML = `<tr><th>Subject</th><th>Marks</th><th>Credit</th><th>Grade</th><th>Status</th>${currentRole==='teacher'?'<th>Action</th>':''}</tr>`;
  const semData = db.marks[sid]?.sem[sem] || [];
  semData.forEach((sub, idx) => {
    const { grade, point } = getGradePoint(sub.marks);
    sub.grade = grade; sub.point = point;
    const row = table.insertRow(-1);
    let rowHtml = `<td>${currentRole==='teacher'?`<input value="${sub.subject}" oninput="updateSub('${sid}',${sem},${idx},'subject',this.value)">`:sub.subject||'-'}</td>
      <td>${currentRole==='teacher'?`<input type="number" value="${sub.marks}" oninput="updateSub('${sid}',${sem},${idx},'marks',this.value)">`:sub.marks}</td>
      <td>${currentRole==='teacher'?`<input type="number" value="${sub.credit}" oninput="updateSub('${sid}',${sem},${idx},'credit',this.value)">`:sub.credit}</td>
      <td>${grade}</td><td class="${point>0?'pass':'fail'}">${sub.subject? (point>0?'Pass':'Fail') : '-'}</td>`;
    if(currentRole==='teacher') rowHtml+=`<td><button onclick="delSub('${sid}',${sem},${idx})">X</button></td>`;
    row.innerHTML = rowHtml;
  });
  calcSemSGPA(sid, sem);
  calcCGPA(sid);
}

window.updateSub = (sid, sem, idx, field, val) => {
  db.marks[sid].sem[sem][idx][field] = field=='subject'?val:Number(val);
  saveDB(); loadSemData(sid, sem);
};

window.delSub = (sid, sem, idx) => {
  db.marks[sid].sem[sem].splice(idx, 1);
  saveDB(); loadSemData(sid, sem);
};

function calcSemSGPA(sid, sem) {
  const semData = db.marks[sid]?.sem[sem] || [];
  let totalCredit = 0, totalPoint = 0, fail = 0, hasMarks = false;
  semData.forEach(sub => {
    if (sub.subject && sub.marks >= 0) {
      hasMarks = true;
      totalCredit += Number(sub.credit) || 0;
      totalPoint += sub.point * (Number(sub.credit) || 0);
      if (sub.point == 0) fail++;
    }
  });
  const sgpa = totalCredit? (totalPoint / totalCredit).toFixed(2) : '0.00';
  document.getElementById('sgpa' + sem).textContent = sgpa;
  const resEl = document.getElementById('semResult' + sem);
  if (!hasMarks) { resEl.textContent = '-'; resEl.className = ''; }
  else if (fail == 0) { resEl.textContent = 'PASS'; resEl.className = 'pass'; }
  else { resEl.textContent = 'FAIL'; resEl.className = 'fail'; }
  return { sgpa: parseFloat(sgpa), fail, hasMarks };
}

function calcCGPA(sid) {
  let totalSGPA = 0, count = 0, overallFail = false;
  for (let sem = 1; sem <= 8; sem++) {
    const { sgpa, fail, hasMarks } = calcSemSGPA(sid, sem);
    if (hasMarks && sgpa > 0) { totalSGPA += sgpa; count++; }
    if (fail > 0) overallFail = true;
  }
  const cgpa = count? (totalSGPA / count).toFixed(2) : '0.00';
  db.marks[sid].cgpa = parseFloat(cgpa);
  saveDB();
  document.getElementById('cgpaDisplay').textContent = cgpa;
  const statusEl = document.getElementById('overallStatus');
  if (count == 0) { statusEl.textContent = '-'; statusEl.className = ''; }
  else if (overallFail) { statusEl.textContent = 'FAIL'; statusEl.className = 'fail'; }
  else { statusEl.textContent = 'PASS'; statusEl.className = 'pass'; }
  refreshStudents();
}

function refreshMarks() {
  updateDropdowns();
  if (currentRole === 'student') document.getElementById('m_student').value = currentUser;
  if (document.getElementById('m_student').value) loadStudentGradeCard();
}

// ========== ATTENDANCE - CONNECTED TO MONGODB API ==========
async function loadAttendanceFromAPI() {
  document.getElementById('attendanceList').innerHTML = 'Loading from MongoDB...';
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Show all records from MongoDB
    let html = '<h4>All Attendance Records from Database</h4>';
    html += '<table border="1"><tr><th>Name</th><th>Status</th><th>Date</th></tr>';
    data.forEach(i => {
      html += `<tr><td>${i.name}</td><td>${i.status}</td><td>${i.date}</td></tr>`;
    });
    html += '</table>';

    // Add new entry form
    html += `<h4>Mark New Attendance</h4>
      <input type="date" id="attendanceDate">
      <input type="text" id="att_name" placeholder="Student Name">
      <select id="att_status"><option>Present</option><option>Absent</option></select>
    `;

    document.getElementById('attendanceList').innerHTML = html;

  } catch (err) {
    document.getElementById('attendanceList').innerHTML = 'Error: ' + err + '<br>Render might be sleeping. Wait 50sec and refresh.';
  }
}

document.getElementById('saveAttendanceBtn').onclick = async () => {
  const name = document.getElementById('att_name')?.value;
  const status = document.getElementById('att_status')?.value;
  const date = document.getElementById('attendanceDate')?.value || new Date().toLocaleDateString();

  if (!name) return alert('Enter Student Name');

  document.getElementById('saveAttendanceBtn').innerText = 'Saving...';

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status, date })
    });
    alert('Saved to MongoDB!');
    loadAttendanceFromAPI(); // Refresh
  } catch (err) {
    alert('Error saving: ' + err);
  }
  document.getElementById('saveAttendanceBtn').innerText = 'Save Attendance';
};

// Monthly Report - Still LocalStorage based for now
document.getElementById('reportMonth').onchange = () => {
  document.getElementById('monthlyReport').innerHTML = 'Monthly Report needs separate Backend API. Only main attendance list works with MongoDB now.';
};

// ========== UTILS ==========
function updateDropdowns() {
  const studentSelects = ['e_student', 'm_student'];
  studentSelects.forEach(id => {
    const sel = document.getElementById(id);
    if (sel) {
      const current = sel.value;
      sel.innerHTML = '<option value="">Select Student</option>';
      db.students.forEach(s => {
        if (currentRole === 'teacher' || s.id === currentUser) {
          sel.innerHTML += `<option value="${s.id}">${s.id} - ${s.name}</option>`;
        }
      });
      if (current) sel.value = current;
    }
  });
  const courseSelects = ['e_course'];
  courseSelects.forEach(id => {
    const sel = document.getElementById(id);
    if (sel) {
      sel.innerHTML = '<option value="">Select Course</option>';
      db.courses.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.id} - ${c.name}</option>`);
    }
  });
}

function refreshAll() {
  refreshStudents();
  refreshCourses();
  refreshFaculty();
  refreshEnroll();
  refreshMarks();
}

// Init
refreshAll();
