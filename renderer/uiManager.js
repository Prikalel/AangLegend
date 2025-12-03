// UI Manager Module for "Legend of Aang, Master of Nations"

/**
 * Update the display of resources in the UI
 * @param {Object} resources - Current resources object
 */
function updateResourceDisplay(resources) {
    console.log('UI: Updating resource display', resources);
    
    // Update resource values and add warning classes if needed
    updateResourceWithWarning('fire', resources.fire);
    updateResourceWithWarning('water', resources.water);
    updateResourceWithWarning('earth', resources.earth);
    updateResourceWithWarning('air', resources.air);
    
    // Update progress bars
    document.getElementById('fire-progress').style.width = `${(resources.fire / 20) * 100}%`;
    document.getElementById('water-progress').style.width = `${(resources.water / 20) * 100}%`;
    document.getElementById('earth-progress').style.width = `${(resources.earth / 20) * 100}%`;
    document.getElementById('air-progress').style.width = `${(resources.air / 20) * 100}%`;
}

/**
 * Update a single resource with warning indicators
 * @param {string} resource - Resource name
 * @param {number} value - Resource value
 */
function updateResourceWithWarning(resource, value) {
    const valueElement = document.getElementById(`${resource}-value`);
    const resourceSection = document.querySelector(`.${resource}-resource`);
    
    // Update the value
    valueElement.textContent = value;
    
    // Remove existing warning classes
    resourceSection.classList.remove('critical', 'warning', 'maxed');
    
    // Add appropriate warning class
    if (value <= 3) {
        resourceSection.classList.add('critical');
    } else if (value <= 6) {
        resourceSection.classList.add('warning');
    } else if (value >= 18) {
        resourceSection.classList.add('maxed');
    }
}

/**
 * Display a card in the UI
 * @param {Object} card - Card object with scenario and choices
 */
function displayCard(card) {
    console.log('UI: Displaying card', card);
    
    const cardContent = document.getElementById('card-content');
    
    cardContent.innerHTML = `
        <div class="card-scenario">${card.scenario}</div>
        <div class="card-choices">
            <button id="accept-button" class="choice-button accept-button">Принять</button>
            <button id="reject-button" class="choice-button reject-button">Отклонить</button>
        </div>
    `;
    
    // Add event listeners to the choice buttons
    document.getElementById('accept-button').addEventListener('click', () => handleCardChoice('accept'));
    document.getElementById('reject-button').addEventListener('click', () => handleCardChoice('reject'));
    
    // Update turn counter
    const currentState = window.gameState.getCurrentState();
    updateTurnCounter(currentState.turn + 1); // +1 because turns start from 0 but display from 1
    
    // Reset swipe handler for the new card
    if (window.swipeHandler) {
        window.swipeHandler.resetSwipeHandler();
    }
}

/**
 * Handle the player's choice for the current card
 * @param {string} choice - 'accept' or 'reject'
 */
function handleCardChoice(choice) {
    console.log('UI: Handling card choice', choice);
    
    // Store old resources for animation
    const oldResources = window.gameState.getCurrentState().resources;
    
    // Apply the choice to the game state
    const success = window.gameState.applyCardChoice(choice);
    
    if (success) {
        // Get updated game state
        const currentState = window.gameState.getCurrentState();
        
        // Update turn counter immediately
        updateTurnCounter(currentState.turn);
        
        // Animate resource changes
        animateResourceChanges(oldResources, currentState.resources);
        
        // Update resource display
        updateResourceDisplay(currentState.resources);
        
        // Check if game has ended
        const gameEndStatus = window.gameState.checkGameEnd();
        
        if (gameEndStatus.ended) {
            displayGameEnd(gameEndStatus);
        } else {
            // Generate and display next card using LLM service
            generateAndDisplayNextCard();
        }
    }
}

/**
 * Display the game end screen
 * @param {Object} gameEndStatus - Object with game end information
 */
function displayGameEnd(gameEndStatus) {
    console.log('UI: Displaying game end', gameEndStatus);
    
    // Hide the game interface
    const gameScreen = document.getElementById('game-screen');
    gameScreen.style.display = 'none';
    
    // Get final resource values
    const finalResources = window.gameState.getCurrentState().resources;
    const resourceNames = {
        fire: 'Народ Огня',
        water: 'Племя Воды',
        earth: 'Царство Земли',
        air: 'Кочевники Воздуха'
    };
    
    // Create resource summary HTML
    let resourceSummary = '<div class="final-resources"><h3>Финальное состояние ресурсов:</h3><div class="resource-grid">';
    Object.keys(finalResources).forEach(resource => {
        const value = finalResources[resource];
        const name = resourceNames[resource];
        const statusClass = value <= 0 ? 'critical' : value >= 20 ? 'maxed' : 'normal';
        resourceSummary += `
            <div class="final-resource-item ${statusClass}">
                <span class="resource-name">${name}:</span>
                <span class="resource-value">${value}/20</span>
            </div>
        `;
    });
    resourceSummary += '</div></div>';
    
    // Create game end screen if it doesn't exist
    if (!document.getElementById('game-end-screen')) {
        const container = document.querySelector('.container');
        const endScreen = document.createElement('div');
        endScreen.id = 'game-end-screen';
        endScreen.className = 'game-end-screen';
        
        endScreen.innerHTML = `
            <div class="game-end-content">
                <h2 id="end-title" class="${gameEndStatus.victory ? 'victory' : 'defeat'}">
                    ${gameEndStatus.victory ? 'Победа!' : 'Поражение'}
                </h2>
                <p id="end-message">${gameEndStatus.reason}</p>
                ${resourceSummary}
                <p id="turn-count">Прожито эпох: ${gameEndStatus.turns}</p>
                <button id="reset-button" class="reset-button">Начать заново</button>
            </div>
        `;
        
        container.appendChild(endScreen);
        
        // Add event listener to reset button
        document.getElementById('reset-button').addEventListener('click', () => {
            hideGameEndScreen();
            resetGame();
        });
    } else {
        // Update existing game end screen
        document.getElementById('end-title').className = gameEndStatus.victory ? 'victory' : 'defeat';
        document.getElementById('end-title').textContent = gameEndStatus.victory ? 'Победа!' : 'Поражение';
        document.getElementById('end-message').textContent = gameEndStatus.reason;
        
        // Update resource summary
        const existingSummary = document.querySelector('.final-resources');
        if (existingSummary) {
            existingSummary.remove();
        }
        const gameEndContent = document.querySelector('.game-end-content');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = resourceSummary;
        gameEndContent.insertBefore(tempDiv.firstElementChild, document.getElementById('turn-count'));
        
        document.getElementById('turn-count').textContent = `Прожито эпох: ${gameEndStatus.turns}`;
        document.getElementById('game-end-screen').style.display = 'flex';
    }
    
    // Add fade-in animation
    setTimeout(() => {
        document.getElementById('game-end-screen').classList.add('fade-in');
    }, 100);
}

/**
 * Hide the game end screen
 */
function hideGameEndScreen() {
    const endScreen = document.getElementById('game-end-screen');
    if (endScreen) {
        endScreen.classList.remove('fade-in');
        endScreen.classList.add('fade-out');
        
        setTimeout(() => {
            endScreen.style.display = 'none';
            endScreen.classList.remove('fade-out');
        }, 500);
    }
    
    // Show the game interface
    const gameScreen = document.getElementById('game-screen');
    gameScreen.style.display = 'flex';
}

/**
 * Initialize the game UI
 */
function initializeUI() {
    console.log('UI: Initializing game interface');
    
    // Initialize the game state
    window.gameState.initGame();
    
    // Get initial game state
    const initialState = window.gameState.getCurrentState();
    
    // Update resource display
    updateResourceDisplay(initialState.resources);
    
    // Generate and display first card using LLM service
    generateAndDisplayFirstCard();
}

/**
 * Reset the game and UI
 */
function resetGame() {
    console.log('UI: Resetting game');
    
    // Reset game state
    window.gameState.initGame();
    
    // Get new game state
    const newState = window.gameState.getCurrentState();
    
    // Update resource display
    updateResourceDisplay(newState.resources);
    
    // Reset turn counter to 1 (display starts from 1, but game state starts from 0)
    updateTurnCounter(1);
    
    // Hide game end screen if visible
    // document.getElementById('game-end-screen').classList.add('hidden');
    
    // Generate and display first card using LLM service
    generateAndDisplayFirstCard();
}

/**
 * Update the turn counter display
 * @param {number} turn - Current turn number
 */
function updateTurnCounter(turn) {
    console.log('UI: Updating turn counter', turn);
    
    // Update the turn counter display
    const turnCounterElement = document.getElementById('turn-counter');
    if (turnCounterElement) {
        turnCounterElement.textContent = turn;
    }
}

/**
 * Show a notification or message to the player
 * @param {string} message - Message to display
 * @param {string} type - Type of message (info, warning, error, success)
 */
function showMessage(message, type = 'info') {
    console.log(`UI: ${type.toUpperCase()} - ${message}`);
    
    // This function will be implemented to show messages to the player
    // For now, it just logs the message
    
    // Example implementation (to be replaced with actual UI code):
    // const messageElement = document.getElementById('game-message');
    // messageElement.textContent = message;
    // messageElement.className = `message ${type}`;
    // messageElement.classList.remove('hidden');
    
    // Auto-hide after a few seconds
    // setTimeout(() => {
    //     messageElement.classList.add('hidden');
    // }, 3000);
}

/**
 * Animate resource changes
 * @param {Object} oldResources - Previous resource values
 * @param {Object} newResources - New resource values
 */
function animateResourceChanges(oldResources, newResources) {
    console.log('UI: Animating resource changes', { old: oldResources, new: newResources });
    
    Object.keys(newResources).forEach(resource => {
        const oldValue = oldResources[resource];
        const newValue = newResources[resource];
        const change = newValue - oldValue;
        
        if (change !== 0) {
            const resourceSection = document.querySelector(`.${resource}-resource`);
            
            // Add animation class based on change direction
            if (change > 0) {
                resourceSection.classList.add('resource-increase');
            } else {
                resourceSection.classList.add('resource-decrease');
            }
            
            // Remove animation class after animation completes
            setTimeout(() => {
                resourceSection.classList.remove('resource-increase', 'resource-decrease');
            }, 1000);
        }
    });
}

// Export all functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        updateResourceDisplay,
        displayCard,
        handleCardChoice,
        displayGameEnd,
        hideGameEndScreen,
        initializeUI,
        resetGame,
        updateTurnCounter,
        showMessage,
        animateResourceChanges,
        generateAndDisplayFirstCard,
        generateAndDisplayNextCard
    };
} else {
    // Browser environment - attach to window
    window.uiManager = {
        updateResourceDisplay,
        displayCard,
        handleCardChoice,
        displayGameEnd,
        hideGameEndScreen,
        initializeUI,
        resetGame,
        updateTurnCounter,
        showMessage,
        animateResourceChanges,
        generateAndDisplayFirstCard,
        generateAndDisplayNextCard
    };
}

/**
 * Generate and display the first card using LLM service
 */
async function generateAndDisplayFirstCard() {
    try {
        const firstCard = await window.gameState.generateCard();
        displayCard(firstCard);
    } catch (error) {
        console.error('Error generating first card:', error);
        // Fallback to local generation
        const fallbackCard = window.gameState.generateRandomCard();
        displayCard(fallbackCard);
    }
}

/**
 * Generate and display the next card using LLM service
 */
async function generateAndDisplayNextCard() {
    try {
        // Clear current card content immediately to show loading
        const cardContent = document.getElementById('card-content');
        if (cardContent) {
            cardContent.innerHTML = '<div class="loading-placeholder">Генерация следующей ситуации...</div>';
        }
        
        const nextCard = await window.gameState.generateCard();
        displayCard(nextCard);
    } catch (error) {
        console.error('Error generating next card:', error);
        // Fallback to local generation
        const fallbackCard = window.gameState.generateRandomCard();
        displayCard(fallbackCard);
    }
}