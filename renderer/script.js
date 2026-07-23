// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Легенда об Анге, Повелитель Народов - приложение загружено');
    
    // Get DOM elements
    const loadingScreen = document.getElementById('loading-screen');
    const gameScreen = document.getElementById('game-screen');
    const versionElement = document.getElementById('app-version');
    
    // The game runs entirely in the browser as a static web build.
    versionElement.textContent = 'Версия: 1.0.0 (веб-режим)';
    console.log('Запущено в веб-режиме');
    
    // Simulate loading time and then show the game screen
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        console.log('Игра готова к запуску');
        
        // Initialize the game UI and state
        if (window.uiManager && window.gameState) {
            window.uiManager.initializeUI();
            
            // Initialize the swipe handler after UI is ready
            if (window.swipeHandler) {
                window.swipeHandler.initSwipeHandler();
                console.log('Swipe handler initialized successfully');
            } else {
                console.error('Swipe handler module not loaded');
            }
            
            console.log('Game initialized successfully');
        } else {
            console.error('Game modules not loaded properly');
        }
    }, 1500); // brief loading time
    
    // Basic error handling
    window.addEventListener('error', (event) => {
        console.error('Произошла ошибка в рендерере:', event.error);
    });
});
