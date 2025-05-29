<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Path to the tasks JSON file
$filePath = __DIR__ . '/../tasks.json';

// Initialize statistics
$stats = [
    'total' => 0,
    'completed' => 0,
    'active' => 0,
    'priority' => [
        'high' => 0,
        'medium' => 0,
        'low' => 0
    ],
    'recent' => [
        'today' => 0,
        'yesterday' => 0,
        'this_week' => 0
    ]
];

// Read tasks from file
if (file_exists($filePath)) {
    $tasks = json_decode(file_get_contents($filePath), true);
    if ($tasks === null) {
        $tasks = [];
    }
} else {
    $tasks = [];
}

// Calculate statistics
$now = new DateTime();
$yesterday = (new DateTime())->modify('-1 day');
$weekStart = (new DateTime())->modify('monday this week');

foreach ($tasks as $task) {
    $stats['total']++;
    
    // Count completed and active tasks
    if ($task['completed'] ?? false) {
        $stats['completed']++;
    } else {
        $stats['active']++;
    }
    
    // Count priority levels
    $priority = $task['priority'] ?? 'low';
    $stats['priority'][$priority]++;
    
    // Count recent tasks
    $taskDate = new DateTime($task['created_at']);
    $taskDate->setTime(0, 0, 0); // Reset time part for date comparison
    
    if ($taskDate == $now->setTime(0, 0, 0)) {
        $stats['recent']['today']++;
    }
    if ($taskDate == $yesterday->setTime(0, 0, 0)) {
        $stats['recent']['yesterday']++;
    }
    if ($taskDate >= $weekStart->setTime(0, 0, 0)) {
        $stats['recent']['this_week']++;
    }
}

// Calculate completion percentage
$stats['completion_percentage'] = $stats['total'] > 0 
    ? round(($stats['completed'] / $stats['total']) * 100) 
    : 0;

// Calculate priority percentages
$total = $stats['total'];
if ($total > 0) {
    $stats['priority_percentages'] = [
        'high' => round(($stats['priority']['high'] / $total) * 100),
        'medium' => round(($stats['priority']['medium'] / $total) * 100),
        'low' => round(($stats['priority']['low'] / $total) * 100)
    ];
} else {
    $stats['priority_percentages'] = [
        'high' => 0,
        'medium' => 0,
        'low' => 0
    ];
}

// Return the statistics
echo json_encode($stats);
?> 