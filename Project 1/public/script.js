// EdTech Analytics Platform - UI JavaScript

// Tab navigation
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');
}

// API base URL (relative since it's on the same server)
const API_BASE = '';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        throw new Error(`API Call Failed: ${error.message}`);
    }
}

// Helper function to display results
function displayResult(elementId, data) {
    const element = document.getElementById(elementId);
    if (typeof data === 'object') {
        element.textContent = JSON.stringify(data, null, 2);
    } else {
        element.textContent = data;
    }
}

// Helper function to handle form submission
function handleFormSubmit(formId, endpoint, method, resultElementId, dataTransformer = null) {
    const form = document.getElementById(formId);
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            let formData = new FormData(form);
            let data = {};

            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                if (value.trim() !== '') {
                    // Handle special cases
                    if (key.includes('Date') || key.includes('date')) {
                        data[key] = new Date(value).toISOString();
                    } else if (key.includes('Price') || key.includes('price')) {
                        data[key] = parseFloat(value);
                    } else if (key === 'is_active' || key === 'isActive') {
                        data[key] = form.querySelector(`[name="${key}"]`).checked;
                    } else if (key.includes('Modules') || key.includes('modules') ||
                               key.includes('TestResults') || key.includes('test_results') ||
                               key.includes('AlternativeCompletion') || key.includes('alternative_completion')) {
                        try {
                            data[key.replace('Modules', 'modules').replace('TestResults', 'test_results').replace('AlternativeCompletion', 'alternative_completion')] = JSON.parse(value);
                        } catch (parseError) {
                            data[key.replace('Modules', 'modules').replace('TestResults', 'test_results').replace('AlternativeCompletion', 'alternative_completion')] = value;
                        }
                    } else if (key.includes('Interests') || key.includes('interests')) {
                        data[key] = value.split(',').map(s => s.trim());
                    } else {
                        data[key] = value;
                    }
                }
            }

            // Apply data transformer if provided
            if (dataTransformer) {
                data = dataTransformer(data);
            }

            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (method !== 'GET' && method !== 'DELETE') {
                options.body = JSON.stringify(data);
            }

            const result = await apiCall(endpoint, options);
            displayResult(resultElementId, result);

        } catch (error) {
            displayResult(resultElementId, { error: error.message });
        }
    });
}

// Initialize form handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Users forms
    handleFormSubmit('createUserForm', '/users', 'POST', 'usersResults');
    handleFormSubmit('getUsersForm', '/users', 'GET', 'usersResults', (data) => {
        const params = new URLSearchParams();
        Object.keys(data).forEach(key => {
            if (data[key]) params.append(key, data[key]);
        });
        return params;
    });
    handleFormSubmit('updateUserForm', '/users/' + document.getElementById('updateUserId').value, 'PUT', 'usersResults', (data) => {
        const userId = document.getElementById('updateUserId').value;
        delete data.updateUserId;
        return { endpoint: `/users/${userId}`, data };
    });
    handleFormSubmit('deleteUserForm', '/users/' + document.getElementById('deleteUserId').value, 'DELETE', 'usersResults');

    // Courses forms
    handleFormSubmit('createCourseForm', '/courses', 'POST', 'coursesResults');
    handleFormSubmit('getCoursesForm', '/courses', 'GET', 'coursesResults', (data) => {
        const params = new URLSearchParams();
        Object.keys(data).forEach(key => {
            if (data[key]) params.append(key.toLowerCase().replace('getcourse', ''), data[key]);
        });
        return params;
    });
    handleFormSubmit('updateCourseForm', '/courses/' + document.getElementById('updateCourseId').value, 'PUT', 'coursesResults', (data) => {
        const courseId = document.getElementById('updateCourseId').value;
        delete data.updateCourseId;
        return { endpoint: `/courses/${courseId}`, data };
    });
    handleFormSubmit('deleteCourseForm', '/courses/' + document.getElementById('deleteCourseId').value, 'DELETE', 'coursesResults');

    // Progress forms
    handleFormSubmit('createProgressForm', '/progress', 'POST', 'progressResults');
    handleFormSubmit('getProgressForm', '/progress', 'GET', 'progressResults', (data) => {
        const params = new URLSearchParams();
        Object.keys(data).forEach(key => {
            if (data[key]) params.append(key.toLowerCase().replace('getprogress', ''), data[key]);
        });
        return params;
    });
    handleFormSubmit('updateProgressForm', '/progress/' + document.getElementById('updateProgressId').value, 'PUT', 'progressResults', (data) => {
        const progressId = document.getElementById('updateProgressId').value;
        delete data.updateProgressId;
        return { endpoint: `/progress/${progressId}`, data };
    });
    handleFormSubmit('deleteProgressForm', '/progress/' + document.getElementById('deleteProgressId').value, 'DELETE', 'progressResults');
});

// Analytics functions
async function getTopActiveStudents() {
    try {
        const data = await apiCall('/analytics/top-active-students');
        displayResult('topStudentsResults', data);
    } catch (error) {
        displayResult('topStudentsResults', { error: error.message });
    }
}

async function getAlternativeCompletionStudents() {
    try {
        const data = await apiCall('/analytics/students-completed-by-alternative');
        displayResult('alternativeCompletionResults', data);
    } catch (error) {
        displayResult('alternativeCompletionResults', { error: error.message });
    }
}

async function getCourseEnrollmentStats() {
    try {
        const data = await apiCall('/analytics/course-enrollment-stats');
        displayResult('enrollmentStatsResults', data);
    } catch (error) {
        displayResult('enrollmentStatsResults', { error: error.message });
    }
}

// Dynamic form handling for IDs in URLs
document.addEventListener('DOMContentLoaded', () => {
    // Update form endpoints based on input values before submission
    document.getElementById('updateUserForm').addEventListener('submit', function(e) {
        const userId = document.getElementById('updateUserId').value;
        if (!userId) {
            e.preventDefault();
            displayResult('usersResults', { error: 'User ID is required for update' });
            return;
        }
    });

    document.getElementById('deleteUserForm').addEventListener('submit', function(e) {
        const userId = document.getElementById('deleteUserId').value;
        if (!userId) {
            e.preventDefault();
            displayResult('usersResults', { error: 'User ID is required for deletion' });
            return;
        }
    });

    document.getElementById('updateCourseForm').addEventListener('submit', function(e) {
        const courseId = document.getElementById('updateCourseId').value;
        if (!courseId) {
            e.preventDefault();
            displayResult('coursesResults', { error: 'Course ID is required for update' });
            return;
        }
    });

    document.getElementById('deleteCourseForm').addEventListener('submit', function(e) {
        const courseId = document.getElementById('deleteCourseId').value;
        if (!courseId) {
            e.preventDefault();
            displayResult('coursesResults', { error: 'Course ID is required for deletion' });
            return;
        }
    });

    document.getElementById('updateProgressForm').addEventListener('submit', function(e) {
        const progressId = document.getElementById('updateProgressId').value;
        if (!progressId) {
            e.preventDefault();
            displayResult('progressResults', { error: 'Progress ID is required for update' });
            return;
        }
    });

    document.getElementById('deleteProgressForm').addEventListener('submit', function(e) {
        const progressId = document.getElementById('deleteProgressId').value;
        if (!progressId) {
            e.preventDefault();
            displayResult('progressResults', { error: 'Progress ID is required for deletion' });
            return;
        }
    });
});
