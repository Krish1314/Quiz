// script.js
document.addEventListener('DOMContentLoaded', () => {
    const questionsContainer = document.getElementById('questionsContainer');
    const quizNavigation = document.getElementById('quizNavigation').querySelector('.btn-group-vertical');
    const prevQuestionBtn = document.getElementById('prevQuestionBtn');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const timeDisplay = document.getElementById('timeDisplay');
    const finishAttemptBtn = document.getElementById('finishAttemptBtn'); // New: Get the Finish Attempt button
    const resultsPanel = document.getElementById('resultsPanel');
    const scoreValue = document.getElementById('scoreValue');
    const totalQuestionsEl = document.getElementById('totalQuestions');
    const resultsDetails = document.getElementById('resultsDetails');
    const retakeBtn = document.getElementById('retakeBtn');

    let currentQuestionIndex = 0;
    let allQuestions = [];
    let questionElements = [];

    const quizDurationSeconds = 600; // Example: 10 minutes (600 seconds)
    let timeLeft = quizDurationSeconds;
    let timerInterval;

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function startTimer() {
        timeDisplay.textContent = formatTime(timeLeft);

        timerInterval = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = formatTime(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timeDisplay.textContent = 'Time\'s Up!';
                alert('Time\'s up! Your quiz attempt has ended.');
                disableQuizInteraction();
                // Optional: Automatically redirect after time up
                // window.location.href = '/Home Page (Student)/Index.html';
            }
        }, 1000);
    }

    function disableQuizInteraction() {
        document.querySelectorAll('#questionsContainer input[type="radio"]').forEach(radio => {
            radio.disabled = true;
        });
        prevQuestionBtn.disabled = true;
        nextQuestionBtn.disabled = true;
        finishAttemptBtn.disabled = true; // Disable finish button too
    }

    function showQuestion(index) {
        questionElements.forEach((qEl, idx) => {
            qEl.style.display = (idx === index) ? 'block' : 'none';
        });
        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        prevQuestionBtn.disabled = (currentQuestionIndex === 0 || timeLeft <= 0);
        nextQuestionBtn.disabled = (currentQuestionIndex === allQuestions.length - 1 || timeLeft <= 0);

        Array.from(quizNavigation.children).forEach((btn, idx) => {
            if (idx === currentQuestionIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Event listener for Previous button
    prevQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    });

    // Event listener for Next button
    nextQuestionBtn.addEventListener('click', () => {
        if (currentQuestionIndex < allQuestions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        }
    });

    function calculateScoreAndShowResults() {
        // Build a map of questionId -> correctAnswer by reading from the DOM where we stored q data
        let score = 0;
        const total = allQuestions.length;
        const details = [];

        allQuestions.forEach((q) => {
            const selected = document.querySelector(`input[name="question_${q.id}"]:checked`);
            const selectedValue = selected ? selected.value : null;
            const isCorrect = selectedValue === q.correctAnswer;
            if (isCorrect) score++;
            details.push(`<div>Q${q.id}: ${isCorrect ? 'Correct' : 'Wrong'}${selectedValue ? ` (Your answer: ${selectedValue})` : ' (No answer)'}</div>`);
        });

        scoreValue.textContent = String(score);
        totalQuestionsEl.textContent = String(total);
        resultsDetails.innerHTML = details.join('');

        // Hide quiz UI and show results
        document.getElementById('questionsWrapper').style.display = 'none';
        resultsPanel.style.display = 'block';

        if (timerInterval) clearInterval(timerInterval);
    }

    // Event listener for Finish Attempt button
    finishAttemptBtn.addEventListener('click', () => {
        const confirmFinish = confirm('Are you sure you want to finish the attempt?');
        if (confirmFinish) {
            calculateScoreAndShowResults();
        }
    });

    // Retake: reset page state
    if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // Fetch questions logic... (remains largely the same as before)
    fetch('http://localhost:3000/questions')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(questions => {
            // Support both { questions: [...] } and [...] payloads
            allQuestions = Array.isArray(questions) ? questions : (questions.questions || []);
            questionsContainer.innerHTML = '';

            if (allQuestions.length === 0) {
                questionsContainer.innerHTML = '<div class="alert alert-warning" role="alert">No questions found.</div>';
                prevQuestionBtn.style.display = 'none';
                nextQuestionBtn.style.display = 'none';
                finishAttemptBtn.style.display = 'none'; // Hide if no questions
                return;
            }

            allQuestions.forEach((q, index) => {
                const questionPanel = document.createElement('div');
                questionPanel.classList.add('panel', 'panel-default', 'question-card');
                questionPanel.setAttribute('data-question-id', q.id);
                questionPanel.style.display = 'none';

                const panelHeading = document.createElement('div');
                panelHeading.classList.add('panel-heading');
                panelHeading.textContent = `Question ${q.id}`;

                const panelBody = document.createElement('div');
                panelBody.classList.add('panel-body');

                const questionText = document.createElement('h4');
                questionText.textContent = q.question;
                panelBody.appendChild(questionText);

                const form = document.createElement('form');

                q.options.forEach((option, optionIndex) => {
                    const radioDiv = document.createElement('div');
                    radioDiv.classList.add('radio');

                    const label = document.createElement('label');
                    const input = document.createElement('input');
                    input.setAttribute('type', 'radio');
                    input.setAttribute('name', `question_${q.id}`);
                    input.setAttribute('value', option);

                    label.appendChild(input);
                    label.appendChild(document.createTextNode(option));
                    radioDiv.appendChild(label);
                    form.appendChild(radioDiv);
                });

                panelBody.appendChild(form);

                questionPanel.appendChild(panelHeading);
                questionPanel.appendChild(panelBody);
                questionsContainer.appendChild(questionPanel);
                questionElements.push(questionPanel);

                const navButton = document.createElement('button');
                navButton.setAttribute('type', 'button');
                navButton.classList.add('btn', 'btn-default');
                navButton.textContent = q.id;
                navButton.addEventListener('click', () => {
                    currentQuestionIndex = index;
                    showQuestion(currentQuestionIndex);
                });
                quizNavigation.appendChild(navButton);
            });

            showQuestion(currentQuestionIndex);
            startTimer();

        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            questionsContainer.innerHTML = '<div class="alert alert-danger" role="alert">Failed to load quiz questions. Please try again later.</div>';
            prevQuestionBtn.style.display = 'none';
            nextQuestionBtn.style.display = 'none';
            finishAttemptBtn.style.display = 'none'; // Hide if no questions
            if (timerInterval) clearInterval(timerInterval);
            timeDisplay.parentNode.style.display = 'none';
        });
});
