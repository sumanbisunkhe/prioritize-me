<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Path to the tasks JSON file
$filePath = __DIR__ . '/../tasks.json';

// Get the POST data
$taskId = $_POST['id'] ?? '';
$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$priority = $_POST['priority'] ?? 'low';
$tags = $_POST['tags'] ?? '';
$updated_at = $_POST['updated_at'] ?? date('Y-m-d H:i:s');

// Validate input
if (empty($taskId) || empty($title)) {
    echo json_encode(['success' => false, 'message' => 'Task ID and title are required']);
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

// Find and update the task
$taskFound = false;
foreach ($tasks as &$task) {
    if ($task['id'] === $taskId) {
        $task['title'] = $title;
        $task['description'] = $description;
        $task['priority'] = $priority;
        $task['tags'] = $tags;
        $task['updated_at'] = $updated_at;
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
    echo json_encode(['success' => true, 'message' => 'Task updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error saving task']);
}
?> 