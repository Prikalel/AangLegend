// Swipe Handler Module for "Legend of Aang, Master of Nations"

// Swipe state variables
let isDragging = false;
let startX = 0;
let currentX = 0;
let cardElement = null;
let cardWidth = 0;
let threshold = 0.5; // 50% of card width to trigger action
let previewThreshold = 30; // 30px to show preview

// Resource preview elements
let resourcePreviews = {
    fire: null,
    water: null,
    earth: null,
    air: null
};

/**
 * Initialize the swipe handler
 */
function initSwipeHandler() {
    console.log('Swipe: Initializing swipe handler');
    
    // Get the card element
    cardElement = document.getElementById('situation-card');
    if (!cardElement) {
        console.error('Swipe: Card element not found');
        return;
    }
    
    // Get card width
    cardWidth = cardElement.offsetWidth;
    
    // Create resource preview elements
    createResourcePreviews();
    
    // Add mouse event listeners
    cardElement.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    // Add touch event listeners
    cardElement.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    
    // Update card width on window resize
    window.addEventListener('resize', () => {
        cardWidth = cardElement.offsetWidth;
    });
}

/**
 * Create resource preview elements
 */
function createResourcePreviews() {
    Object.keys(resourcePreviews).forEach(resource => {
        const resourceSection = document.querySelector(`.${resource}-resource`);
        if (resourceSection) {
            const preview = document.createElement('div');
            preview.className = 'resource-preview';
            preview.id = `${resource}-preview`;
            resourceSection.appendChild(preview);
            resourcePreviews[resource] = preview;
        }
    });
}

/**
 * Handle the start of a swipe (mouse down or touch start)
 * @param {Event} event - Mouse or touch event
 */
function handleStart(event) {
    // Prevent default behavior for touch events
    if (event.type === 'touchstart') {
        event.preventDefault();
    }
    
    // Only allow swiping if there's a current card
    const currentCard = window.gameState.getCurrentCard();
    if (!currentCard) {
        return;
    }
    
    isDragging = true;
    
    // Get starting position
    if (event.type === 'touchstart') {
        startX = event.touches[0].clientX;
    } else {
        startX = event.clientX;
    }
    
    // Add dragging class for visual feedback
    cardElement.classList.add('dragging');
    
    // Reset card position and rotation
    cardElement.style.transition = 'none';
    cardElement.style.transform = 'translateX(0px) rotate(0deg)';
}

/**
 * Handle the movement during a swipe (mouse move or touch move)
 * @param {Event} event - Mouse or touch event
 */
function handleMove(event) {
    if (!isDragging) return;
    
    // Prevent default behavior for touch events
    if (event.type === 'touchmove') {
        event.preventDefault();
    }
    
    // Get current position
    if (event.type === 'touchmove') {
        currentX = event.touches[0].clientX;
    } else {
        currentX = event.clientX;
    }
    
    // Calculate distance from start
    const deltaX = currentX - startX;
    
    // Calculate rotation based on swipe distance
    const rotation = deltaX * 0.1; // Adjust rotation sensitivity
    
    // Apply transformation
    cardElement.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    
    // Show resource preview if threshold is reached
    if (Math.abs(deltaX) > previewThreshold) {
        showResourcePreview(deltaX > 0 ? 'accept' : 'reject');
    } else {
        hideResourcePreview();
    }
}

/**
 * Handle the end of a swipe (mouse up or touch end)
 * @param {Event} event - Mouse or touch event
 */
function handleEnd(event) {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Calculate final distance
    const deltaX = currentX - startX;
    const swipeDirection = deltaX > 0 ? 'right' : 'left';
    const swipeDistance = Math.abs(deltaX);
    
    // Remove dragging class
    cardElement.classList.remove('dragging');
    
    // Add transition for smooth animation
    cardElement.style.transition = 'transform 0.3s ease';
    
    // Check if swipe distance exceeds threshold
    if (swipeDistance > cardWidth * threshold) {
        // Apply the choice based on swipe direction
        const choice = swipeDirection === 'right' ? 'accept' : 'reject';
        
        // Animate card off screen
        const offScreenX = swipeDirection === 'right' ? 
            window.innerWidth : -window.innerWidth;
        cardElement.style.transform = `translateX(${offScreenX}px) rotate(${deltaX * 0.1}deg)`;
        
        // Apply the choice after animation starts
        setTimeout(() => {
            applySwipeChoice(choice);
        }, 100);
    } else {
        // Return card to center
        cardElement.style.transform = 'translateX(0px) rotate(0deg)';
        
        // Hide resource preview
        hideResourcePreview();
    }
}

/**
 * Show resource preview based on choice
 * @param {string} choice - 'accept' or 'reject'
 */
function showResourcePreview(choice) {
    const currentCard = window.gameState.getCurrentCard();
    if (!currentCard) return;
    
    const changes = currentCard[choice];
    
    Object.keys(changes).forEach(resource => {
        const change = changes[resource];
        const preview = resourcePreviews[resource];
        
        if (preview && change !== 0) {
            preview.textContent = change > 0 ? `+${change}` : `${change}`;
            preview.className = `resource-preview ${change > 0 ? 'positive' : 'negative'}`;
            preview.style.display = 'block';
        }
    });
}

/**
 * Hide resource preview
 */
function hideResourcePreview() {
    Object.values(resourcePreviews).forEach(preview => {
        if (preview) {
            preview.style.display = 'none';
        }
    });
}

/**
 * Apply the swipe choice to the game state
 * @param {string} choice - 'accept' or 'reject'
 */
function applySwipeChoice(choice) {
    console.log(`Swipe: Applying choice ${choice}`);
    
    // Hide resource preview
    hideResourcePreview();
    
    // Apply the choice using the existing UI manager function
    window.uiManager.handleCardChoice(choice);
    
    // Reset card position after a longer delay to ensure new card is loaded
    setTimeout(() => {
        cardElement.style.transition = 'none';
        cardElement.style.transform = 'translateX(0px) rotate(0deg)';
    }, 500);
}

/**
 * Reset the swipe handler (e.g., when a new card is displayed)
 */
function resetSwipeHandler() {
    console.log('Swipe: Resetting swipe handler');
    
    // Reset state variables
    isDragging = false;
    startX = 0;
    currentX = 0;
    
    // Reset card position
    if (cardElement) {
        cardElement.style.transition = 'none';
        cardElement.style.transform = 'translateX(0px) rotate(0deg)';
    }
    
    // Hide resource preview
    hideResourcePreview();
}

// Export all functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        initSwipeHandler,
        resetSwipeHandler
    };
} else {
    // Browser environment - attach to window
    window.swipeHandler = {
        initSwipeHandler,
        resetSwipeHandler
    };
}