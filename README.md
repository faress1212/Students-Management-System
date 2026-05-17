# EduTrack — Student Management System

A lightweight, browser-based student management system built with vanilla HTML, CSS, and JavaScript. EduTrack helps educators manage student records, track academic performance, and monitor attendance — all without a backend or database.

---

## Features

- **Dashboard** — At-a-glance overview of total students, recorded grades, average GPA, and today's attendance count, along with a breakdown of students by major.
- **Student Management** — Add, edit, and delete student profiles. Each profile stores the student's name, email, phone number, academic year, and major. Supports search and filtering by major or year.
- **Grade Tracking** — Record subject grades for any student with automatic letter grade and GPA point calculation. Filter grades by student and view a full GPA summary table.
- **Attendance** — Mark students as Present, Late, or Absent for any date. Bulk actions allow marking all students present or absent at once. Attendance history is displayed with daily statistics.
- **Reports & Analytics** — Visual bar charts showing GPA distribution, enrollment by year, top-performing students, and subject averages.

---

## Tech Stack

- **HTML5** — Semantic structure and modal forms
- **CSS3** — Custom variables, responsive grid layout, light/dark-ready theming
- **Vanilla JavaScript (ES6+)** — Classes, localStorage persistence, dynamic rendering

---

## Getting Started

No installation or build step required.

1. Clone or download the repository.
2. Open `index.html` in any modern browser.

```bash
git clone https://github.com/your-username/edutrack.git
cd edutrack
# open index.html directly, or use a local server:
npx serve .
```

> All data is stored in the browser's `localStorage`. No data leaves the device.

---

## Project Structure

```
edutrack/
├── index.html      # App shell and modal templates
├── style.css       # Global styles and component classes
├── script.js       # Application logic, rendering, and data layer
└── README.md
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is open source and available under the [MIT License](LICENSE).
