/*--- START OF FILE index.js ---*/
const loginSection = document.getElementById("login-section");
const quizSection = document.getElementById("quiz-section");
const resultsSection = document.getElementById("results-section");
const timerDisplay = document.getElementById("timer");
const questionDisplay = document.getElementById("question");
const answersDisplay = document.getElementById("answers");
const feedbackDisplay = document.getElementById("feedback");
const nextButton = document.getElementById("next-button");
const scoreDisplay = document.getElementById("score");
const restartButton = document.getElementById("restart-button");
const topicButtons = document.querySelectorAll(".topic-button"); // בוחר את כל כפתורי הנושא

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;
let questions = []; // מערך השאלות יהיה דינמי לפי הנושא

// מערכי שאלות לדוגמה - החלף בשאלות אמיתיות!
const animalsQuestions = [
    { question: "What is the fastest land animal?", answers: ["Cheetah", "Lion", "Horse", "Elephant"], correctAnswer: 0 },
    { question: "Which animal is known as the 'king of the jungle'?", answers: ["Lion", "Tiger", "Elephant", "Giraffe"], correctAnswer: 0 },
    // ... עוד 8 שאלות על חיות
];

const citiesCountriesQuestions = [
    { question: "What is the capital of Japan?", answers: ["Beijing", "Seoul", "Tokyo", "Shanghai"], correctAnswer: 2 },
    { question: "Which country is known as the 'Land of the Rising Sun'?", answers: ["China", "Korea", "Japan", "Vietnam"], correctAnswer: 2 },
    // ... עוד 8 שאלות על ערים ומדינות
];

const historyQuestions = [
    { question: "In which year did World War II end?", answers: ["1943", "1945", "1950", "1939"], correctAnswer: 1 },
    { question: "Who was the first president of the United States?", answers: ["Thomas Jefferson", "John Adams", "George Washington", "Abraham Lincoln"], correctAnswer: 2 },
    // ... עוד 8 שאלות על היסטוריה
];

const notableFiguresQuestions = [
    { question: "Who painted the Mona Lisa?", answers: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], correctAnswer: 1 },
    { question: "Who invented the telephone?", answers: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi"], correctAnswer: 1 },
    // ... עוד 8 שאלות על אישים מפורסמים
];


topicButtons.forEach(button => { // לולאה על כל כפתורי הנושא
    button.addEventListener("click", () => {
        const topic = button.dataset.topic;
        currentQuestionIndex = 0;
        score = 0;
        if (topic === "animals") {
            questions = animalsQuestions;
        } else if (topic === "cities") {
            questions = citiesCountriesQuestions;
        } else if (topic === "history") {
            questions = historyQuestions;
        } else if (topic === "figures") {
            questions = notableFiguresQuestions;
        }
        loginSection.style.display = "none";
        quizSection.style.display = "block";
        loadQuestion();
    });
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
    loginSection.style.display = "block"; // חוזר למסך בחירת הנושא
});

function loadQuestion() {
    resetAnswerButtons();
    feedbackDisplay.textContent = "";
    nextButton.style.display = "none";
    timeLeft = 10;
    timerDisplay.textContent = timeLeft;

    if (questions.length === 0) { // בדיקה למקרה שאין שאלות בנושא
        questionDisplay.textContent = "No questions available for this topic yet.";
        answersDisplay.innerHTML = ""; // מנקה את כפתורי התשובות
        return;
    }

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