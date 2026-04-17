let db = JSON.parse(localStorage.getItem('sms_data')) || {
  students: [], courses: [], faculty: [], enrollments: [],
  attendance: {}, marks: {}, photos: {}
};
let currentUser = '', currentRole = '', tempPhoto = '';

const saveDB = () => localStorage.setItem('sms_data', JSON.stringify(db));

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('saveStudentBtn').addEventListener('click', addStudent);
  document.getElementById('saveCourseBtn').addEventListener('click', addCourse);
  document.getElementById('saveFacultyBtn').addEventListener('click', addFaculty);
  document.getElementById('enrollBtn').addEventListener('click', enrollStudent);
  document.getElementById('saveAttendanceBtn').addEventListener('click', saveAttendance);
  document.getElementById('s_photo').addEventListener('change', previewPhoto);
  document.getElementById('m_student').addEventListener('change', loadStudentGradeCard);
  document.getElementById('attendanceDate').addEventListener('change', loadAttendance);
  document.getElementById('reportMonth').addEventListener('change', loadMonthlyReport);

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => showTab(e.target.dataset.tab));
  });

  autoLogin();
});

function autoLogin() {
  const saved = JSON.parse(localStorage.getItem('loggedIn') || 'null');
  if (saved) {
    currentUser = saved.user;
    currentRole = saved.role;
    showApp();
  }
  document.getElementById('reportMonth').value = new Date().getMonth() + 1;
  document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
  refreshAll();
}

// ========== LOGIN - FIXED FOR teacher@college.com ==========
function login() {
  const role = document.getElementById('userRole').value;
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  const err = document.getElementById('loginError');
  err.textContent = '';

  if (!user ||!pass) return err.textContent = 'Enter username and password';

  if (role === 'teacher') {
    const teacherEmails = ['teacher@college.com', 'teacher@school.com', 'admin'];
    if (teacherEmails.includes(user) && pass.length > 0) {
      currentUser = user; currentRole = 'teacher';
    } else {
      return err.textContent = 'Wrong teacher credentials. Use: teacher@college.com / any password';
    }
  } else {
    if (db.students.some(s => s.id === user) && pass.length > 0) {
      currentUser = user; currentRole = 'student';
    } else {
      return err.textContent = 'Student ID not found. Ask teacher to add you first.';
    }
  }
  localStorage.setItem('loggedIn', JSON.stringify({user, role: currentRole}));
  showApp();
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('attendanceTabBtn').style.display = currentRole === 'teacher'? 'block' : 'none';
  if(currentRole === 'student') {
    document.getElementById('m_student').value = currentUser;
    showTab('marks');
  }
  refreshAll();
}

function logout() {
  localStorage.removeItem('loggedIn');
  location.reload();
}

// ========== STUDENTS ==========
function previewPhoto(e) {
  const file = e.target.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = e => {
      tempPhoto = e.target.result;
      document.getElementById('s_photo_preview').src = tempPhoto;
    };
    reader.readAsDataURL(file);
  }
}

function addStudent() {
  const id = document.getElementById('s_id').value.trim();
  const name = document.getElementById('s_name').value.trim();
  const phone = document.getElementById('s_phone').value.trim();
  const course = document.getElementById('s_course').value.trim();
  if (!id ||!name) return alert('ID and Name required');

  const idx = db.students.findIndex(s => s.id === id);
  if (idx >= 0) db.students[idx] = {id, name, phone, course};
  else db.students.push({id, name, phone, course});

  if(tempPhoto) db.photos[id] = tempPhoto;
  if(!db.marks[id]) db.marks[id] = {sem:{1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]},cgpa:0};

  saveDB(); refreshStudents(); clearStudentForm();
}

function clearStudentForm() {
  ['s_id','s_name','s_phone','s_course'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('s_photo_preview').src='https://via.placeholder.com/120x150?text=Photo';
  document.getElementById('s_photo').value='';
  tempPhoto = '';
}

function refreshStudents() {
  let html = '<table><tr><th>Photo</th><th>ID</th><th>Name</th><th>Phone</th><th>Course</th><th>CGPA</th>';
  if(currentRole==='teacher') html += '<th>Action</th>';
  html += '</tr>';

  db.students.forEach(s => {
    if(currentRole==='student' && s.id!== currentUser) return;
    const photo = db.photos[s.id] || 'https://via.placeholder.com/40x50?text=No+Photo';
    const cgpa = db.marks[s.id]?.cgpa?.toFixed(2) || '0.00';
    html += `<tr>
      <td><img src="${photo}" style="width:40px;height:50px;object-fit:cover"></td>
      <td>${s.id}</td><td>${s.name}</td><td>${s.phone||'-'}</td><td>${s.course||'-'}</td><td>${cgpa}</td>`;
    if(currentRole==='teacher') html += `<td><button onclick="editStudent('${s.id}')">Edit</button> <button onclick="delStudent('${s.id}')">Del</button></td>`;
    html += '</tr>';
  });
  document.getElementById('student_list').innerHTML = html + '</table>';
  updateDropdowns();
}

function editStudent(id) {
  const s = db.students.find(s => s.id === id);
  if (s) {
    document.getElementById('s_id').value = s.id;
    document.getElementById('s_name').value = s.name;
    document.getElementById('s_phone').value = s.phone||'';
    document.getElementById('s_course').value = s.course||'';
    if(db.photos[id]) {
      document.getElementById('s_photo_preview').src = db.photos[id];
      tempPhoto = db.photos[id];
    }
  }
}

function delStudent(id) {
  if (confirm('Delete student? All data will be lost.')) {
    db.students = db.students.filter(s => s.id!== id);
    delete db.photos[id]; delete db.marks[id];
    saveDB(); refreshStudents();
  }
}

// ========== COURSES, FACULTY, ENROLL ==========
function addCourse() {
  const id = document.getElementById('c_id').value.trim();
  const name = document.getElementById('c_name').value.trim();
  const credits = document.getElementById('c_credits').value;
  if (!id ||!name) return alert('ID and Name required');
  const idx = db.courses.findIndex(c => c.id === id);
  if (idx >= 0) db.courses[idx] = {id, name, credits};
  else db.courses.push({id, name, credits});
  saveDB(); refreshCourses();
  document.getElementById('c_id').value=''; document.getElementById('c_name').value=''; document.getElementById('c_credits').value='';
}

function refreshCourses() {
  let html = '<table><tr><th>ID</th><th>Name</th><th>Credits</th>';
  if(currentRole==='teacher') html+='<th>Action</th>';
  html+='</tr>';
  db.courses.forEach(c => {
    html += `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.credits||'-'}</td>`;
    if(currentRole==='teacher') html+=`<td><button onclick="delCourse('${c.id}')">Del</button></td>`;
    html+='</tr>';
  });
  document.getElementById('course_list').innerHTML = html + '</table>';
  updateDropdowns();
}

function delCourse(id) {
  if (confirm('Delete course?')) {
    db.courses = db.courses.filter(c => c.id!== id);
    saveDB(); refreshCourses();
  }
}

function addFaculty() {
  const id = document.getElementById('f_id').value.trim();
  const name = document.getElementById('f_name').value.trim();
  const dept = document.getElementById('f_dept').value.trim();
  if (!id ||!name) return alert('ID and Name required');
  const idx = db.faculty.findIndex(f => f.id === id);
  if (idx >= 0) db.faculty[idx] = {id, name, dept};
  else db.faculty.push({id, name, dept});
  saveDB(); refreshFaculty();
  document.getElementById('f_id').value=''; document.getElementById('f_name').value=''; document.getElementById('f_dept').value='';
}

function refreshFaculty() {
  let html = '<table><tr><th>ID</th><th>Name</th><th>Dept</th>';
  if(currentRole==='teacher') html+='<th>Action</th>';
  html+='</tr>';
  db.faculty.forEach(f => {
    html += `<tr><td>${f.id}</td><td>${f.name}</td><td>${f.dept||'-'}</td>`;
    if(currentRole==='teacher') html+=`<td><button onclick="delFaculty('${f.id}')">Del</button></td>`;
    html+='</tr>';
  });
  document.getElementById('faculty_list').innerHTML = html + '</table>';
}

function delFaculty(id) {
  if (confirm('Delete faculty?')) {
    db.faculty = db.faculty.filter(f => f.id!== id);
    saveDB(); refreshFaculty();
  }
}

function enrollStudent() {
  const sid = document.getElementById('e_student').value;
  const cid = document.getElementById('e_course').value;
  if (!sid ||!cid) return alert('Select both');
  if (!db.enrollments.some(e => e.student === sid && e.course === cid)) {
    db.enrollments.push({student: sid, course: cid});
    saveDB(); refreshEnroll();
  }
}

function refreshEnroll() {
  let html = '<table><tr><th>Student</th><th>Course</th>';
  if(currentRole==='teacher') html+='<th>Action</th>';
  html+='</tr>';
  db.enrollments.forEach(e => {
    const s = db.students.find(s => s.id === e.student);
    const c = db.courses.find(c => c.id === e.course);
    if(s && c && (currentRole==='teacher' || s.id===currentUser)) {
      html += `<tr><td>${s.name}</td><td>${c.name}</td>`;
      if(currentRole==='teacher') html+=`<td><button onclick="delEnroll('${e.student}','${e.course}')">Del</button></td>`;
      html+='</tr>';
    }
  });
  document.getElementById('enroll_list').innerHTML = html + '</table>';
}

function delEnroll(sid, cid) {
  db.enrollments = db.enrollments.filter(e =>!(e.student === sid && e.course === cid));
  saveDB(); refreshEnroll();
}

// ========== GRADE CARD ==========
function getGradePoint(marks) {
  marks = Number(marks);
  if(marks>=90) return {grade:'O',point:10};
  if(marks>=80) return {grade:'A+',point:9};
  if(marks>=70) return {grade:'A',point:8};
  if(marks>=60) return {grade:'B+',point:7};
  if(marks>=50) return {grade:'B',point:6};
  if(marks>=40) return {grade:'C',point:5};
  return {grade:'F',point:0};
}

function loadStudentGradeCard() {
  const sid = document.getElementById('m_student').value;
  if(!sid) return document.getElementById('gradeCardContainer').innerHTML = '';

  const student = db.students.find(s=>s.id===sid);
  const photo = db.photos[sid] || 'https://via.placeholder.com/100x120?text=No+Photo';
  if(!db.marks[sid]) db.marks[sid] = {sem:{1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]},cgpa:0};
  for(let i=1;i<=8;i++) if(!db.marks[sid].sem[i]) db.marks[sid].sem[i]=[];

  let html = `<div class="grade-card-header">
    <img src="${photo}"><div>
    <h3>${student.name}</h3>
    <p>ID: ${student.id} | Course: ${student.course||'-'}</p>
    <div class="cgpa-box">CGPA: <span id="cgpaDisplay">0.00</span> | Status: <span id="overallStatus">-</span></div>
    </div><button onclick="window.print()" style="margin-left:auto;width:auto">Print</button>
  </div><div class="semester-tabs">`;

  for(let i=1;i<=8;i++) html += `<button class="sem-tab ${i==1?'active':''}" onclick="showSem(${i})">Sem ${i}</button>`;
  html += `</div>`;

  for(let sem=1;sem<=8;sem++){
    html += `<div id="sem${sem}" class="sem-content ${sem==1?'active':''}">
      <table id="semTable${sem}"><tr><th>Subject</th><th>Marks</th><th>Credit</th><th>Grade</th><th>Status</th>`;
    if(currentRole==='teacher') html+='<th>Action</th>';
    html+='</tr></table>';
    if(currentRole==='teacher') html+=`<button onclick="addSemSubject(${sem})">+ Add Subject</button>`;
    html+=`<div class="sem-result"><span>SGPA: <span id="sgpa${sem}">0.00</span></span><span>Result: <span id="semResult${sem}">-</span></span></div></div>`;
  }
  document.getElementById('gradeCardContainer').innerHTML = html;
  loadSemData(sid);
}

function showSem(n){
  document.querySelectorAll('.sem-content').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.sem-tab').forEach(el=>el.classList.remove('active'));
  document.getElementById('sem'+n).classList.add('active');
  document.querySelectorAll('.sem-tab')[n-1].classList.add('active');
}

function addSemSubject(sem){
  const sid = document.getElementById('m_student').value;
  db.marks[sid].sem[sem].push({subject:'',marks:0,credit:3,grade:'-',point:0});
  saveDB(); loadSemData(sid);
}

function loadSemData(sid){
  for(let sem=1;sem<=8;sem++){
    const table = document.getElementById('semTable'+sem);
    if(!table) continue;
    let thead = '<tr><th>Subject</th><th>Marks</th><th>Credit</th><th>Grade</th><th>Status</th>';
    if(currentRole==='teacher') thead+='<th>Action</th>';
    table.innerHTML = thead+'</tr>';

    const semData = db.marks[sid]?.sem[sem] || [];
    semData.forEach((sub,idx)=>{
      const {grade,point} = getGradePoint(sub.marks);
      sub.grade = grade; sub.point = point;
      const row = table.insertRow(-1);
      let html = `<td>${currentRole==='teacher'?`<input value="${sub.subject}" oninput="updateSub('${sid}',${sem},${idx},'subject',this.value)">`:sub.subject||'-'}</td>
        <td>${currentRole==='teacher'?`<input type="number" value="${sub.marks}" oninput="updateSub('${sid}',${sem},${idx},'marks',this.value)">`:sub.marks}</td>
        <td>${currentRole==='teacher'?`<input type="number" value="${sub.credit}" oninput="updateSub('${sid}',${sem},${idx},'credit',this.value)">`:sub.credit}</td>
        <td>${grade}</td><td class="${point>0?'pass':'fail'}">${sub.subject? (point>0?'Pass':'Fail') : '-'}</td>`;
      if(currentRole==='teacher') html+=`<td><button onclick="delSub('${sid}',${sem},${idx})">X</button></td>`;
      row.innerHTML = html;
    });
    calcSemSGPA(sid,sem);
  }
  calcCGPA(sid);
}

function updateSub(sid,sem,idx,field,val){
  db.marks[sid].sem[sem][idx][field] = field=='subject'?val:Number(val);
  saveDB(); loadSemData(sid);
}

function delSub(sid,sem,idx){
  db.marks[sid].sem[sem].splice(idx,1);
  saveDB(); loadSemData(sid);
}

function calcSemSGPA(sid,sem){
  const semData = db.marks[sid]?.sem[sem] || [];
  let totalCredit=0, totalPoint=0, fail=0, hasMarks=false;
  semData.forEach(sub=>{
    if(sub.subject && sub.marks>=0){
      hasMarks=true;
      totalCredit += Number(sub.credit)||0;
      totalPoint += sub.point * (Number(sub.credit)||0);
      if(sub.point==0) fail++;
    }
  });
  const sgpa = totalCredit? (totalPoint/totalCredit).toFixed(2) : '0.00';
  document.getElementById('sgpa'+sem).textContent = sgpa;
  const resEl = document.getElementById('semResult'+sem);
  if(!hasMarks){resEl.textContent='-';resEl.className='';}
  else if(fail==0){resEl.textContent='PASS';resEl.className='pass';}
  else{resEl.textContent='FAIL';resEl.className='fail';}
  return {sgpa:parseFloat(sgpa),fail,hasMarks};
}

function calcCGPA(sid){
  let totalSGPA=0,count=0,overallFail=false;
  for(let sem=1;sem<=8;sem++){
    const {sgpa,fail,hasMarks} = calcSemSGPA(sid,sem);
    if(hasMarks && sgpa>0){totalSGPA+=sgpa;count++;}
    if(fail>0) overallFail=true;
  }
  const cgpa = count?(totalSGPA/count).toFixed(2):'0.00';
  db.marks[sid].cgpa = parseFloat(cgpa);
  saveDB();
  document.getElementById('cgpaDisplay').textContent = cgpa;
  const statusEl = document.getElementById('overallStatus');
  if(count==0){statusEl.textContent='-';statusEl.className='';}
  else if(overallFail){statusEl.textContent='FAIL';statusEl.className='fail';}
  else{statusEl.textContent='PASS';statusEl.className='pass';}
  refreshStudents();
}

function refreshMarks(){
  updateDropdowns();
  if(currentRole==='student') document.getElementById('m_student').value = currentUser;
  if(document.getElementById('m_student').value) loadStudentGradeCard();
}

// ========== ATTENDANCE ==========
function loadAttendance() {
  const date = document.getElementById('attendanceDate').value;
  if (!date) return;
  if (!db.attendance[date]) db.attendance[date] = {};
  let html = '<table><tr><th>Student</th><th>Present</th></tr>';
  db.students.forEach(s => {
    const checked = db.attendance[date][s.id]? 'checked' : '';
    const disabled = currentRole==='student'?'disabled':'';
    html += `<tr><td>${s.name}</td><td><input type="checkbox" ${checked} ${disabled} onchange="markAttendance('${date}','${s.id}',this.checked)"></td></tr>`;
  });
  document.getElementById('attendanceList').innerHTML = html + '</table>';
}

function markAttendance(date, sid, present) {
  if(currentRole!=='teacher') return;
  db.attendance[date][sid] = present;
  saveDB();
}

function saveAttendance() {
  saveDB(); alert('Attendance saved');
}

function loadMonthlyReport() {
  const month = parseInt(document.getElementById('reportMonth').value);
  const year = new Date().getFullYear();
  let html = '<table><tr><th>Student</th><th>Present Days</th><th>Percentage</th></tr>';
  db.students.forEach(s => {
    if (currentRole === 'student' && currentUser!== s.id) return;
    let present = 0, totalDays = 0;
    Object.keys(db.attendance).forEach(date => {
      const d = new Date(date);
      if (d.getMonth() + 1 === month && d.getFullYear() === year) {
        totalDays++;
        if (db.attendance[date][s.id]) present++;
      }
    });
    const percent = totalDays? ((present / totalDays) * 100).toFixed(1) : 0;
    html += `<tr><td>${s.id} - ${s.name}</td><td>${present}/${totalDays}</td><td>${percent}%</td></tr>`;
  });
  document.getElementById('monthlyReport').innerHTML = html + '</table>';
}

// ========== UTILS ==========
function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
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
  studentSelects.forEach(id => {
    const sel = document.getElementById(id);
    if(sel) {
      const current = sel.value;
      sel.innerHTML = '<option value="">Select Student</option>';
      db.students.forEach(s => {
        if(currentRole==='teacher' || s.id===currentUser){
          sel.innerHTML += `<option value="${s.id}">${s.id} - ${s.name}</option>`;
        }
      });
      if(current) sel.value = current;
    }
  });
  const courseSelects = ['e_course'];
  courseSelects.forEach(id => {
    const sel = document.getElementById(id);
    if(sel) {
      sel.innerHTML = '<option value="">Select Course</option>';
      db.courses.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.id} - ${c.name}</option>`);
    }
  });
      }
