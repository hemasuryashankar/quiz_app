let currentQuiz = 0;
let score = 0;
let quizData = [];

const topicSelection = document.getElementById("topic-selection");
const topicDropdown = document.getElementById("topic-dropdown");
const startButton = document.getElementById("start-btn");
const quizContainer = document.getElementById("quiz");
const nextButton = document.getElementById("next-btn");
const resultContainer = document.getElementById("result");
const playAgainButton = document.getElementById("play-again-btn");

// Function to display loading indicator and hide next button
function showLoading() {
  quizContainer.innerHTML = '<div class="loading">Loading...</div>';
  nextButton.classList.add("hidden");
}

// Function to hide loading indicator and show next button
function hideLoading() {
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) {
    loadingElement.remove();
  }
  nextButton.classList.remove("hidden");
}

async function fetchTopics() {
  try {
    const response = await fetch('https://opentdb.com/api_category.php');
    const data = await response.json();
    const categories = data.trivia_categories;

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      topicDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
  }
}

async function fetchQuizData(categoryId) {
  showLoading(); // Show loading indicator and hide next button
  try {
    const response = await fetch(`https://opentdb.com/api.php?amount=5&category=${categoryId}&type=multiple`);
    const data = await response.json();
    quizData = data.results.map((questionItem) => {
      const answerChoices = [...questionItem.incorrect_answers];
      const correctAnswerIndex = Math.floor(Math.random() * (answerChoices.length + 1));
      answerChoices.splice(correctAnswerIndex, 0, questionItem.correct_answer);

      return {
        question: questionItem.question,
        a: answerChoices[0],
        b: answerChoices[1],
        c: answerChoices[2],
        d: answerChoices[3],
        correct: String.fromCharCode(97 + correctAnswerIndex)
      };
    });
    hideLoading(); // Hide loading indicator and show next button
    loadQuiz();
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    hideLoading(); // Ensure next button is hidden if there's an error
  }
}

function loadQuiz() {
  if (quizData.length === 0) return;

  const currentQuizData = quizData[currentQuiz];
  quizContainer.innerHTML = `
    <div>
      <h2>${currentQuizData.question}</h2>
      <label><input type="radio" name="answer" value="a"> ${currentQuizData.a}</label><br>
      <label><input type="radio" name="answer" value="b"> ${currentQuizData.b}</label><br>
      <label><input type="radio" name="answer" value="c"> ${currentQuizData.c}</label><br>
      <label><input type="radio" name="answer" value="d"> ${currentQuizData.d}</label><br>
    </div>
  `;
}

startButton.addEventListener("click", () => {
  const selectedTopic = topicDropdown.value;
  if (selectedTopic) {
    currentQuiz = 0;
    score = 0;
    topicSelection.classList.add("hidden");
    quizContainer.classList.remove("hidden");
    fetchQuizData(selectedTopic);
  } else {
    alert("Please select a topic.");
  }
});

nextButton.addEventListener("click", () => {
  const answer = document.querySelector('input[name="answer"]:checked');
  if (answer && answer.value === quizData[currentQuiz].correct) {
    score++;
  }

  currentQuiz++;
  if (currentQuiz < quizData.length) {
    loadQuiz();
  } else {
    displayResult();
  }
});

function displayResult() {
  quizContainer.classList.add("hidden");
  nextButton.classList.add("hidden");
  resultContainer.innerHTML = `<h2>Your score is ${score}/${quizData.length}</h2>`;
  resultContainer.classList.remove("hidden");
  playAgainButton.classList.remove("hidden");
}

playAgainButton.addEventListener("click", () => {
  topicSelection.classList.remove("hidden");
  quizContainer.classList.add("hidden");
  nextButton.classList.add("hidden");
  resultContainer.classList.add("hidden");
  playAgainButton.classList.add("hidden");
  topicDropdown.selectedIndex = 0;
  quizData = [];
  currentQuiz = 0;
  score = 0;
});

// Fetch available topics on page load
fetchTopics();
