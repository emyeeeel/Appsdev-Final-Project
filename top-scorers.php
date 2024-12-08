<?php
// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'db_connection.php'; 

if (!$pdo) {
    die(json_encode(array("error" => "Database connection failed")));
}

// Function to fetch the top 10 users with the highest score
function getScores() {
    global $pdo;

    // Query to fetch first 10 users with highest score from users table
    $query = "SELECT * FROM users ORDER BY score DESC LIMIT 10";

    try {
        // Prepare the SQL statement
        $stmt = $pdo->prepare($query);
        $stmt->execute();

        // Fetch all results as an associative array
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Return the results as JSON
        echo json_encode($users);
    } catch (PDOException $e) {
        // In case of any error, return an error message
        echo json_encode(array("error" => "Failed to fetch users: " . $e->getMessage()));
    }
}

// Call the function to return the top 10 users as JSON
getScores();
?>
