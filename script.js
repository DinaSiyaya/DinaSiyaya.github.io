document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    const loginContainer = document.getElementById('login-container');
    const homeContainer = document.getElementById('home-container');
    const weekPlanContainer = document.getElementById('week-plan-container');
    const completedTargetContainer = document.getElementById('completed-target-container');
    const workHoursContainer = document.getElementById('work-hours-container');

    const examCountdownElement = document.getElementById('exam-countdown');

    const currentLoggedInUser = localStorage.getItem('loggedInUser');

    // Function to calculate and display countdown
    function updateCountdown() {
        const examDate = new Date('2025-11-10T00:00:00'); // 2025 November 10
        const now = new Date();
        const difference = examDate - now;

        if (difference < 0) {
            examCountdownElement.textContent = "විභාගය අවසන්!";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        examCountdownElement.textContent = ${days};

    // Initial countdown update
    updateCountdown();
    // Update countdown every second
    setInterval(updateCountdown, 1000 * 60 * 60 * 24); // Daily refresh

    // Load user-specific data
    function loadUserData(username) {
        const userData = JSON.parse(localStorage.getItem(username)) || {};
        return userData;
    }

    // Save user-specific data
    function saveUserData(username, data) {
        localStorage.setItem(username, JSON.stringify(data));
    }

    // Display a section and hide others
    window.showSection = (sectionId) => {
        const sections = [loginContainer, homeContainer, weekPlanContainer, completedTargetContainer, workHoursContainer];
        sections.forEach(section => section.classList.add('hidden'));

        let targetSection;
        switch (sectionId) {
            case 'login':
                targetSection = loginContainer;
                break;
            case 'home':
                targetSection = homeContainer;
                break;
            case 'week-plan':
                targetSection = weekPlanContainer;
                break;
            case 'completed-target':
                targetSection = completedTargetContainer;
                break;
            case 'work-hours':
                targetSection = workHoursContainer;
                break;
            default:
                targetSection = loginContainer;
        }
        targetSection.classList.remove('hidden');

        // Blur background only for home and sub-sections
        const background = document.querySelector('.background-image');
        if (sectionId === 'home' || sectionId === 'week-plan' || sectionId === 'completed-target' || sectionId === 'work-hours') {
            background.classList.add('blurred');
        } else {
            background.classList.remove('blurred');
        }

        // Re-render data for the current user when navigating
        if (currentLoggedInUser) {
            renderWeekPlanTables(currentLoggedInUser);
            renderCompletedTargetTables(currentLoggedInUser);
            renderWorkHoursTable(currentLoggedInUser);
        }
    };

    // Handle login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (username === "" || password === "") {
            errorMessage.textContent = "කරුණාකර පරිශීලක නාමය සහ මුරපදය ඇතුළත් කරන්න.";
            return;
        }

        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};

        if (registeredUsers[username]) {
            // Existing user
            if (registeredUsers[username] === password) {
                localStorage.setItem('loggedInUser', username);
                errorMessage.textContent = '';
                showSection('home');
                renderUserSpecificData(username); // Render data for logged-in user
            } else {
                errorMessage.textContent = "වැරදි මුරපදය.";
            }
        } else {
            // New user registration
            registeredUsers[username] = password;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            localStorage.setItem('loggedInUser', username);
            errorMessage.textContent = '';
            // Initialize empty data for new user
            saveUserData(username, {});
            showSection('home');
            renderUserSpecificData(username); // Render empty data for new user
        }
    });

    // Helper to render all user-specific data
    function renderUserSpecificData(username) {
        renderWeekPlanTables(username);
        renderCompletedTargetTables(username);
        renderWorkHoursTable(username);
    }

    // --- WEEK PLAN Section ---
    const weekPlanSubjects = ['chemistry', 'physics', 'biology', 'cmaths'];
    const weekPlanRows = 22;
    const weekPlanCols = ['REVISION', 'REVISION EXTRA', 'PAPER DISCUSSION', 'Correcting mistakes in PAPER', 'QUICK/RAPID REVISION'];

    function renderWeekPlanTables(username) {
        weekPlanSubjects.forEach(subject => {
            const tbody = document.getElementById(week-plan-${subject}-body);
            tbody.innerHTML = ''; // Clear previous content

            const userData = loadUserData(username);
            const userWeekPlan = userData.weekPlan || {};
            userWeekPlan[subject] = userWeekPlan[subject] || {}; // Ensure subject object exists

            for (let i = 1; i <= weekPlanRows; i++) {
                const weekKey = WEEK ${String(i).padStart(2, '0')};
                const row = document.createElement('tr');
                let rowContent = <td>${weekKey}</td>;
                weekPlanCols.forEach(col => {
                    const cellKey = ${weekKey}-${col};
                    const isChecked = userWeekPlan[subject][cellKey] === true;
                    rowContent += <td><input type="checkbox" data-user="${username}" data-subject="${subject}" data-week="${weekKey}" data-col="${col}" ${isChecked ? 'checked' : ''}></td>;
                });
                row.innerHTML = rowContent;
                tbody.appendChild(row);
            }

            // Add event listeners after rendering
            tbody.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', handleWeekPlanCheckboxChange);
            });
        });
    }

    function handleWeekPlanCheckboxChange(event) {
        const username = event.target.dataset.user;
        const subject = event.target.dataset.subject;
        const week = event.target.dataset.week;
        const col = event.target.dataset.col;
        const isChecked = event.target.checked;

        const userData = loadUserData(username);
        userData.weekPlan = userData.weekPlan || {};
        userData.weekPlan[subject] = userData.weekPlan[subject] || {};
        userData.weekPlan[subject][${week}-${col}] = isChecked;
        saveUserData(username, userData);
    }

    window.showWeekPlanSubject = (subject) => {
        weekPlanSubjects.forEach(sub => {
            document.getElementById(week-plan-${sub}).classList.add('hidden');
        });
        document.getElementById(week-plan-${subject}).classList.remove('hidden');
    };

    // --- COMPLETED TARGET Section ---
    const completedTargetSubjects = {
        'chemistry': { units: 14, cols: ['REVISION VIDEOS', 'HOMEWORK', 'PAST PAPERS (LESSON VISE)'] },
        'physics': { units: 11, cols: ['REVISION VIDEOS', 'HOMEWORK', 'PAST PAPERS (LESSON VISE විවරණ)'] },
        'biology': { units: 10, cols: ['REVISION VIDEOS', 'HOMEWORK', 'PAST PAPERS (LESSON VISE)'] }
    };

    function renderCompletedTargetTables(username) {
        Object.keys(completedTargetSubjects).forEach(subject => {
            const tbody = document.getElementById(completed-target-${subject}-body);
            tbody.innerHTML = ''; // Clear previous content

            const userData = loadUserData(username);
            const userCompletedTarget = userData.completedTarget || {};
            userCompletedTarget[subject] = userCompletedTarget[subject] || {}; // Ensure subject object exists

            const config = completedTargetSubjects[subject];
            for (let i = 1; i <= config.units; i++) {
                const unitKey = UNIT ${String(i).padStart(2, '0')};
                const row = document.createElement('tr');
                let rowContent = <td>${unitKey}</td>;
                config.cols.forEach(col => {
                    const cellKey = ${unitKey}-${col};
                    const isChecked = userCompletedTarget[subject][cellKey] === true;
                    rowContent += <td><input type="checkbox" data-user="${username}" data-subject="${subject}" data-unit="${unitKey}" data-col="${col}" ${isChecked ? 'checked' : ''}></td>;
                });
                row.innerHTML = rowContent;
                tbody.appendChild(row);
            }

            // Add event listeners after rendering
            tbody.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', handleCompletedTargetCheckboxChange);
            });
        });
    }

    function handleCompletedTargetCheckboxChange(event) {
        const username = event.target.dataset.user;
        const subject = event.target.dataset.subject;
        const unit = event.target.dataset.unit;
        const col = event.target.dataset.col;
        const isChecked = event.target.checked;

        const userData = loadUserData(username);
        userData.completedTarget = userData.completedTarget || {};
        userData.completedTarget[subject] = userData.completedTarget[subject] || {};
        userData.completedTarget[subject][${unit}-${col}] = isChecked;
        saveUserData(username, userData);
    }

    window.showCompletedTargetSubject = (subject) => {
        Object.keys(completedTargetSubjects).forEach(sub => {
            document.getElementById(completed-target-${sub}).classList.add('hidden');
        });
        document.getElementById(completed-target-${subject}).classList.remove('hidden');
    };

    // --- WORK HOURS Section ---
    const workHoursWeeks = 23;
    const workHoursDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const hoursOptions = Array.from({ length: 16 }, (_, i) => i + 3); // 3 to 18 hours

    function renderWorkHoursTable(username) {
        const tbody = document.getElementById('work-hours-body');
        tbody.innerHTML = ''; // Clear previous content

        const userData = loadUserData(username);
        const userWorkHours = userData.workHours || {};

        for (let i = 1; i <= workHoursWeeks; i++) {
            const weekKey = WEEK ${String(i).padStart(2, '0')};
            const row = document.createElement('tr');
            let rowContent = <td>${weekKey}</td>;
            let weekTotal = 0;

            workHoursDays.forEach(day => {
                const cellKey = ${weekKey}-${day};
                const savedHours = userWorkHours[cellKey] || 0; // Default to 0 if not set
                weekTotal += parseInt(savedHours);

                let selectOptions = hoursOptions.map(hour => <option value="${hour}" ${savedHours == hour ? 'selected' : ''}>${hour} HOURS</option>).join('');
                rowContent += `<td>
                                <select data-user="${username}" data-week="${weekKey}" data-day="${day}">
                                    <option value="0">Select Hours</option>
                                    ${selectOptions}
                                </select>
                            </td>`;
            });
            rowContent += <td id="week-total-${weekKey}">${weekTotal}</td>;
            row.innerHTML = rowContent;
            tbody.appendChild(row);
        }

        // Add event listeners after rendering
        tbody.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', handleWorkHoursSelectChange);
        });
    }

    function handleWorkHoursSelectChange(event) {
        const username = event.target.dataset.user;
        const week = event.target.dataset.week;
        const day = event.target.dataset.day;
        const selectedHours = parseInt(event.target.value);

        const userData = loadUserData(username);
        userData.workHours = userData.workHours || {};
        userData.workHours[${week}-${day}] = selectedHours;
        saveUserData(username, userData);

        // Update WEEK TOTAL for the row
        let currentWeekTotal = 0;
        workHoursDays.forEach(d => {
            const savedHours = userData.workHours[${week}-${d}] || 0;
            currentWeekTotal += parseInt(savedHours);
        });
        document.getElementById(week-total-${week}).textContent = currentWeekTotal;
    }

    // Check if a user is already logged in on page load
    if (currentLoggedInUser) {
        showSection('home');
        renderUserSpecificData(currentLoggedInUser);
    } else {
        showSection('login');
    }
});
