<?php
// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'db_connection.php'; 

if (!$pdo) {
    die(json_encode(array("error" => "Database connection failed")));
}

// Function to fetch all users from the database
function getUsers(){
    global $pdo;

    // Query to fetch all users from the users table
    $query = "SELECT * FROM users";

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

// Function to delete a user from the users table based on student_id and name
function deleteUser($student_id, $name){
    global $pdo;

    // Query to delete a user based on student_id and name
    $query = "DELETE FROM users WHERE student_id = :student_id AND name = :name";

    try {
        // Prepare the SQL statement
        $stmt = $pdo->prepare($query);

        // Bind the parameters
        $stmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name, PDO::PARAM_STR);

        // Execute the query
        $stmt->execute();

        // Check if any row was deleted
        if ($stmt->rowCount() > 0) {
            echo json_encode(array("success" => "User deleted successfully"));
        } else {
            echo json_encode(array("error" => "No user found with the given student_id and name"));
        }
    } catch (PDOException $e) {
        // In case of any error, return an error message
        echo json_encode(array("error" => "Failed to delete user: " . $e->getMessage()));
    }
}

// Check if the request is for deleting a user (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve the input data
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['student_id']) && isset($data['name'])) {
        $student_id = $data['student_id'];
        $name = $data['name'];

        // Call the function to delete the user
        deleteUser($student_id, $name);
    } else {
        echo json_encode(array("error" => "Invalid input, student_id and name are required"));
    }
} else {
    // If not a POST request, fetch the users
    getUsers();
}
?>
