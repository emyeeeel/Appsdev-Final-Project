<?php
// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Include database connection
require_once 'db_connection.php'; 

// Check if the connection is established
if (!$pdo) {
    die(json_encode(array("error" => "Database connection failed")));
}

// Get the POST data (raw JSON input)
$data = json_decode(file_get_contents('php://input'), true);

// Check if the necessary fields are provided in the request
if (
    !isset($data['student_id']) || empty($data['student_id']) ||
    !isset($data['full_name']) || empty($data['full_name']) ||
    !isset($data['time']) || empty($data['time']) ||
    !isset($data['score']) || empty($data['score'])
) {
    // If any required field is missing, return an error
    echo json_encode(array("error" => "All fields are required"));
    exit();
}

// Sanitize and assign input data to variables
$student_id = htmlspecialchars(trim($data['student_id']));
$full_name = htmlspecialchars(trim($data['full_name']));
$time = htmlspecialchars(trim($data['time']));
$score = htmlspecialchars(trim($data['score']));

// Prepare the SQL query to update the user record (not students)
$sql = "UPDATE users SET name = :full_name, time = :time, score = :score WHERE student_id = :student_id";

// Prepare the statement
$stmt = $pdo->prepare($sql);

// Bind the parameters to the prepared statement
$stmt->bindParam(':student_id', $student_id, PDO::PARAM_STR);
$stmt->bindParam(':full_name', $full_name, PDO::PARAM_STR);
$stmt->bindParam(':time', $time, PDO::PARAM_STR);
$stmt->bindParam(':score', $score, PDO::PARAM_STR);

// Execute the query
if ($stmt->execute()) {
    // If the update is successful, return a success response
    echo json_encode(array("success" => true, "message" => "Student data updated successfully"));
} else {
    // If the update fails, return an error message
    echo json_encode(array("error" => "Failed to update student data"));
}
?>
