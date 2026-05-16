'use strict';

var S = {
    students: [],
    grades: [],
    attendance: [],
    page: 'dashboard',
    editId: null,
    attDate: new Date().toISOString().split('T')[0],
    search: '',
    fMajor: '',
    fYear: '',
    fGrade: '',
};

var nSID = 1;
var nGID = 1;
var nAID = 1;

function updateBadge() {
    var el = document.getElementById('liveBadge');
    if (el) {
        el.textContent = '👨‍🎓 ' + S.students.length + ' Student' + (S.students.length !== 1 ? 's' : '');
    }
}

function render() {
    document.querySelectorAll('.nav-item').forEach(function (b) {
        b.classList.toggle('active', b.dataset.page === S.page);
    });

    var titles = {
        dashboard: 'Dashboard',
        students: 'Students',
        grades: 'Grades',
        attendance: 'Attendance',
        reports: 'Reports'
    };
    document.getElementById('pageTitle').textContent = titles[S.page] || '';

    var map = {
        dashboard: rDash,
        students: rStudents,
        grades: rGrades,
        attendance: rAtt,
        reports: rReports
    };

    var fn = map[S.page];
    var el = document.getElementById('content');

    if (fn) {
        el.innerHTML = '<div class="page">' + fn() + '</div>';
    }

    bindPage();
}

function rDash() {

    var total = S.students.length;

    var gpas = S.students.map(function (s) {
        return gpaOf(s.id);
    }).filter(Boolean).map(Number);

    var avgGpa = gpas.length
        ? (gpas.reduce(function (a, b) { return a + b; }, 0) / gpas.length).toFixed(2)
        : '—';

    var today = S.attDate;
    var todayP = S.attendance.filter(function (a) {
        return a.date === today && (a.status === 'present' || a.status === 'late');
    }).length;

    var recent = S.students.slice(-5).reverse();

    var majorsMap = {};
    S.students.forEach(function (s) {
        majorsMap[s.major] = (majorsMap[s.major] || 0) + 1;
    });
    var majorEntries = Object.entries(majorsMap).sort(function (a, b) { return b[1] - a[1]; });

    var colors = ['#c9a84c', '#2563eb', '#059669', '#7c3aed', '#e74c3c', '#f39c12'];

    var recentRows = recent.map(function (s) {
        var g = gpaOf(s.id);
        return '<tr>' +
            '<td><div class="name-cell"><div class="av">' + s.initials + '</div><div>' +
            '<div style="font-weight:600">' + s.fullName + '</div>' +
            '<div style="font-size:.73rem;color:var(--text-muted)">Year ' + s.year + '</div>' +
            '</div></div></td>' +
            '<td><span class="badge b-navy">' + s.major + '</span></td>' +
            '<td class="' + gpaClass(g) + '">' + (g || '—') + '</td></tr>';
    }).join('');

    var majorBars = majorEntries.map(function (entry, i) {
        var m = entry[0];
        var c = entry[1];
        return '<div style="margin-bottom:14px">' +
            '<div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:5px">' +
            '<span style="font-weight:500">' + m + '</span>' +
            '<span style="color:var(--text-muted)">' + c + '</span>' +
            '</div>' +
            '<div class="bar-wrap">' +
            '<div class="bar" style="width:' + Math.round(c / total * 100) + '%;background:' + colors[i % colors.length] + '"></div>' +
            '</div>' +
            '</div>';
    }).join('');

    return '<div class="sec-head"><h2>Welcome back 👋</h2><p>Here\'s your academic snapshot for today</p></div>' +

        '<div class="stats-grid">' +
        '<div class="stat-card" style="--ac:#c9a84c"><div class="stat-icon">👨‍🎓</div><div class="stat-value">' + total + '</div><div class="stat-label">Total Students</div></div>' +
        '<div class="stat-card" style="--ac:#2563eb"><div class="stat-icon">📝</div><div class="stat-value">' + S.grades.length + '</div><div class="stat-label">Grades Recorded</div></div>' +
        '<div class="stat-card" style="--ac:#059669"><div class="stat-icon">⭐</div><div class="stat-value">' + avgGpa + '</div><div class="stat-label">Average GPA</div></div>' +
        '<div class="stat-card" style="--ac:#7c3aed"><div class="stat-icon">✅</div><div class="stat-value">' + todayP + '</div><div class="stat-label">Present Today</div></div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">' +

        '<div class="card">' +
        '<div class="card-header">' +
        '<span class="card-title">Recent Students</span>' +
        '<button class="btn btn-outline btn-sm" data-page="students">View All →</button>' +
        '</div>' +
        (recent.length
            ? '<table><thead><tr><th>Student</th><th>Major</th><th>GPA</th></tr></thead><tbody>' + recentRows + '</tbody></table>'
            : '<div class="empty"><div class="empty-icon">👋</div><p>No students yet!</p></div>') +
        '</div>' +

        '<div class="card">' +
        '<div class="card-header"><span class="card-title">Students by Major</span></div>' +
        '<div style="padding:20px">' +
        (majorEntries.length ? majorBars : '<div class="empty" style="padding:20px"><p>No data yet</p></div>') +
        '</div></div>' +
        '</div>';
}

function go(page) {
    S.page = page;
    S.search = '';
    S.fMajor = '';
    S.fYear = '';
    S.fGrade = '';
    render();
    document.getElementById('sidebar').classList.remove('open');
}

function initListeners() {
    document.querySelectorAll('.nav-item').forEach(function (b) {
        b.addEventListener('click', function () { go(b.dataset.page); });
    });
    document.getElementById('hamburger').addEventListener('click', function () {
        document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('topAddBtn').addEventListener('click', function () {
        go('students');
        setTimeout(openStudentModal, 80);
    });
    document.getElementById('saveStudentBtn').addEventListener('click', saveStudent);
    document.querySelectorAll('[data-close]').forEach(function (b) {
        b.addEventListener('click', function () { closeOverlay(b.dataset.close); });
    });
    document.getElementById('studentOverlay').addEventListener('click', function (e) {
        if (e.target.id === 'studentOverlay') closeOverlay('studentOverlay');
    });
    document.getElementById('gradeOverlay').addEventListener('click', function (e) {
        if (e.target.id === 'gradeOverlay') closeOverlay('gradeOverlay');
    });
    document.getElementById('saveGradeBtn').addEventListener('click', saveGrade);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeOverlay('studentOverlay');
            closeOverlay('gradeOverlay');
        }
    });
}

function boot() {
    try {
        loadAll();
        seed();
        initListeners();
        updateBadge();
        render();
    }
    catch (e) {
        console.error('Boot error:', e);
        document.getElementById('content').innerHTML =
            '<div style="text-align:center;padding:60px;color:var(--danger)">' +
            '<div style="font-size:3rem">⚠️</div>' +
            '<h2>App failed to start</h2>' +
            '<p>' + e.message + '</p>' +
            '</div>';
    }
}

//Mahmoud

//////////////////////////////////////////////////////////////////////////////////
class Student {
    constructor(id, firstName, lastName, email, phone, major, year) {
        this.id = id; this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone || '';
        this.major = major;
        this.year = parseInt(year);
        this.enrolled = new Date().toISOString().split('T')[0];
    }
    get fullName() { return this.firstName + ' ' + this.lastName; }
    get initials() { return (this.firstName[0] + this.lastName[0]).toUpperCase(); }
}

function saveAll() {
    try {
        localStorage.setItem('et_students', JSON.stringify(S.students));
        localStorage.setItem('et_grades', JSON.stringify(S.grades));
        localStorage.setItem('et_attendance', JSON.stringify(S.attendance));
        localStorage.setItem('et_nSID', nSID);
        localStorage.setItem('et_nGID', nGID);
        localStorage.setItem('et_nAID', nAID);
    } catch (e) { toast('Failed to save: ' + e.message, 'error'); }
}

function loadAll() {
    try {
        var s = localStorage.getItem('et_students');
        var g = localStorage.getItem('et_grades');
        var a = localStorage.getItem('et_attendance');

        if (s) S.students = JSON.parse(s).map(function (x) { return Object.assign(new Student(x.id, x.firstName, x.lastName, x.email, x.phone, x.major, x.year), x); });
        if (g) S.grades = JSON.parse(g).map(function (x) { return Object.assign(new Grade(x.id, x.studentId, x.subject, x.score, x.semester), x); });
        if (a) S.attendance = JSON.parse(a).map(function (x) { return Object.assign(new AttRecord(x.id, x.studentId, x.date, x.status), x); });

        nSID = parseInt(localStorage.getItem('et_nSID') || '1');
        nGID = parseInt(localStorage.getItem('et_nGID') || '1');
        nAID = parseInt(localStorage.getItem('et_nAID') || '1');
    } catch (e) { console.error('Load error:', e); }
}

function seed() {
    if (S.students.length) return;
    [['Ahmed', 'Hassan', 'ahmed.h@su.edu.eg', '01012345678', 'Computer Science', 3],
    ['Sara', 'Mohamed', 'sara.m@su.edu.eg', '01098765432', 'Information Technology', 2],
    ['Omar', 'Ali', 'omar.ali@su.edu.eg', '01156789012', 'Software Engineering', 4],
    ['Nour', 'Ibrahim', 'nour.i@su.edu.eg', '01234567890', 'Data Science', 1],
    ['Youssef', 'Khalil', 'youssef.k@su.edu.eg', '01345678901', 'Computer Science', 2],
    ].forEach(function (d) { S.students.push(new Student(nSID++, d[0], d[1], d[2], d[3], d[4], d[5])); });

    [[1, 'Web Programming', 92], [1, 'Data Structures', 88], [2, 'Web Programming', 75], [2, 'Database Systems', 82],
    [3, 'Software Design', 95], [3, 'Web Programming', 91], [4, 'Statistics', 70], [5, 'Web Programming', 88],
    ].forEach(function (d) { S.grades.push(new Grade(nGID++, d[0], d[1], d[2], 'Spring 2026')); });

    ['present', 'present', 'present', 'late', 'absent'].forEach(function (st, i) {
        S.attendance.push(new AttRecord(nAID++, S.students[i].id, S.attDate, st));
    });
    saveAll();
}

function filteredStudents() {
    return S.students.filter(function (s) {
        var q = S.search.toLowerCase();
        return (!q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
            && (!S.fMajor || s.major === S.fMajor)
            && (!S.fYear || s.year === +S.fYear);
    });
}

function openOverlay(id) { document.getElementById(id).classList.add('open'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('open'); }

function openStudentModal(student) {
    var form = document.getElementById('studentForm');
    form.reset();
    S.editId = student ? student.id : null;
    document.getElementById('modalTitle').textContent = student ? 'Edit Student' : 'Add New Student';
    if (student) {
        ['firstName', 'lastName', 'email', 'phone', 'year', 'major'].forEach(function (k) {
            form.elements[k].value = student[k] || '';
        });
    }
    openOverlay('studentOverlay');
}

document.getElementById('studentForm').addEventListener('submit', function (e) {
    e.preventDefault();
    try {
        var form = e.target;
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var d = Object.fromEntries(new FormData(form));

        if (S.students.find(function (s) { return s.email === d.email && s.id !== S.editId; })) {
            toast('Email already registered', 'error'); return;
        }

        if (S.editId) {
            var idx = S.students.findIndex(function (s) { return s.id === S.editId; });
            if (idx !== -1) Object.assign(S.students[idx], d, { year: +d.year });
            toast(d.firstName + ' ' + d.lastName + ' updated ✏️', 'success');
        } else {
            S.students.push(new Student(nSID++, d.firstName, d.lastName, d.email, d.phone, d.major, d.year));
            toast(d.firstName + ' ' + d.lastName + ' added successfully 🎉', 'success');
        }

        saveAll(); closeOverlay('studentOverlay'); updateBadge(); render();
    } catch (err) { toast('Error: ' + err.message, 'error'); }
});

function deleteStudent(id) {
    var s = S.students.find(function (x) { return x.id === id; });
    if (!s) return;
    confirmDel('This will delete <strong>' + s.fullName + '</strong> and all their records.', function () {
        try {
            S.students = S.students.filter(function (x) { return x.id !== id; });
            S.grades = S.grades.filter(function (g) { return g.studentId !== id; });
            S.attendance = S.attendance.filter(function (a) { return a.studentId !== id; });
            saveAll(); updateBadge(); render();
            toast(s.fullName + ' deleted', 'info');
        } catch (err) { toast('Delete failed: ' + err.message, 'error'); }
    });
}

function rStudents() {
    var list = filteredStudents();
    var majors = [...new Set(S.students.map(function (s) { return s.major; }))];
    var majorOpts = majors.map(function (m) { return '<option value="' + m + '"' + (S.fMajor === m ? ' selected' : '') + '>' + m + '</option>'; }).join('');
    var yearOpts = [1, 2, 3, 4].map(function (y) { return '<option value="' + y + '"' + (S.fYear == y ? ' selected' : '') + '>Year ' + y + '</option>'; }).join('');

    var rows = list.map(function (s) {
        var g = gpaOf(s.id), a = attRateOf(s.id);
        var attBadge = a !== null ? '<span class="badge ' + (a >= 75 ? 'b-success' : a >= 50 ? 'b-warning' : 'b-danger') + '">' + a + '%</span>' : '<span style="color:var(--text-muted)">—</span>';
        return '<tr><td><div class="name-cell"><div class="av">' + s.initials + '</div><div>' +
            '<div style="font-weight:600">' + s.fullName + '</div>' +
            '<div style="font-size:.73rem;color:var(--text-muted)">' + (s.phone || '—') + '</div>' +
            '</div></div></td><td style="color:var(--text-muted)">' + s.email + '</td>' +
            '<td><span class="badge b-navy">' + s.major + '</span></td>' +
            '<td><span class="badge b-info">Yr ' + s.year + '</span></td>' +
            '<td class="' + gpaClass(g) + '">' + (g || '—') + '</td><td>' + attBadge + '</td>' +
            '<td><div style="display:flex;gap:5px">' +
            '<button class="btn btn-outline btn-sm editS" data-id="' + s.id + '">✏️</button>' +
            '<button class="btn btn-danger btn-sm delS" data-id="' + s.id + '">🗑️</button>' +
            '</div></td></tr>';
    }).join('');

    var emptyMsg = (S.search || S.fMajor || S.fYear)
        ? '<div class="empty"><div class="empty-icon">🔍</div><p>No students match your filters</p></div>'
        : '<div class="empty"><div class="empty-icon">👨‍🎓</div><p>No students yet — add your first one!</p></div>';

    return '<div class="sec-head"><h2>Students</h2><p>Manage all enrolled students</p></div>' +
        '<div class="card"><div class="card-header">' +
        '<span class="card-title">All Students <span style="color:var(--text-muted);font-size:.83rem">(' + list.length + ')</span></span>' +
        '<div class="card-actions">' +
        '<div class="search-wrap"><input type="text" id="sSearch" placeholder="Search…" value="' + S.search + '"></div>' +
        '<select class="filter-sel" id="sMajor"><option value="">All Majors</option>' + majorOpts + '</select>' +
        '<select class="filter-sel" id="sYear"><option value="">All Years</option>' + yearOpts + '</select>' +
        '<button class="btn btn-gold" id="addStBtn">+ Add Student</button>' +
        '</div></div>' +
        (list.length ? '<table><thead><tr><th>Student</th><th>Email</th><th>Major</th><th>Year</th><th>GPA</th><th>Attendance</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table>' : emptyMsg) +
        '</div>';
}

///////////////////////////////////////////////////////////////////////////////
//Islam

//////////////////////////////////////////////////////////////////////////////////
//Sayed
>>>>>>> b8ea623ebe5d41ea2653991855989440f5c2afe3
