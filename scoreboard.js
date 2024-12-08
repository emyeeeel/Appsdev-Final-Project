const avatars = [
    "avatars/anaconda.png",
    "avatars/butterfly.png",
    "avatars/deer.png",
    "avatars/fossil.png",
    "avatars/ganesha.png",
    "avatars/jaguar.png",
    "avatars/koi.png",
    "avatars/pelican.png",
    "avatars/rabbit.png",
    "avatars/shark.png"
];

// Function to shuffle avatars array (this is for random avatar assignment)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
}

shuffleArray(avatars);

// Fetch the top 10 scorers using axios
axios.get('top-scorers.php')
    .then(response => {
        const topScorers = response.data;  // Assuming the response is an array of user objects

        // Find the scoreboard list container in the HTML
        const scoreboardList = document.getElementById('scoreboard-list');

        // Loop through the top scorers and populate the HTML
        topScorers.forEach((user, index) => {
            const scorer = document.createElement('div');
            scorer.classList.add('scorer-info');

            // Create image container and set avatar
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            const image = document.createElement('img');
            image.src = avatars[index]; 
            image.alt = `Player ${index + 1}`; 
            imageContainer.appendChild(image);

            // Create name container and set name
            const nameContainer = document.createElement('div');
            nameContainer.classList.add('name');
            nameContainer.textContent = user.name;

            // Create score container and set score
            const scoreContainer = document.createElement('div');
            scoreContainer.classList.add('score');
            scoreContainer.textContent = user.score;

            // Append the parts to the scorer element
            scorer.appendChild(imageContainer);
            scorer.appendChild(nameContainer);
            scorer.appendChild(scoreContainer);

            // Append the scorer to the scoreboard list container
            scoreboardList.appendChild(scorer);
        });

        // Initial pagination setup
        let currentIndex = 0;
        const scorersPerPage = 5;
        const scorers = document.querySelectorAll('.scorer-info');  // All scorer elements
        const totalScorers = scorers.length;

        let currentPage = 1;
        const totalPages = Math.ceil(totalScorers / scorersPerPage);

        // Update scorers display based on page
        function updateScorersDisplay() {
            // Hide all scorers first
            scorers.forEach(scorer => {
                scorer.style.display = 'none';
            });

            // Show the next batch of scorers
            for (let i = currentIndex; i < currentIndex + scorersPerPage && i < totalScorers; i++) {
                scorers[i].style.display = 'flex';
            }

            // Update the page indicator dynamically
            const pageIndicator = document.getElementById('page-indicator');
            pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        }

        // Show next page of scorers
        function showNext() {
            if (currentIndex + scorersPerPage < totalScorers) {
                currentIndex += scorersPerPage;
                currentPage++;
                updateScorersDisplay();
            }
        }

        // Show previous page of scorers
        function showPrevious() {
            if (currentIndex - scorersPerPage >= 0) {
                currentIndex -= scorersPerPage;
                currentPage--;
                updateScorersDisplay();
            }
        }

        // Event listeners for pagination
        document.getElementById('left-arrow').addEventListener('click', showPrevious);
        document.getElementById('right-arrow').addEventListener('click', showNext);

        // Initial display (show first 5 scorers)
        updateScorersDisplay();
    })
    .catch(error => {
        console.error("Error fetching scores: ", error);
    });