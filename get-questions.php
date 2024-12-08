<?php
// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'db_connection.php'; 

if (!$pdo) {
    die(json_encode(array("error" => "Database connection failed")));
}

// Function to fetch questions from the database
function getQuestions() {
    global $pdo;

    // Query to fetch all questions from the database
    $query = "SELECT * FROM questions";

    try {
        // Prepare the SQL statement
        $stmt = $pdo->prepare($query);
        $stmt->execute();

        // Fetch all results as an associative array
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Return the results as JSON
        echo json_encode($questions);
    } catch (PDOException $e) {
        // In case of any error, return an error message
        echo json_encode(array("error" => "Failed to fetch questions: " . $e->getMessage()));
    }
}

// Check if this is a POST request (for inserting score and time)
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Read raw JSON input
    $data = json_decode(file_get_contents("php://input"), true);

    // Check if the required parameters are provided
    if (isset($data['studentId'], $data['fullName'], $data['score'], $data['time'])) {
        $studentId = $data['studentId'];
        $fullName = $data['fullName'];
        $score = $data['score'];
        $time = $data['time'];

        // SQL query to insert score and time into the 'users' table
        $query = "INSERT INTO users (student_id, name, time, score) VALUES (:studentId, :fullName, :time, :score)";
        
        try {
            // Prepare and execute the insert query
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':studentId', $studentId);
            $stmt->bindParam(':fullName', $fullName);
            $stmt->bindParam(':time', $time, PDO::PARAM_INT);
            $stmt->bindParam(':score', $score, PDO::PARAM_INT);
            $stmt->execute();

            // Return success message
            echo json_encode(array("status" => "success", "message" => "Score and time inserted successfully"));
        } catch (PDOException $e) {
            // Handle any errors during the insert
            echo json_encode(array("error" => "Failed to insert score and time: " . $e->getMessage()));
        }
    } else {
        // Missing parameters
        echo json_encode(array("error" => "Missing required parameters"));
    }
} else {
    // Handle GET requests
    getQuestions();
}

?>
