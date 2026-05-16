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