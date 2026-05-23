document.addEventListener('DOMContentLoaded', () => {
    // Get colors from CSS variables for consistency
    const style = getComputedStyle(document.documentElement);
    const colors = {
        primary: style.getPropertyValue('--primary').trim(),
        secondary: style.getPropertyValue('--secondary').trim(),
        success: style.getPropertyValue('--success').trim(),
        warning: style.getPropertyValue('--warning').trim(),
        danger: style.getPropertyValue('--danger').trim(),
        text: '#64748b'
    };

    // Global Chart Defaults
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = colors.text;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    // 1. Enrollment Line Chart
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineGradient = lineCtx.createLinearGradient(0, 0, 0, 200);
    lineGradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
    lineGradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

    const enrollmentChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
            datasets: [{
                label: 'Students',
                data: [3200, 3550, 3900, 4100, 4400, 4560],
                borderColor: colors.primary,
                backgroundColor: lineGradient,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: colors.primary,
                borderWidth: 3
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(0,0,0,0.03)' }, beginAtZero: false },
                x: { grid: { display: false } }
            }
        }
    });

    // Enrollment Toggle Logic
    const enrollmentData = {
        weekly: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [4550, 4555, 4558, 4560, 4560, 4560, 4560]
        },
        monthly: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [4100, 4250, 4380, 4420, 4510, 4560]
        },
        yearly: {
            labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
            data: [3200, 3550, 3900, 4100, 4400, 4560]
        }
    };

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            
            // Update UI
            this.parentElement.querySelector('.active').classList.remove('active');
            this.classList.add('active');
            
            // Update Chart
            enrollmentChart.data.labels = enrollmentData[period].labels;
            enrollmentChart.data.datasets[0].data = enrollmentData[period].data;
            enrollmentChart.update();
        });
    });

    // 2. Fees Doughnut Chart
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Paid', 'Pending'],
            datasets: [{
                data: [82, 18],
                backgroundColor: [colors.success, colors.warning],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 15
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15 } }
            }
        }
    });

    // 3. Attendance Bar Chart
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['S.1', 'S.2', 'S.3', 'S.4', 'S.5', 'S.6'],
            datasets: [{
                label: 'Attendance %',
                data: [96, 92, 95, 98, 91, 93],
                backgroundColor: colors.secondary,
                borderRadius: 6,
                barThickness: 18
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { max: 100, grid: { borderDash: [5, 5], color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 4. Performance Radar Chart
    const piePerfCtx = document.getElementById('radarChart').getContext('2d');
    new Chart(piePerfCtx, {
        type: 'pie',
        data: {
            labels: ['Math', 'English', 'Science', 'History', 'Geography', 'Art'],
            datasets: [{
                label: 'Avg Score',
                data: [85, 78, 90, 75, 82, 88],
                backgroundColor: [
                    colors.primary, 
                    colors.secondary, 
                    colors.success, 
                    colors.warning, 
                    colors.danger, 
                    '#8b5cf6'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15 } }
            }
        }
    });

    // Modal Control Logic
    const modal = document.getElementById('studentModal');
    const addBtn = document.getElementById('addStudentBtn');
    const closeBtn = document.querySelector('.close-modal');

    if (addBtn && modal) {
        addBtn.onclick = () => modal.classList.add('active');
        closeBtn.onclick = () => modal.classList.remove('active');
        // Close when clicking outside content
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.remove('active');
        }
    }

    // Dark Mode Toggle Logic
    const darkToggle = document.getElementById('darkToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('dark');
            
            const isDark = document.body.classList.contains('dark');
            darkToggle.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            
            // Update Chart Colors for Dark Mode
            const newTextColor = isDark ? '#e2e8f0' : '#64748b';
            Chart.instances.forEach(chart => {
                chart.options.scales?.x && (chart.options.scales.x.ticks.color = newTextColor);
                chart.options.scales?.y && (chart.options.scales.y.ticks.color = newTextColor);
                chart.update();
            });
        });
    }

    // Sidebar Toggle Functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main');

    if (sidebarToggle && sidebar && main) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('expanded');
        });
    }
});