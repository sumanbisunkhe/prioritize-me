document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const tasksContainer = document.getElementById('tasksContainer');
    const cancelBtn = document.getElementById('cancelBtn');
    const clearBtn = document.getElementById('clearBtn');
    const submitBtn = taskForm.querySelector('button[type="submit"]');
    const statsBtn = document.getElementById('statsBtn');
    const tasksBtn = document.getElementById('tasksBtn');
    const statsView = document.getElementById('statsView');
    const taskList = document.querySelector('.task-list');
    
    // Load tasks when page loads
    loadTasks();
    
    // Set initial active state
    tasksBtn.classList.add('active');
    
    // Handle tasks button click
    tasksBtn.addEventListener('click', function() {
        if (!tasksBtn.classList.contains('active')) {
            tasksBtn.classList.add('active');
            statsBtn.classList.remove('active');
            taskList.style.display = 'flex';
            statsView.style.display = 'none';
        }
    });

    // Handle stats button click
    statsBtn.addEventListener('click', function() {
        if (!statsBtn.classList.contains('active')) {
            statsBtn.classList.add('active');
            tasksBtn.classList.remove('active');
            taskList.style.display = 'none';
            statsView.style.display = 'flex';
            updateStats();
        }
    });
    
    // Handle form submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const priority = document.getElementById('taskPriority').value;
        const tags = document.getElementById('taskTags').value;
        const taskId = document.getElementById('taskForm').dataset.taskId;
        
        if (taskId) {
            editTask(taskId, title, description, priority, tags);
        } else {
            addTask(title, description, priority, tags);
        }
        
        resetForm();
    });

    // Handle cancel button
    cancelBtn.addEventListener('click', resetForm);

    // Handle clear button
    clearBtn.addEventListener('click', function() {
        const taskId = document.getElementById('taskForm').dataset.taskId;
        if (!taskId) { // Only clear if not in edit mode
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskPriority').value = 'low';
            document.getElementById('taskTags').value = '';
            document.getElementById('taskTitle').focus();
        }
    });

    // Handle status filter
    const statusFilter = document.getElementById('statusFilter');
    statusFilter.addEventListener('change', filterTasks);

    // Handle priority filter
    const priorityFilter = document.getElementById('priorityFilter');
    priorityFilter.addEventListener('change', filterTasks);
});

function resetForm() {
    const taskForm = document.getElementById('taskForm');
    const submitBtn = taskForm.querySelector('button[type="submit"]');
    const cancelBtn = document.getElementById('cancelBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    taskForm.reset();
    taskForm.dataset.taskId = '';
    submitBtn.textContent = 'Add Task';
    cancelBtn.style.display = 'none';
    clearBtn.style.display = 'block';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time part for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Format time consistently
    const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });

    if (taskDate.getTime() === today.getTime()) {
        // Today
        return `Today ${timeStr}`;
    } else if (taskDate.getTime() === yesterday.getTime()) {
        // Yesterday
        return `Yesterday ${timeStr}`;
    } else {
        // Other days
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }) + ` ${timeStr}`;
    }
}

function loadTasks() {
    fetch('api/get_tasks.php')
        .then(response => response.json())
        .then(tasks => {
            const tasksContainer = document.getElementById('tasksContainer');
            tasksContainer.innerHTML = '';
            
            if (tasks.length === 0) {
                tasksContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <p>No tasks found. Add your first task!</p>
                    </div>`;
                return;
            }
            
            // Sort tasks by date in descending order
            tasks.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return dateB - dateA;
            });
            
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                tasksContainer.appendChild(taskElement);
            });

            // Apply current filters
            filterTasks();

            // Update stats if stats view is visible
            if (document.getElementById('statsView').style.display === 'flex') {
                updateStats();
            }
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
            tasksContainer.innerHTML = '<p>Error loading tasks. Please try again.</p>';
        });
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task ${task.completed ? 'completed' : ''} priority-${task.priority || 'low'}`;
    taskElement.dataset.id = task.id;
    
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    
    const taskTitle = document.createElement('div');
    taskTitle.className = 'task-title';
    
    const checkbox = document.createElement('div');
    checkbox.className = `task-checkbox ${task.completed ? 'checked' : ''}`;
    checkbox.innerHTML = '<i class="fas fa-check"></i>';
    checkbox.onclick = () => toggleTaskComplete(task.id);
    
    const title = document.createElement('h3');
    title.textContent = task.title;

    // Add priority indicator
    const priorityIndicator = document.createElement('div');
    priorityIndicator.className = 'task-priority';
    let priorityIcon = '';
    switch(task.priority) {
        case 'high':
            priorityIcon = '<i class="fas fa-exclamation-circle"></i> High Priority';
            break;
        case 'medium':
            priorityIcon = '<i class="fas fa-exclamation"></i> Medium Priority';
            break;
        case 'low':
            priorityIcon = '<i class="fas fa-arrow-down"></i> Low Priority';
            break;
    }
    priorityIndicator.innerHTML = priorityIcon;
    
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = () => prepareEdit(task.id, task.title, task.description, task.priority, task.tags);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.onclick = () => deleteTask(task.id);
    
    const description = document.createElement('p');
    description.textContent = task.description;
    
    const taskFooter = document.createElement('div');
    taskFooter.className = 'task-footer';
    
    const taskTags = document.createElement('div');
    taskTags.className = 'task-tags';
    if (task.tags) {
        task.tags.split(',').forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'task-tag';
            tagElement.textContent = tag.trim();
            taskTags.appendChild(tagElement);
        });
    }
    
    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = formatDate(task.created_at);
    
    taskTitle.appendChild(checkbox);
    taskTitle.appendChild(title);
    taskTitle.appendChild(priorityIndicator);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    taskHeader.appendChild(taskTitle);
    taskHeader.appendChild(actions);
    
    taskFooter.appendChild(taskTags);
    taskFooter.appendChild(date);
    
    taskElement.appendChild(taskHeader);
    taskElement.appendChild(description);
    taskElement.appendChild(taskFooter);
    
    return taskElement;
}

function filterTasks() {
    const tasks = document.querySelectorAll('.task');
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    tasks.forEach(task => {
        const isCompleted = task.classList.contains('completed');
        const taskPriority = task.classList.contains('priority-high') ? 'high' :
                           task.classList.contains('priority-medium') ? 'medium' :
                           'low';
        
        let showByStatus = true;
        let showByPriority = true;
        
        // Filter by status
        switch(statusFilter) {
            case 'active':
                showByStatus = !isCompleted;
                break;
            case 'completed':
                showByStatus = isCompleted;
                break;
            case 'all':
            default:
                showByStatus = true;
        }
        
        // Filter by priority
        if (priorityFilter !== 'all') {
            showByPriority = taskPriority === priorityFilter;
        }
        
        // Show task only if it matches both filters
        task.style.display = (showByStatus && showByPriority) ? 'block' : 'none';
    });
}

function toggleTaskComplete(taskId) {
    fetch('api/toggle_task.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${encodeURIComponent(taskId)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTasks(); // Refresh the task list
        } else {
            alert('Error updating task: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error updating task:', error);
        alert('Error updating task. Please try again.');
    });
}

function addTask(title, description, priority, tags) {
    const currentDate = new Date().toISOString();
    fetch('api/add_task.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&priority=${encodeURIComponent(priority)}&tags=${encodeURIComponent(tags)}&created_at=${encodeURIComponent(currentDate)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTasks(); // Refresh the task list
        } else {
            alert('Error adding task: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error adding task:', error);
        alert('Error adding task. Please try again.');
    });
}

function editTask(taskId, title, description, priority, tags) {
    const currentDate = new Date().toISOString();
    fetch('api/edit_task.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${encodeURIComponent(taskId)}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&priority=${encodeURIComponent(priority)}&tags=${encodeURIComponent(tags)}&updated_at=${encodeURIComponent(currentDate)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTasks(); // Refresh the task list
        } else {
            alert('Error updating task: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error updating task:', error);
        alert('Error updating task. Please try again.');
    });
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        fetch('api/delete_task.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${encodeURIComponent(taskId)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadTasks(); // Refresh the task list
            } else {
                alert('Error deleting task: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            alert('Error deleting task. Please try again.');
        });
    }
}

function prepareEdit(taskId, title, description, priority, tags) {
    document.getElementById('taskTitle').value = title;
    document.getElementById('taskDescription').value = description;
    document.getElementById('taskPriority').value = priority;
    document.getElementById('taskTags').value = tags;
    document.getElementById('taskForm').dataset.taskId = taskId;
    document.querySelector('button[type="submit"]').textContent = 'Update Task';
    document.getElementById('cancelBtn').style.display = 'block';
    document.getElementById('clearBtn').style.display = 'none';
    document.getElementById('taskTitle').focus();
}

function updateStats() {
    fetch('api/tasks_stats.php')
        .then(response => response.json())
        .then(stats => {
            // Update basic stats
            document.getElementById('totalTasks').textContent = stats.total;
            document.getElementById('completedTasks').textContent = stats.completed;
            document.getElementById('activeTasks').textContent = stats.active;
            document.getElementById('highPriority').textContent = stats.priority.high;

            // Update priority percentages
            document.getElementById('highPercent').textContent = `${stats.priority_percentages.high}%`;
            document.getElementById('mediumPercent').textContent = `${stats.priority_percentages.medium}%`;
            document.getElementById('lowPercent').textContent = `${stats.priority_percentages.low}%`;

            // Update priority bars
            document.querySelector('.high-fill').style.width = `${stats.priority_percentages.high}%`;
            document.querySelector('.medium-fill').style.width = `${stats.priority_percentages.medium}%`;
            document.querySelector('.low-fill').style.width = `${stats.priority_percentages.low}%`;
        })
        .catch(error => {
            console.error('Error loading stats:', error);
    });
}