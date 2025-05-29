<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Path to the tasks JSON file
$filePath = __DIR__ . '/../tasks.json';

// Get the POST data
$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$priority = $_POST['priority'] ?? 'low';
$tags = $_POST['tags'] ?? '';
$created_at = $_POST['created_at'] ?? date('Y-m-d H:i:s');

// Validate input
if (empty($title)) {
    echo json_encode(['success' => false, 'message' => 'Title is required']);
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

// Add new task
$newTask = [
    'id' => uniqid(),
    'title' => $title,
    'description' => $description,
    'priority' => $priority,
    'tags' => $tags,
    'completed' => false,
    'created_at' => $created_at
];

$tasks[] = $newTask;

// Save to file
if (file_put_contents($filePath, json_encode($tasks, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true, 'message' => 'Task added successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error saving task']);
}
?>