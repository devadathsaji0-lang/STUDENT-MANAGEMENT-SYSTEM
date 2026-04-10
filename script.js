let db = {
  students: JSON.parse(localStorage.getItem('students') || '[]'),
  courses: JSON.parse(localStorage.getItem('courses') || '[]'),
  faculty: JSON.parse(localStorage.getItem('faculty') || '[]'),
  enrollments: JSON.parse(localStorage.getItem('enrollments') || '[]'),
  marks: JSON.parse(localStorage.getItem('marks') || '[]')
};

function saveDB() {
  localStorage.setItem('students', JSON.stringify(db.students));
  localStorage.setItem('courses', JSON.stringify(db.courses));
  localStorage.setItem('faculty', JSON.stringify(db.faculty));
  localStorage.setItem('enrollments', JSON.stringify(db.enrollments));
  localStorage.setItem('marks', JSON.stringify(db.marks));
}

function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  refreshAll();
}

function addStudent() {
  let s = {id: s_id.value, name: s_name.value, phone: s_phone.value};
  if(!s.id) return alert('Enter Student ID');
  db.students = db.students.filter(x => x.id !== s.id);
  db.students.push(s);
  saveDB(); refreshAll();
  s_id.value = s_name.value = s_phone.value = '';
}

function addCourse() {
  let c = {id: c_id.value, name: c_name.value, credits: c_credits.value};
  if(!c.id) return alert('Enter Course ID');
  db.courses = db.courses.filter(x => x.id !== c.id);
  db.courses.push(c);
  saveDB(); refreshAll();
  c_id.value = c_name.value = c_credits.value = '';
}

function addFaculty() {
  let f = {id: f_id.value, name: f_name.value, dept: f_dept.value};
  if(!f.id) return alert('Enter Faculty ID');
  db.faculty = db.faculty.filter(x => x.id !== f.id);
  db.faculty.push(f);
  saveDB(); refreshAll();
  f_id.value = f_name.value = f_dept.value = '';
}

function enrollStudent() {
  let e = {sid: e_student.value, cid: e_course.value, date: new Date().toLocaleDateString()};
  if(!e.sid || !e.cid) return alert('Select both');
  db.enrollments.push(e);
  saveDB(); refreshAll();
}

function addMarks() {
  let marksValue = parseInt(m_marks.value);
  let grade = marksValue > 90 ? 'A' : marksValue > 75 ? 'B' : 'C';

  let m = {sid: m_student.value, cid: m_course.value, marks: marksValue, grade: grade};

  if(!m.sid || !m.cid) return alert('Select both');
  db.marks.push(m);
  saveDB(); refreshAll();
  m_marks.value = '';
}

function refreshAll() {
  e_student.innerHTML = m_student.innerHTML = db.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  e_course.innerHTML = m_course.innerHTML = db.courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  student_list.innerHTML = tableHTML(db.students, ['id','name','phone']);
  course_list.innerHTML = tableHTML(db.courses, ['id','name','credits']);
  faculty_list.innerHTML = tableHTML(db.faculty, ['id','name','dept']);
  enroll_list.innerHTML = tableHTML(db.enrollments, ['sid','cid','date']);
  marks_list.innerHTML = tableHTML(db.marks, ['sid','cid','marks','grade']);
}

function tableHTML(arr, keys) {
  if(!arr.length) return 'No data';
  let h = '<table><tr>' + keys.map(k => `<th>${k}</th>`).join('') + '</tr>';
  let r = arr.map(o => '<tr>' + keys.map(k => `<td>${o[k]}</td>`).join('') + '</tr>').join('');
  return h + r + '</table>';
}

refreshAll();