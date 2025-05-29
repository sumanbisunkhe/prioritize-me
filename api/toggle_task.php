<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Path to the tasks JSON file
$filePath = __DIR__ . '/../tasks.json';

// Get the POST data
$taskId = $_POST['id'] ?? '';

// Validate input
if (empty($taskId)) {
    echo json_encode(['success' => false, 'message' => 'Task ID is required']);
    exit;
}

// Read existing tasks
$tasks = [];
if (file_exists($filePath)) {
    $tasks = json_decode(file_get_contents($filePath), true);
    if ($tasks === null) {
        $tasks = [];
    }
}

// Find and toggle the task completion status
$taskFound = false;
foreach ($tasks as &$task) {
    if ($task['id'] === $taskId) {
        $task['completed'] = !($task['completed'] ?? false);
        $task['updated_at'] = date('Y-m-d H:i:s');
        $taskFound = true;
        break;
    }
}

if (!$taskFound) {
    echo json_encode(['success' => false, 'message' => 'Task not found']);
    exit;
}

// Save to file
if (file_put_contents($filePath, json_encode($tasks, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update task']);
}
?> 