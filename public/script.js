const gameBoard = document.getElementById('game-board');
const status = document.getElementById('status');
const message = document.getElementById('message');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const difficultySelect = document.getElementById('difficulty');
const themeBtn = document.getElementById('theme');
const powerupBtn = document.getElementById('powerup');
let cards = [], flippedCards = [], matchedPairs = 0, totalPairs = 0, clicks = 0, timeLeft = 0, timer, consecutiveMatches = 0;
let isFlipping = false, gameActive = false, isDarkMode = false;

async function fetchPokemon(count) {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1500');
    const data = await response.json();
    const pokemonList = data.results;
    const shuffled = pokemonList.sort(() => 0.5 - Math.random()).slice(0, count);
    const pokemonData = await Promise.all(shuffled.map(async p => {
        const res = await fetch(p.url);
        const data = await res.json();
        return { id: data.id, name: data.name, image: data.sprites.other['official-artwork'].front_default };
    }));
    return pokemonData;
}

function createCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = pokemon.id;
    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front"><img src="${pokemon.image}" alt="${pokemon.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
            <div class="card-back"></div>
        </div>`;
    card.addEventListener('click', () => flipCard(card));
    return card;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function startGame() {
    gameBoard.innerHTML = '';
    message.textContent = '';
    clicks = 0;
    matchedPairs = 0;
    flippedCards = [];
    consecutiveMatches = 0;
    powerupBtn.disabled = true;
    gameActive = true;
    const difficulty = difficultySelect.value;
    totalPairs = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
    timeLeft = difficulty === 'easy' ? 60 : difficulty === 'medium' ? 90 : 120;
    const pokemon = await fetchPokemon(totalPairs);
    const cardPairs = [...pokemon, ...pokemon].map(p => createCard(p));
    cards = shuffle(cardPairs);
    cards.forEach(card => gameBoard.appendChild(card));
    updateStatus();
    startTimer();
}

function flipCard(card) {
    if (!gameActive || isFlipping || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    flippedCards.push(card);
    clicks++;
    updateStatus();
    if (flippedCards.length === 2) {
        isFlipping = true;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.id === card2.dataset.id) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        consecutiveMatches++;
        if (consecutiveMatches >= 2) powerupBtn.disabled = false;
        if (matchedPairs === totalPairs) {
            gameActive = false;
            clearInterval(timer);
            message.textContent = 'You Win!';
        }
        flippedCards = [];
        isFlipping = false;
    } else {
        consecutiveMatches = 0;
        powerupBtn.disabled = true;
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isFlipping = false;
        }, 800);
    }
    updateStatus();
}

function updateStatus() {
    status.textContent = `Clicks: ${clicks} | Pairs Matched: ${matchedPairs} | Pairs Left: ${totalPairs - matchedPairs} | Total Pairs: ${totalPairs} | Time: ${timeLeft}s`;
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        updateStatus();
        if (timeLeft <= 0 && matchedPairs < totalPairs) {
            gameActive = false;
            clearInterval(timer);
            message.textContent = 'Game Over!';
        }
    }, 1000);
}

function resetGame() {
    gameBoard.innerHTML = '';
    message.textContent = '';
    clicks = 0;
    matchedPairs = 0;
    totalPairs = 0;
    timeLeft = 0;
    flippedCards = [];
    consecutiveMatches = 0;
    powerupBtn.disabled = true;
    gameActive = false;
    clearInterval(timer);
    updateStatus();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark');
    themeBtn.textContent = isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    localStorage.setItem('darkMode', isDarkMode);
}

function triggerPowerUp() {
    if (!gameActive || powerupBtn.disabled) return;
    cards.forEach(card => {
        if (!card.classList.contains('matched')) card.classList.add('flipped');
    });
    setTimeout(() => {
        cards.forEach(card => {
            if (!card.classList.contains('matched')) card.classList.remove('flipped');
        });
        powerupBtn.disabled = true;
    }, 3000);
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
themeBtn.addEventListener('click', toggleTheme);
powerupBtn.addEventListener('click', triggerPowerUp);

if (localStorage.getItem('darkMode') === 'true') {
    isDarkMode = true;
    document.body.classList.add('dark');
    themeBtn.textContent = 'Toggle Light Mode';
}