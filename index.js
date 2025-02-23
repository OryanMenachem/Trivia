const password = "password123"; // Set your password here
const loginSection = document.getElementById("login-section");
const quizSection = document.getElementById("quiz-section");
const resultsSection = document.getElementById("results-section");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const loginError = document.getElementById("login-error");
const timerDisplay = document.getElementById("timer");
const questionDisplay = document.getElementById("question");
const answersDisplay = document.getElementById("answers");
const feedbackDisplay = document.getElementById("feedback");
const nextButton = document.getElementById("next-button");
const scoreDisplay = document.getElementById("score");
const restartButton = document.getElementById("restart-button");

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;
let questions = [
    {
        question: "What is the capital of France?",
        answers: ["Berlin", "Madrid", "Paris", "Rome"],
        correctAnswer: 2
    },
    {
        question: "What is 2 + 2?",
        answers: ["3", "4", "5", "6"],
        correctAnswer: 1
    },
    {
        question: "What year did the Titanic sink?",
        answers: ["1912", "1920", "1905", "1931"],
        correctAnswer: 0
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1
    },
    {
        question: "What is the largest mammal in the world?",
        answers: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
        correctAnswer: 1
    },
    {
        question: "Who painted the Mona Lisa?",
        answers: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
        correctAnswer: 1
    },
    {
        question: "What is the chemical symbol for gold?",
        answers: ["Ag", "Fe", "Au", "Cu"],
        correctAnswer: 2
    },
    {
        question: "Which country is known as the Land of the Rising Sun?",
        answers: ["China", "South Korea", "Japan", "Vietnam"],
        correctAnswer: 2
    },
    {
        question: "What is the speed of light?",
        answers: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"],
        correctAnswer: 0
    },
    {
        question: "What is the capital of Australia?",
        answers: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        correctAnswer: 2
    }
];

loginButton.addEventListener("click", () => {
    if (passwordInput.value === password) {
        loginSection.style.display = "none";
        quizSection.style.display = "block";
        loadQuestion();
    } else {
        loginError.textContent = "Incorrect password";
    }
});

nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
});

restartButton.addEventListener("click", () => {
    currentQuestionIndex = 0;
    score = 0;
    resultsSection.style.display = "none";
    loginSection.style.display = "block";
    loginError.textContent = "";
    passwordInput.value = "";
});

function loadQuestion() {
    resetAnswerButtons();
    feedbackDisplay.textContent = "";
    nextButton.style.display = "none";
    timeLeft = 10;
    timerDisplay.textContent = timeLeft;

    let question = questions[currentQuestionIndex];
    questionDisplay.textContent = question.question;

    for (let i = 0; i < answersDisplay.children.length; i++) {
        answersDisplay.children[i].textContent = question.answers[i];
        answersDisplay.children[i].addEventListener("click", selectAnswer);
    }

    startTimer();
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            showCorrectAnswer();
            feedbackDisplay.textContent = "Time's up!";
            nextButton.style.display = "block";
            disableAnswerButtons();
        }
    }, 1000);
}

function selectAnswer(e) {
    clearInterval(timer);
    disableAnswerButtons();
    let selectedButton = e.target;
    let selectedAnswerIndex = parseInt(selectedButton.dataset.index);

    if (selectedAnswerIndex === questions[currentQuestionIndex].correctAnswer) {
        selectedButton.classList.add("correct");
        feedbackDisplay.textContent = "Correct!";
        score++;
    } else {
        selectedButton.classList.add("incorrect");
        feedbackDisplay.textContent = "Incorrect!";
        showCorrectAnswer();
    }

    nextButton.style.display = "block";
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
}