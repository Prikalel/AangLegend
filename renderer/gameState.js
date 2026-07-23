// Game State Module for "Legend of Aang, Master of Nations"

// Game state object
let gameState = {
    resources: {
        fire: 10,
        water: 10,
        earth: 10,
        air: 10
    },
    turn: 0
};

// Current card being displayed
let currentCard = null;

// Game end status
let gameEnded = false;

/**
 * Initialize or reset the game to its initial state
 */
function initGame() {
    gameState = {
        resources: {
            fire: 10,
            water: 10,
            earth: 10,
            air: 10
        },
        turn: 0
    };
    currentCard = null;
    gameEnded = false;
    console.log('Game initialized with starting resources');
    return gameState;
}

/**
 * Get the current game state
 * @returns {Object} Current game state
 */
function getCurrentState() {
    return { ...gameState };
}

/**
 * Update resources based on changes
 * @param {Object} changes - Object with resource changes
 * @param {number} changes.fire - Change to fire resource
 * @param {number} changes.water - Change to water resource
 * @param {number} changes.earth - Change to earth resource
 * @param {number} changes.air - Change to air resource
 */
function updateResources(changes) {
    if (gameEnded) {
        console.warn('Cannot update resources: game has ended');
        return false;
    }

    // Apply changes to each resource
    Object.keys(changes).forEach(resource => {
        if (gameState.resources.hasOwnProperty(resource)) {
            gameState.resources[resource] += changes[resource];
            
            // Ensure resources stay within bounds (0-20)
            gameState.resources[resource] = Math.max(0, Math.min(20, gameState.resources[resource]));
        }
    });

    // Increment turn counter
    gameState.turn++;
    
    console.log('Resources updated:', gameState.resources);
    
    // Check if game has ended after updating resources
    const gameEndStatus = checkGameEnd();
    if (gameEndStatus.ended) {
        console.log('Game ended:', gameEndStatus);
    }
    
    return true;
}

/**
 * Check if the game has ended
 * @returns {Object} Game end status with reason if ended
 */
function checkGameEnd() {
    if (gameEnded) {
        return { ended: true, reason: 'Игра уже окончена', turns: gameState.turn };
    }

    // Check if any resource has reached 0 (defeat)
    const depletedResources = Object.keys(gameState.resources).filter(
        resource => gameState.resources[resource] <= 0
    );
    
    if (depletedResources.length > 0) {
        gameEnded = true;
        
        // Create detailed resource names mapping
        const resourceNames = {
            fire: 'Народ Огня',
            water: 'Племя Воды',
            earth: 'Царство Земли',
            air: 'Кочевники Воздуха'
        };
        
        const depletedNames = depletedResources.map(resource => resourceNames[resource]);
        const resourceList = depletedNames.join(' и ');
        
        // Create specific messages for each depleted resource
        let detailedReason = '';
        if (depletedResources.length === 1) {
            const resource = depletedResources[0];
            const resourceName = resourceNames[resource];
            detailedReason = `Поражение! ${resourceName} полностью вымер (ресурс достиг 0). Баланс народов нарушен!`;
        } else {
            detailedReason = `Поражение! ${resourceList} полностью вымерли (ресурсы достигли 0). Баланс народов нарушен!`;
        }
        
        return {
            ended: true,
            reason: detailedReason,
            victory: false,
            turns: gameState.turn,
            depletedResources: depletedResources
        };
    }

    // Check if all resources have reached 20 (victory)
    const maxedResources = Object.keys(gameState.resources).filter(
        resource => gameState.resources[resource] >= 20
    );
    
    if (maxedResources.length === 4) {
        gameEnded = true;
        return {
            ended: true,
            reason: 'Победа! Все народы достигли процветания (ресурсы достигли лимита 20)! Анг стал Повелителем всех народов и установил гармонию между стихиями!',
            victory: true,
            turns: gameState.turn
        };
    }

    return { ended: false };
}

/**
 * Reset the game to its initial state
 * @returns {Object} New game state
 */
function resetGame() {
    console.log('Resetting game state');
    return initGame();
}

/**
 * Generate a card using only the locally bundled fallback scenarios.
 * The network/LLM text generation has been removed so the game works
 * fully offline as a static web build.
 * @returns {Object} Card object with scenario and choices
 */
function generateCard() {
    const card = window.llmService.generateFallbackScenario();
    currentCard = card;
    return card;
}

/**
 * Show or hide the loading indicator
 * @param {boolean} show - Whether to show the loading indicator
 */
function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const cardContent = document.getElementById('card-content');
    
    if (show) {
        loadingIndicator.classList.remove('hidden');
        cardContent.classList.add('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
        cardContent.classList.remove('hidden');
    }
}

/**
 * Apply the player's choice for the current card
 * @param {string} choice - 'accept' or 'reject'
 * @returns {boolean} True if choice was applied successfully
 */
function applyCardChoice(choice) {
    if (!currentCard) {
        console.error('No current card to apply choice to');
        return false;
    }

    if (gameEnded) {
        console.warn('Cannot apply choice: game has ended');
        return false;
    }

    if (choice !== 'accept' && choice !== 'reject') {
        console.error('Invalid choice. Must be "accept" or "reject"');
        return false;
    }

    const changes = currentCard[choice];
    const success = updateResources(changes);
    
    if (success) {
        console.log(`Applied ${choice} choice:`, changes);
        currentCard = null; // Clear the current card after applying choice
    }

    return success;
}

/**
 * Get the current card being displayed
 * @returns {Object|null} Current card or null if no card
 */
function getCurrentCard() {
    return currentCard ? { ...currentCard } : null;
}

/**
 * Check if a resource value is within valid bounds
 * @param {number} value - Resource value to check
 * @returns {boolean} True if value is within bounds (0-20)
 */
function isResourceValueValid(value) {
    return value >= 0 && value <= 20;
}

/**
 * Get the current game ended status
 * @returns {boolean} True if game has ended
 */
function isGameEnded() {
    return gameEnded;
}

// Export all functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        initGame,
        getCurrentState,
        updateResources,
        checkGameEnd,
        resetGame,
        generateCard,
        applyCardChoice,
        getCurrentCard,
        isResourceValueValid,
        isGameEnded,
        showLoadingIndicator
    };
} else {
    // Browser environment - attach to window
    window.gameState = {
        initGame,
        getCurrentState,
        updateResources,
        checkGameEnd,
        resetGame,
        generateCard,
        applyCardChoice,
        getCurrentCard,
        isResourceValueValid,
        isGameEnded,
        showLoadingIndicator
    };
}