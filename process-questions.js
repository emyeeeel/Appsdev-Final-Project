document.addEventListener('DOMContentLoaded', async () => {

    const currentUserDiv = document.getElementById('current-user');
    currentUserDiv.textContent = `User: ${localStorage.getItem('full-name')}`;

    // Initialize timer variables
    let seconds = 0;
    let minutes = 0;

    // Retrieve saved timer data from localStorage (if any)
    const savedTimeInSeconds = parseInt(localStorage.getItem('timer'));

    if (savedTimeInSeconds) {
        minutes = Math.floor(savedTimeInSeconds / 60);
        seconds = savedTimeInSeconds % 60;
    }

    // Timer function
    function updateTimer() {
        // Increment the seconds
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }

        // Set time limit to 30 minutes (1800 seconds)
        if (minutes >= 30) {
            // Save the total time in localStorage
            const totalSeconds = (minutes * 60) + seconds;
            localStorage.setItem('timer', totalSeconds);
            // Forcibly submit the form data and redirect to the scoreboard
            submitFormData();
            return;
        }

        // Display time in MM:SS format
        const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = timerText;

        // Save the total time in localStorage
        const totalSeconds = (minutes * 60) + seconds;
        localStorage.setItem('timer', totalSeconds);
    }

    setInterval(updateTimer, 1000);

    // Check if questions are already in localStorage
    let questions = JSON.parse(localStorage.getItem('questions'));

    if (!questions) {
        // If no questions in localStorage, fetch them
        questions = await fetchQuestions();
        // Save questions in localStorage
        localStorage.setItem('questions', JSON.stringify(questions));
    }

    if (questions.length === 0) {
        alert("No questions available!");
        return;
    }

    // Retrieve saved state from localStorage (if any)
    let currentQuestionIndex = parseInt(localStorage.getItem('currentQuestionIndex')) || 0;
    let userScore = parseInt(localStorage.getItem('userScore')) || 0;

    const nextButton = document.getElementById('next-btn');
    const questionSpan = document.querySelector('#header-container span');
    const currentQuestionDiv = document.getElementById('current-question');
    const choiceElements = document.querySelectorAll('#choices-container .placeholder-text');
    const choices = [
        { element: document.getElementById('choice-1'), checkmark: document.getElementById('choice-1').querySelector('.checkmark') },
        { element: document.getElementById('choice-2'), checkmark: document.getElementById('choice-2').querySelector('.checkmark') },
        { element: document.getElementById('choice-3'), checkmark: document.getElementById('choice-3').querySelector('.checkmark') },
        { element: document.getElementById('choice-4'), checkmark: document.getElementById('choice-4').querySelector('.checkmark') }
    ];

    const loadQuestion = () => {
        const questionData = questions[currentQuestionIndex];
        currentQuestionDiv.textContent = questionData.question;
        questionSpan.textContent = `Question ${currentQuestionIndex + 1}`;

        choiceElements.forEach((element, index) => {
            element.textContent = questionData.choices[index];
        });

        resetChoices();
    };

    const resetChoices = () => {
        choices.forEach(choice => {
            choice.element.classList.remove('disabled');
            choice.checkmark.style.display = 'none';
        });
        nextButton.disabled = true;
    };

    const handleChoiceClick = (selectedChoice, correctAnswer) => {
        choices.forEach(choice => {
            const placeholder = choice.element.querySelector('.placeholder-text').textContent;

            if (choice === selectedChoice) {
                if (placeholder === correctAnswer) {
                    choice.checkmark.innerHTML = "&#10004;"; 
                    choice.checkmark.style.display = 'inline';
                    userScore++;  
                } else {
                    choice.checkmark.innerHTML = "&#10006;"; 
                    choice.checkmark.style.display = 'inline';
                }
            } else if (placeholder === correctAnswer) {
                choice.checkmark.innerHTML = "&#10004;"; 
                choice.checkmark.style.display = 'inline';
            } else {
                choice.checkmark.style.display = 'none';
            }

            choice !== selectedChoice ? choice.element.classList.add('disabled') : choice.element.classList.remove('disabled');
        });

        nextButton.disabled = false;

        // Save the score and question index to localStorage
        localStorage.setItem('userScore', userScore);
        localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
    };

    choices.forEach(choice => {
        choice.element.addEventListener('click', () => handleChoiceClick(choice, questions[currentQuestionIndex].correct_answer));
    });

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        
        // Check if all questions have been answered
        if (currentQuestionIndex < questions.length) {
            loadQuestion();  // Load next question
        } else {
            nextButton.disabled = true;
            submitFormData();  // Submit the form data if all questions are answered or time is up
        }

        // Save the current question index to localStorage
        localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
    });    

    loadQuestion();

    // Function to submit form data
    function submitFormData() {
        // Retrieve student ID, full name, time, and score from localStorage
        const studentId = localStorage.getItem('student-id');
        const fullName = localStorage.getItem('full-name');
        const time = localStorage.getItem('timer'); // time in seconds
        const score = localStorage.getItem('userScore');

        if (studentId && fullName) {
            const formData = {
                studentId: studentId,
                fullName: fullName,
                score: score,
                time: time
            };

            // Log the form data and post it to the server
            console.log(formData);

            axios.post('get-questions.php', formData)
                .then(response => {
                    console.log('Response:', response);
                    // Show the loader
                    loader.style.display = "flex"; // Make sure the loader shows up

                    console.log("Loader shown");

                    // Wait for a moment before redirecting
                    setTimeout(function() {
                        loader.style.display = "none"; // Hide the loader
                        console.log("Redirecting...");
                        window.location.href = "scoreboard.html";  
                    }, 2000); // Give a small delay before redirecting
                })
                .catch(error => {
                    console.error('Error posting score:', error);
                });
        } else {
            console.error('Student ID or Full Name not found in localStorage');
        }
    }
});

// Function to fetch questions from the API
const fetchQuestions = async () => {
    try {
        const response = await axios.get('get-questions.php');
        const randomIndices = generateRandomIndices(20, 1, 50);

        return randomIndices.map(index => {
            const questionData = response.data[index - 1];
            const choices = [questionData.choice_1, questionData.choice_2, questionData.choice_3, questionData.choice_4];
            shuffleArray(choices);

            const correctAnswer = questionData.correct_answer;
            const correctAnswerShuffled = choices.find(choice => choice === correctAnswer);

            return {
                question: questionData.question,
                choices: choices,
                correct_answer: correctAnswerShuffled
            };
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

// Function to generate random indices for selecting questions
const generateRandomIndices = (num, min, max) => {
    const indices = new Set();
    while (indices.size < num) {
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        indices.add(randomNumber);
    }
    return [...indices];
};

// Function to shuffle an array (used to randomize answer choices)
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};
