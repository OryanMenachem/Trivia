const loginSection = document.getElementById("login-section");
const quizSection = document.getElementById("quiz-section");
const resultsSection = document.getElementById("results-section");
const timerDisplay = document.getElementById("timer");
const questionDisplay = document.getElementById("question");
const answersDisplay = document.getElementById("answers");
const feedbackDisplay = document.getElementById("feedback");
const nextButton = document.getElementById("next-button");
const scoreDisplay = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");
const topicButtons = document.querySelectorAll(".topic-button");
const exitButton = document.getElementById("exit-button");
const randomButton = document.getElementById("random-button");
const correctAnswersResultDisplay = document.getElementById("correct-answers-result");
const incorrectAnswersResultDisplay = document.getElementById("incorrect-answers-result");
const questionTimerDisplay = document.getElementById("question-timer"); // New question timer display
const confettiContainer = document.getElementById("confetti-container"); // Confetti container - not used anymore


let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 120; // 2 minutes in seconds
let questions = [];
let lives = 3;
let gameActive = false; // Flag to track if game is active
let correctCount = 0; // Track correct answers
let incorrectCount = 0; // Track incorrect answers
let gameTimer; // Timer for the entire game
let questionTimer; // Timer for each question's 10 seconds
let questionTimeLeft = 10; // Time left for the current question

// Function to format time in MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(1, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Renders the hearts based on remaining lives
function renderHearts() {
    for (let i = 1; i <= 3; i++) {
        const heart = document.getElementById(`heart${i}`);
        if (i <= lives) {
            heart.classList.remove("hidden", "explode", "bleed"); // remove bleed class as well
        } else {
            heart.classList.add("hidden");
        }
    }
}

// Function to generate confetti - Removed

// Handles losing a life with bleeding effect
function loseLife() {
    if (lives > 0) {
        const heartIndex = lives;
        lives--; // Decrease lives immediately
        const heart = document.getElementById(`heart${heartIndex}`);
        heart.classList.remove("explode"); // Ensure explode class is removed
        heart.classList.add("bleed"); // Add bleed class for bleed animation
        setTimeout(() => {
            heart.classList.add("hidden");
            heart.classList.remove("bleed"); // remove bleed class after animation
            if (lives === 0) {
                showFailureMessage();
            }
        }, 500); // Matches animation duration
    }
}

// Displays failure message and returns to main menu
function showFailureMessage() {
    feedbackDisplay.innerHTML = `<p>You are a failure and will never amount to anything.</p>`; // Use innerHTML for paragraph within failure message
    feedbackDisplay.classList.add("failure"); // Add failure class for styling
    stopQuizTimer(); // Stop the game timer when failure message is shown
    gameActive = false; // Ensure gameActive is set to false
    setTimeout(() => {
        feedbackDisplay.textContent = "";
        feedbackDisplay.classList.remove("failure");
        quizSection.style.display = "none";
        loginSection.style.display = "block";
        lives = 3;
        renderHearts();
        currentQuestionIndex = 0;
        score = 0;
        correctCount = 0;
        incorrectCount = 0;
    }, 5000); // Shows message for 5 seconds
}


function startGame() {
    quizSection.style.display = "block";
    loginSection.style.display = "none";
    resultsSection.style.display = "none";
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    correctCount = 0;
    incorrectCount = 0;
    renderHearts();
    timeLeft = 120; // Reset timer to 2 minutes
    timerDisplay.textContent = formatTime(timeLeft);
    gameActive = true;
    loadQuestion();
    startQuizTimer(); // Start the game timer
}


// Topic selection with lives reset
topicButtons.forEach(button => {
    button.addEventListener("click", () => {
        const topic = button.dataset.topic;
        if (topic === "animals") {
            questions = animalsQuestions;
        } else if (topic === "cities") {
            questions = citiesCountriesQuestions;
        } else if (topic === "history") {
            questions = historyQuestions;
        } else if (topic === "figures") {
            questions = notableFiguresQuestions;
        }
        startGame();
    });
});

// Random questions button
randomButton.addEventListener("click", () => {
    // Combine all questions from all topics
    questions = [...animalsQuestions, ...citiesCountriesQuestions, ...historyQuestions, ...notableFiguresQuestions];
    // Shuffle the questions array to randomize the order
    questions.sort(() => Math.random() - 0.5);
    startGame();
});


// Next button logic, only proceeds if lives remain
nextButton.addEventListener("click", () => {
    if (lives > 0 && gameActive) {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            stopQuizTimer(); // Stop quiz timer when questions are finished
            showResults();
        }
    }
});

// Restart button resets lives and goes back to topic selection
restartButton.addEventListener("click", () => {
    stopQuizTimer(); // Stop quiz timer on restart
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    correctCount = 0;
    incorrectCount = 0;
    renderHearts();
    resultsSection.style.display = "none";
    loginSection.style.display = "block";
    gameActive = false;
});

// Exit button resets lives and goes back to topic selection
exitButton.addEventListener("click", () => {
    stopQuizTimer(); // Stop quiz timer on exit
    quizSection.style.display = "none";
    resultsSection.style.display = "none";
    loginSection.style.display = "block";
    lives = 3;
    correctCount = 0;
    renderHearts();
    currentQuestionIndex = 0;
    score = 0;
    feedbackDisplay.textContent = "";
    gameActive = false;
});

function loadQuestion() {
    resetAnswerButtons();
    feedbackDisplay.textContent = "";
    nextButton.style.display = "none";
    questionTimeLeft = 10; // Reset question timer
    questionTimerDisplay.textContent = questionTimeLeft; // Set initial question timer display

    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
        questionDisplay.textContent = "No more questions available.";
        answersDisplay.innerHTML = "";
        stopQuestionTimer(); // Stop question timer if applicable
        return;
    }

    let question = questions[currentQuestionIndex];
    questionDisplay.textContent = question.question;

    // Randomize answer order
    const correctIndex = question.correctAnswer; // Store original correct answer index
    const answers = [...question.answers]; // Create a copy of answers array
    const correctAnswer = answers[correctIndex]; // Get correct answer text

    // Shuffle answers array
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    // Find the new index of the correct answer after shuffling
    const randomizedCorrectAnswerIndex = answers.indexOf(correctAnswer);

    // Store the randomized correct answer index in the question object for later comparison
    question.correctAnswer = randomizedCorrectAnswerIndex;


    for (let i = 0; i < answersDisplay.children.length; i++) {
        answersDisplay.children[i].textContent = answers[i];
        answersDisplay.children[i].dataset.index = i; // Update index to match shuffled order
        answersDisplay.children[i].removeEventListener("click", selectAnswer); // Important: Remove old listeners to prevent duplicates
        answersDisplay.children[i].addEventListener("click", selectAnswer); // Re-add event listener
    }

    startQuestionTimer(); // Start timer for each question
}


function startQuestionTimer() { // Function for question timer
    questionTimeLeft = 10; // Reset time for question
    questionTimerDisplay.textContent = questionTimeLeft;
    questionTimer = setInterval(() => {
        questionTimeLeft--;
        questionTimerDisplay.textContent = questionTimeLeft;
        if (questionTimeLeft <= 0) {
            clearInterval(questionTimer);
            showCorrectAnswer();
            feedbackDisplay.textContent = "Time's up!";
            incorrectCount++;
            loseLife();
            if (lives > 0 && gameActive) {
                nextButton.style.display = "block";
            } else if (lives <= 0) {
                stopQuizTimer(); // Stop quiz timer if game over
            } else if (!gameActive) {
                stopQuizTimer(); // Ensure quiz timer stops if game is inactive
            }
            disableAnswerButtons();
        }
    }, 1000);
}

function stopQuestionTimer() { // Function to stop question timer
    clearInterval(questionTimer);
}

function startQuizTimer() {
    gameActive = true;
    timeLeft = 120; // 2 minutes
    timerDisplay.textContent = formatTime(timeLeft);
    gameTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            gameActive = false;
            showResults(); // Time's up for the entire quiz
            feedbackDisplay.textContent = "Time's up for the quiz!";
            disableAnswerButtons();
        }
        if (!gameActive) { // Check if gameActive flag is false and stop the timer.
            clearInterval(gameTimer);
        }
    }, 1000);
}

function stopQuizTimer() {
    gameActive = false; // Set game inactive flag
    clearInterval(gameTimer);
}


function selectAnswer(e) {
    if (!gameActive) return; // Prevent answer selection if game is not active
    stopQuestionTimer(); // Stop question timer when answer is selected
    disableAnswerButtons();
    let selectedButton = e.target;
    let selectedAnswerIndex = parseInt(selectedButton.dataset.index);

    if (selectedAnswerIndex === questions[currentQuestionIndex].correctAnswer) {
        selectedButton.classList.add("correct");
        feedbackDisplay.textContent = "Correct!";
        score++;
        correctCount++;
        nextButton.style.display = "block";
    } else {
        selectedButton.classList.add("incorrect");
        feedbackDisplay.textContent = "Incorrect!";
        showCorrectAnswer();
        incorrectCount++;
        loseLife();
        if (lives > 0 && gameActive) {
            nextButton.style.display = "block";
        } else if (lives <= 0) {
            stopQuizTimer(); // Stop quiz timer if game over
        } else if (!gameActive) {
             stopQuizTimer(); // Ensure quiz timer stops if game is inactive
        }
    }
    if (currentQuestionIndex === questions.length -1 ) {
        stopQuizTimer(); // Stop timer if last question is answered
    }
}

function showCorrectAnswer() {
    let correctAnswerIndex = questions[currentQuestionIndex].correctAnswer;
    answersDisplay.children[correctAnswerIndex].classList.add("correct");
}

function disableAnswerButtons() {
    for (let i = 0; i < answersDisplay.children.length; i++) {
        answersDisplay.children[i].removeEventListener("click", selectAnswer);
    }
}

function resetAnswerButtons() {
    for (let i = 0; i < answersDisplay.children.length; i++) {
        answersDisplay.children[i].className = "answer-button";
    }
}

function showResults() {
    quizSection.style.display = "none";
    resultsSection.style.display = "block";
    scoreDisplay.textContent = `Your score: ${score} / ${questions.length}`;
    correctAnswersResultDisplay.textContent = `Correct answers: ${correctCount}`;
    incorrectAnswersResultDisplay.textContent = `Incorrect answers: ${incorrectCount}`;
}

// Animals Category - 20 Questions
const animalsQuestions = [
    { question: "What is the fastest land animal?", answers: ["Cheetah", "Lion", "Horse", "Elephant"], correctAnswer: 0 },
    { question: "Which animal is known as the 'king of the jungle'?", answers: ["Lion", "Tiger", "Elephant", "Giraffe"], correctAnswer: 0 },
    { question: "What is the largest mammal?", answers: ["Blue Whale", "Elephant", "Giraffe", "Hippopotamus"], correctAnswer: 0 },
    { question: "Which animal is known for its black and white stripes?", answers: ["Zebra", "Tiger", "Panda", "Skunk"], correctAnswer: 0 },
    { question: "What is the only mammal capable of true flight?", answers: ["Bat", "Flying Squirrel", "Eagle", "Penguin"], correctAnswer: 0 },
    { question: "Which animal has the longest neck?", answers: ["Giraffe", "Elephant", "Horse", "Camel"], correctAnswer: 0 },
    { question: "What is the largest bird in the world?", answers: ["Ostrich", "Eagle", "Albatross", "Emu"], correctAnswer: 0 },
    { question: "Which animal is known for changing color to blend in?", answers: ["Chameleon", "Octopus", "Squid", "Frog"], correctAnswer: 0 },
    { question: "What is the smallest mammal in the world?", answers: ["Bumblebee Bat", "Mouse", "Shrew", "Hamster"], correctAnswer: 0 },
    { question: "Which animal is known for its trunk?", answers: ["Elephant", "Rhinoceros", "Walrus", "Tapir"], correctAnswer: 0 },
    { question: "What animal is the largest living reptile?", answers: ["Saltwater Crocodile", "Komodo Dragon", "Python", "Tortoise"], correctAnswer: 0 },
    { question: "Which animal is known for its pouch?", answers: ["Kangaroo", "Koala", "Wombat", "Platypus"], correctAnswer: 0 },
    { question: "What is the fastest bird in the world?", answers: ["Peregrine Falcon", "Eagle", "Ostrich", "Hummingbird"], correctAnswer: 0 },
    { question: "Which animal has eight legs and spins webs?", answers: ["Spider", "Octopus", "Crab", "Scorpion"], correctAnswer: 0 },
    { question: "What is the largest species of shark?", answers: ["Whale Shark", "Great White", "Hammerhead", "Tiger Shark"], correctAnswer: 0 },
    { question: "Which animal is known for its black and white markings and bamboo diet?", answers: ["Panda", "Zebra", "Penguin", "Skunk"], correctAnswer: 0 },
    { question: "What animal is the tallest living terrestrial animal?", answers: ["Giraffe", "Elephant", "Horse", "Ostrich"], correctAnswer: 0 },
    { question: "Which animal is known for its ability to regenerate lost limbs?", answers: ["Starfish", "Lizard", "Crab", "Salamander"], correctAnswer: 3 },
    { question: "What is the largest land carnivore?", answers: ["Polar Bear", "Lion", "Tiger", "Grizzly Bear"], correctAnswer: 0 },
    { question: "Which animal is known for its long hibernation?", answers: ["Bear", "Snake", "Frog", "Bat"], correctAnswer: 0 }
];

// Cities and Countries Category - 20 Questions
const citiesCountriesQuestions = [
    { question: "What is the capital of Japan?", answers: ["Beijing", "Seoul", "Tokyo", "Shanghai"], correctAnswer: 2 },
    { question: "Which country is known as the 'Land of the Rising Sun'?", answers: ["China", "Korea", "Japan", "Vietnam"], correctAnswer: 2 },
    { question: "What is the capital of France?", answers: ["Paris", "London", "Berlin", "Madrid"], correctAnswer: 0 },
    { question: "Which country is known as the Land of the Midnight Sun?", answers: ["Norway", "Canada", "Russia", "Australia"], correctAnswer: 0 },
    { question: "What is the largest city in the world by population?", answers: ["Tokyo", "Delhi", "Shanghai", "Mexico City"], correctAnswer: 0 },
    { question: "Which country has the most islands in the world?", answers: ["Sweden", "Indonesia", "Canada", "Norway"], correctAnswer: 1 },
    { question: "What is the smallest country by land area?", answers: ["Vatican City", "Monaco", "Nauru", "San Marino"], correctAnswer: 0 },
    { question: "Which city is known as the 'City of Love'?", answers: ["Paris", "Venice", "Rome", "Florence"], correctAnswer: 0 },
    { question: "What is the capital of Australia?", answers: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correctAnswer: 2 },
    { question: "Which country is home to the Great Barrier Reef?", answers: ["Australia", "Brazil", "Indonesia", "Philippines"], correctAnswer: 0 },
    { question: "What is the capital of Brazil?", answers: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correctAnswer: 2 },
    { question: "Which country is known as the 'Land of a Thousand Lakes'?", answers: ["Finland", "Canada", "Sweden", "Russia"], correctAnswer: 0 },
    { question: "What city is famous for the Statue of Liberty?", answers: ["New York", "Los Angeles", "Chicago", "Boston"], correctAnswer: 0 },
    { question: "Which country has the longest coastline in the world?", answers: ["Canada", "Australia", "Russia", "Indonesia"], correctAnswer: 0 },
    { question: "What is the capital of South Africa?", answers: ["Johannesburg", "Cape Town", "Pretoria", "Durban"], correctAnswer: 2 },
    { question: "Which city hosted the 2016 Summer Olympics?", answers: ["Rio de Janeiro", "London", "Beijing", "Tokyo"], correctAnswer: 0 },
    { question: "What country is known for the ancient ruins of Machu Picchu?", answers: ["Peru", "Mexico", "Bolivia", "Chile"], correctAnswer: 0 },
    { question: "Which European city is built on 118 small islands?", answers: ["Venice", "Amsterdam", "Stockholm", "Lisbon"], correctAnswer: 0 },
    { question: "What is the capital of India?", answers: ["Mumbai", "Delhi", "New Delhi", "Kolkata"], correctAnswer: 2 },
    { question: "Which country is the largest by land area?", answers: ["Russia", "China", "USA", "Canada"], correctAnswer: 0 }
];

// History Category - 20 Questions
const historyQuestions = [
    { question: "In which year did World War II end?", answers: ["1943", "1945", "1950", "1939"], correctAnswer: 1 },
    { question: "Who was the first president of the United States?", answers: ["Thomas Jefferson", "John Adams", "George Washington", "Abraham Lincoln"], correctAnswer: 2 },
    { question: "Who was the first man to walk on the moon?", answers: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn"], correctAnswer: 0 },
    { question: "In which year did the Berlin Wall fall?", answers: ["1989", "1991", "1987", "1990"], correctAnswer: 0 },
    { question: "What ship carried the Pilgrims to America in 1620?", answers: ["Mayflower", "Santa Maria", "Nina", "Pinta"], correctAnswer: 0 },
    { question: "Who discovered America in 1492?", answers: ["Christopher Columbus", "Leif Erikson", "Amerigo Vespucci", "Ferdinand Magellan"], correctAnswer: 0 },
    { question: "What was the ancient Egyptian writing system called?", answers: ["Hieroglyphics", "Cuneiform", "Alphabet", "Runes"], correctAnswer: 0 },
    { question: "Who was the first emperor of Rome?", answers: ["Julius Caesar", "Augustus", "Nero", "Constantine"], correctAnswer: 1 },
    { question: "In which year did the French Revolution begin?", answers: ["1789", "1799", "1776", "1804"], correctAnswer: 0 },
    { question: "Who wrote the Declaration of Independence?", answers: ["Thomas Jefferson", "George Washington", "Benjamin Franklin", "John Adams"], correctAnswer: 0 },
    { question: "Which empire built the Colosseum?", answers: ["Roman Empire", "Greek Empire", "Ottoman Empire", "Byzantine Empire"], correctAnswer: 0 },
    { question: "In which year did the Titanic sink?", answers: ["1912", "1905", "1918", "1920"], correctAnswer: 0 },
    { question: "Who was the leader of Nazi Germany during WWII?", answers: ["Adolf Hitler", "Joseph Stalin", "Benito Mussolini", "Winston Churchill"], correctAnswer: 0 },
    { question: "What ancient wonder was located in Alexandria?", answers: ["Lighthouse of Alexandria", "Hanging Gardens", "Colossus of Rhodes", "Pyramid of Giza"], correctAnswer: 0 },
    { question: "Which war ended with the Treaty of Versailles?", answers: ["World War I", "World War II", "Napoleonic Wars", "American Civil War"], correctAnswer: 0 },
    { question: "Who was the queen of England during the Spanish Armada?", answers: ["Elizabeth I", "Victoria", "Mary I", "Anne"], correctAnswer: 0 },
    { question: "In which century did the Renaissance begin?", answers: ["14th", "16th", "12th", "18th"], correctAnswer: 0 },
    { question: "What civilization built the pyramids of Giza?", answers: ["Egyptians", "Mayans", "Incas", "Mesopotamians"], correctAnswer: 0 },
    { question: "Who was the first woman to fly solo across the Atlantic?", answers: ["Amelia Earhart", "Bessie Coleman", "Harriet Quimby", "Jacqueline Cochran"], correctAnswer: 0 },
    { question: "Which event sparked World War I?", answers: ["Assassination of Archduke Franz Ferdinand", "Sinking of the Lusitania", "Invasion of Poland", "Russian Revolution"], correctAnswer: 0 }
];

// Notable Figures Category - 20 Questions
const notableFiguresQuestions = [
    { question: "Who painted the Mona Lisa?", answers: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], correctAnswer: 1 },
    { question: "Who invented the telephone?", answers: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi"], correctAnswer: 1 },
    { question: "Who is known as the father of modern physics?", answers: ["Albert Einstein", "Isaac Newton", "Galileo Galilei", "Nikola Tesla"], correctAnswer: 0 },
    { question: "Who wrote 'Romeo and Juliet'?", answers: ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"], correctAnswer: 0 },
    { question: "Who was the first female prime minister of the UK?", answers: ["Margaret Thatcher", "Theresa May", "Indira Gandhi", "Angela Merkel"], correctAnswer: 0 },
    { question: "Who discovered penicillin?", answers: ["Alexander Fleming", "Marie Curie", "Louis Pasteur", "Robert Koch"], correctAnswer: 0 },
    { question: "Who was the first to circumnavigate the globe?", answers: ["Ferdinand Magellan", "Christopher Columbus", "James Cook", "Vasco da Gama"], correctAnswer: 0 },
    { question: "Who developed the theory of relativity?", answers: ["Albert Einstein", "Isaac Newton", "Stephen Hawking", "Niels Bohr"], correctAnswer: 0 },
    { question: "Who was the first woman to win a Nobel Prize?", answers: ["Marie Curie", "Mother Teresa", "Rosalind Franklin", "Dorothy Hodgkin"], correctAnswer: 0 },
    { question: "Who is credited with inventing the light bulb?", answers: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"], correctAnswer: 0 },
    { question: "Who wrote 'Pride and Prejudice'?", answers: ["Jane Austen", "Charlotte Brontë", "Emily Dickinson", "Louisa May Alcott"], correctAnswer: 0 },
    { question: "Who led India to independence from British rule?", answers: ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose", "Bhagat Singh"], correctAnswer: 0 },
    { question: "Who composed the 'Fifth Symphony'?", answers: ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Franz Schubert"], correctAnswer: 0 },
    { question: "Who was the first African American U.S. president?", answers: ["Barack Obama", "Martin Luther King Jr.", "Colin Powell", "Jesse Jackson"], correctAnswer: 0 },
    { question: "Who discovered gravity after an apple fell?", answers: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Johannes Kepler"], correctAnswer: 0 },
    { question: "Who directed the movie 'Titanic'?", answers: ["James Cameron", "Steven Spielberg", "Christopher Nolan", "Martin Scorsese"], correctAnswer: 0 },
    { question: "Who was the nurse known as the 'Lady with the Lamp'?", answers: ["Florence Nightingale", "Clara Barton", "Mary Seacole", "Edith Cavell"], correctAnswer: 0 },
    { question: "Who founded Microsoft?", answers: ["Bill Gates", "Steve Jobs", "Elon Musk", "Mark Zuckerberg"], correctAnswer: 0 },
    { question: "Who was the first man to fly solo across the Atlantic?", answers: ["Charles Lindbergh", "Amelia Earhart", "Orville Wright", "Howard Hughes"], correctAnswer: 0 },
    { question: "Who sculpted the statue of David?", answers: ["Michelangelo", "Leonardo da Vinci", "Donatello", "Bernini"], correctAnswer: 0 }
];