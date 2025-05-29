<?php
header('Content-Type: application/json');

// Path to the tasks JSON file
$filePath = __DIR__ . '/../tasks.json';

// Read tasks from file
if (file_exists($filePath)) {
    $tasks = json_decode(file_get_contents($filePath), true);
    if ($tasks === null) {
        $tasks = [];
    }
} else {
    $tasks = [];
}

// Return tasks in reverse order (newest first)
echo json_encode(array_reverse($tasks));
?>