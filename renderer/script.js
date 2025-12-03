// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Легенда об Анге, Повелитель Народов - приложение загружено');
    
    // Get DOM elements
    const loadingScreen = document.getElementById('loading-screen');
    const gameScreen = document.getElementById('game-screen');
    const versionElement = document.getElementById('app-version');
    
    // Check if we're running in Electron
    if (window.electronAPI) {
        // Get app version from the exposed API
        const version = window.electronAPI.getVersion();
        versionElement.textContent = `Версия: ${version}`;
        
        console.log('Electron API доступен, версия приложения:', version);
    } else {
        versionElement.textContent = 'Версия: 1.0.0 (веб-режим)';
        console.log('Запущено в веб-режиме');
    }
    
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
        
        // Example of using the exposed API to send a message to the main process
        if (window.electronAPI) {
            window.electronAPI.sendMessage('message-from-renderer', {
                type: 'game-loaded',
                timestamp: new Date().toISOString()
            });
        }
    }, 2000); // 2 seconds loading time
    
    // Example of listening for messages from the main process
    if (window.electronAPI) {
        window.electronAPI.onMessage('message-from-main', (data) => {
            console.log('Получено сообщение от основного процесса:', data);
        });
    }
    
    // Basic error handling
    window.addEventListener('error', (event) => {
        console.error('Произошла ошибка в рендерере:', event.error);
    });
    
    // Initialize the game when the game screen is shown
    // Note: This is now handled in the setTimeout above to ensure proper initialization order
});