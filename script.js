const questions = [
    {
        equation: "? + 7 = 15",
        answer: 8,
        options: [6, 8, 9, 7]
    },
    {
        equation: "12 - ? = 5",
        answer: 7,
        options: [6, 8, 7, 5]
    },
    {
        equation: "3 * ? = 21",
        answer: 7,
        options: [6, 7, 8, 9]
    },
    {
        equation: "? / 4 = 6",
        answer: 24,
        options: [20, 22, 24, 26]
    },
    {
        equation: "10 + ? = 23",
        answer: 13,
        options: [12, 13, 14, 11]
    },
    {
        equation: "? - 9 = 11",
        answer: 20,
        options: [19, 20, 21, 18]
    },
    {
        equation: "5 * ? = 35",
        answer: 7,
        options: [6, 7, 8, 5]
    },
    {
        equation: "40 / ? = 8",
        answer: 5,
        options: [4, 5, 6, 7]
    }
];

let correctAnswers = 0;
let incorrectAnswers = 0;
let answered = false;
let questionsPool = [];
let selectedQuestion = null;
let activeCard = null;

let timer; // Variável para armazenar o intervalo do timer
const MAX_TIME = 120; // 2 minutos em segundos
let timeLeft = MAX_TIME; // Tempo restante em segundos

// Elementos do DOM
const correctScoreDisplay = document.getElementById('correct-score');
const incorrectScoreDisplay = document.getElementById('incorrect-score');
const timerDisplay = document.getElementById('timer'); // Novo elemento para o timer
const feedbackArea = document.getElementById('feedbackArea');
const nextButton = document.getElementById('nextButton');
const restartButton = document.getElementById('restartButton'); // Botão Reiniciar sempre visível

const mysteryCardsContainer = document.getElementById('mysteryCardsContainer');
const allCards = document.querySelectorAll('.card');
const equationTexts = document.querySelectorAll('.equation-text');

const solveButton = document.getElementById('solveButton');

const optionsContainer = document.getElementById('optionsContainer');
const optionButtons = document.querySelectorAll('.option-button');

/**
 * Inicializa o jogo, resetando pontuações e preparando a primeira rodada.
 */
function initializeGame() {
    correctAnswers = 0;
    incorrectAnswers = 0;
    timeLeft = MAX_TIME; // Reseta o tempo
    
    questionsPool = shuffleArray([...questions]);
    
    updateScoreDisplay();
    updateTimerDisplay(); // Atualiza o timer para 02:00
    
    // Inicia o timer
    clearInterval(timer); // Limpa qualquer timer anterior
    timer = setInterval(countdown, 1000); // Inicia um novo timer
    
    // Habilita as interações do jogo (botões e cards)
    enableGameInteractions();

    setupNewRound(); // Configura e inicia a primeira rodada
}

/**
 * Atualiza os valores de acertos e erros na interface do usuário.
 */
function updateScoreDisplay() {
    correctScoreDisplay.textContent = correctAnswers;
    incorrectScoreDisplay.textContent = incorrectAnswers;
}

/**
 * Atualiza o display do timer na interface do usuário.
 */
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft <= 10 && timeLeft > 0) { // Alerta visual quando o tempo está acabando
        timerDisplay.style.color = '#F44336'; // Vermelho
    } else {
        timerDisplay.style.color = '#007bff'; // Azul padrão
    }
}

/**
 * Função de contagem regressiva do timer.
 */
function countdown() {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
        clearInterval(timer); // Para o timer
        endGame(true); // Termina o jogo por tempo esgotado
    }
}

/**
 * Habilita todas as interações do jogo (cards e botões de opção).
 */
function enableGameInteractions() {
    allCards.forEach(card => card.style.pointerEvents = 'auto');
    optionButtons.forEach(button => button.style.pointerEvents = 'auto');
    solveButton.style.pointerEvents = 'auto';
    nextButton.style.pointerEvents = 'auto';
}

/**
 * Desabilita todas as interações do jogo (cards e botões de opção).
 */
function disableGameInteractions() {
    allCards.forEach(card => card.style.pointerEvents = 'none');
    optionButtons.forEach(button => button.style.pointerEvents = 'none');
    solveButton.style.pointerEvents = 'none';
    nextButton.style.pointerEvents = 'none';
}

/**
 * Configura uma nova rodada do jogo, mostrando os cartões misteriosos e escondendo opções/botões.
 */
function setupNewRound() {
    // Se não houver mais perguntas no pool e o tempo não acabou, encerra o jogo por completude
    if (questionsPool.length === 0 && timeLeft > 0) {
        endGame(false); // Fim de jogo normal, não por tempo
        return;
    } else if (timeLeft <= 0) {
        // Se o tempo já acabou, apenas garante que o jogo está desabilitado
        disableGameInteractions();
        return;
    }

    answered = false;
    feedbackArea.textContent = '';
    nextButton.style.display = 'none';
    solveButton.classList.add('hidden');

    optionsContainer.classList.add('hidden');
    optionsContainer.classList.remove('active');
    mysteryCardsContainer.classList.remove('hidden'); // Garante que o container de cards esteja visível

    allCards.forEach((card, index) => {
        card.classList.remove('is-flipped', 'selected-card');
        card.style.display = 'flex';
        card.style.opacity = 1;
        card.style.pointerEvents = 'auto'; // Reabilita cliques nos cards de seleção

        equationTexts[index].textContent = '';
        card.querySelector('.card-inner').style.transform = 'rotateY(0deg)';
    });

    optionButtons.forEach(button => {
        button.classList.remove('correct', 'incorrect');
        button.disabled = false;
        button.textContent = '';
    });

    const questionsForThisSelection = shuffleArray([...questionsPool.slice(0, 4)]);
    
    allCards.forEach((card, index) => {
        if (questionsForThisSelection[index]) {
            const originalIndex = questions.indexOf(questionsForThisSelection[index]);
            card.dataset.questionOriginalIndex = originalIndex;
        } else {
            card.style.display = 'none';
        }
    });

    activeCard = null;
}

/**
 * Lida com o clique em um dos cartões misteriosos.
 */
function handleCardClick(event) {
    // Se o tempo acabou ou a pergunta já foi respondida, não faz nada
    if (timeLeft <= 0 || answered) return;

    const clickedCard = event.currentTarget;
    const questionOriginalIndex = parseInt(clickedCard.dataset.questionOriginalIndex);
    selectedQuestion = questions[questionOriginalIndex];

    if (!selectedQuestion) {
        console.error("Nenhuma pergunta associada a este cartão.");
        return;
    }

    activeCard = clickedCard;

    activeCard.classList.add('is-flipped', 'selected-card');
    const equationTextElement = activeCard.querySelector('.equation-text');
    if (equationTextElement) {
        equationTextElement.textContent = selectedQuestion.equation;
    }

    allCards.forEach(card => {
        if (card !== activeCard) {
            card.style.opacity = 0;
            card.style.pointerEvents = 'none';
        }
    });

    setTimeout(() => {
        solveButton.classList.remove('hidden');
        solveButton.style.pointerEvents = 'auto'; // Habilita o botão Resolver
    }, 600);
}

/**
 * Lida com o clique no botão "Resolver".
 */
function handleSolveClick() {
    // Se o tempo acabou ou a pergunta já foi respondida, não faz nada
    if (timeLeft <= 0 || answered) return;

    solveButton.classList.add('hidden');
    solveButton.style.pointerEvents = 'none'; // Desabilita o botão Resolver

    mysteryCardsContainer.classList.add('hidden');
    optionsContainer.classList.remove('hidden');
    optionsContainer.classList.add('active');

    if (activeCard) {
        activeCard.style.display = 'none';
        activeCard.classList.remove('selected-card');
    }

    loadOptionsForSelectedQuestion();
}

/**
 * Carrega as opções de resposta para a pergunta selecionada nos botões.
 */
function loadOptionsForSelectedQuestion() {
    if (!selectedQuestion) return;

    const shuffledOptions = shuffleArray([...selectedQuestion.options]);

    optionButtons.forEach((button, index) => {
        button.textContent = shuffledOptions[index];
        button.dataset.optionValue = shuffledOptions[index];
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');
        button.style.pointerEvents = 'auto'; // Habilita os botões de opção
    });
}

/**
 * Lida com o clique em uma das opções de resposta.
 */
function handleOptionClick(event) {
    // Se o tempo acabou ou a pergunta já foi respondida, não faz nada
    if (timeLeft <= 0 || answered) return;

    answered = true;
    
    const selectedOption = parseInt(event.target.dataset.optionValue);
    const correctAnswer = selectedQuestion.answer;

    optionButtons.forEach(button => {
        button.disabled = true;
        button.style.pointerEvents = 'none'; // Desabilita o clique nos botões de opção
    });

    if (selectedOption === correctAnswer) {
        feedbackArea.textContent = '✅';
        correctAnswers++;
        event.target.classList.add('correct');
    } else {
        feedbackArea.textContent = '❌';
        incorrectAnswers++;
        event.target.classList.add('incorrect');
        optionButtons.forEach(button => {
            if (parseInt(button.dataset.optionValue) === correctAnswer) {
                button.classList.add('correct');
            }
        });
    }
    updateScoreDisplay();

    const questionIndexInPool = questionsPool.findIndex(q => q === selectedQuestion);
    if (questionIndexInPool > -1) {
        questionsPool.splice(questionIndexInPool, 1);
    }
    
    nextButton.style.display = 'block';
    nextButton.style.pointerEvents = 'auto'; // Habilita o botão Próxima Equação
}

/**
 * Lida com o clique no botão "Próxima Equação".
 */
function handleNextQuestion() {
    // Se o tempo acabou, não faz nada
    if (timeLeft <= 0) return;

    setupNewRound();
}

/**
 * Finaliza o jogo.
 * @param {boolean} timedOut - Verdadeiro se o jogo terminou por tempo esgotado.
 */
function endGame(timedOut) {
    clearInterval(timer); // Para o timer
    disableGameInteractions(); // Desabilita todas as interações
    
    optionsContainer.classList.add('hidden');
    mysteryCardsContainer.classList.add('hidden');
    solveButton.classList.add('hidden');
    nextButton.style.display = 'none'; // Esconde o botão Próxima Equação

    if (timedOut) {
        feedbackArea.textContent = `Tempo esgotado! Você acertou ${correctAnswers} e errou ${incorrectAnswers} de ${questions.length} perguntas.`;
    } else {
        feedbackArea.textContent = `Fim de jogo! Você acertou ${correctAnswers} e errou ${incorrectAnswers} de ${questions.length} perguntas.`;
    }
    
    restartButton.style.display = 'block'; // Garante que o botão Reiniciar esteja visível (já deve estar pelo CSS)
}

// Função auxiliar para embaralhar um array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Event Listeners ---
allCards.forEach(card => {
    card.addEventListener('click', handleCardClick);
});

solveButton.addEventListener('click', handleSolveClick);

optionButtons.forEach(button => {
    button.addEventListener('click', handleOptionClick);
});

nextButton.addEventListener('click', handleNextQuestion);
restartButton.addEventListener('click', initializeGame);

// --- Iniciar o Jogo ---
initializeGame();