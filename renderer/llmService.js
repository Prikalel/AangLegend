// Scenario Service Module for "Legend of Aang, Master of Nations"
//
// This module previously attempted to generate scenario text via a remote
// LLM API. That network dependency has been removed: the game now uses only
// the locally bundled fallback strings so it works fully offline as a static
// web build (e.g. on GitHub Pages).

/**
 * Generate balanced resource changes for accept and reject choices
 * @returns {Object} Object with accept and reject resource changes
 */
function generateBalancedResourceChanges() {
    const resources = ['fire', 'water', 'earth', 'air'];
    
    // Select 2-4 resources to affect (ensure at least 2 for meaningful choices)
    const numResources = Math.floor(Math.random() * 3) + 2; // 2-4 resources
    const selectedResources = [];
    
    // Randomly select resources
    while (selectedResources.length < numResources) {
        const randomResource = resources[Math.floor(Math.random() * resources.length)];
        if (!selectedResources.includes(randomResource)) {
            selectedResources.push(randomResource);
        }
    }
    
    // Generate changes for accept
    const acceptChanges = {};
    let totalPositive = 0;
    let totalNegative = 0;
    
    selectedResources.forEach(resource => {
        let value;
        // Ensure we have both positive and negative changes
        if (totalPositive === 0 && totalNegative === 0) {
            // First resource: randomly choose positive or negative
            value = Math.random() > 0.5 ?
                Math.floor(Math.random() * 4) + 1 : // 1-4 positive
                -(Math.floor(Math.random() * 4) + 1); // -1 to -4 negative
        } else if (totalPositive === 0) {
            // Need some positive changes
            value = Math.floor(Math.random() * 4) + 1; // 1-4 positive
        } else if (totalNegative === 0) {
            // Need some negative changes
            value = -(Math.floor(Math.random() * 4) + 1); // -1 to -4 negative
        } else {
            // We have both, can be random
            value = Math.floor(Math.random() * 9) - 4; // -4 to 4
        }
        
        acceptChanges[resource] = value;
        
        if (value > 0) {
            totalPositive += value;
        } else {
            totalNegative += Math.abs(value);
        }
    });
    
    // Generate reject changes that balance the accept changes
    const rejectChanges = {};
    let rejectTotalPositive = 0;
    let rejectTotalNegative = 0;
    
    selectedResources.forEach(resource => {
        let value;
        
        // Create opposite choices to make decisions meaningful
        if (acceptChanges[resource] > 0) {
            // Accept gives positive, reject should give negative or smaller positive
            value = Math.random() > 0.7 ?
                -(Math.floor(Math.random() * 3) + 1) : // -1 to -3 negative (30% chance)
                Math.floor(Math.random() * 2); // 0-1 small positive (70% chance)
        } else {
            // Accept gives negative, reject should give positive or smaller negative
            value = Math.random() > 0.7 ?
                Math.floor(Math.random() * 3) + 1 : // 1-3 positive (30% chance)
                -(Math.floor(Math.random() * 2)); // 0 to -2 small negative (70% chance)
        }
        
        rejectChanges[resource] = value;
        
        if (value > 0) {
            rejectTotalPositive += value;
        } else {
            rejectTotalNegative += Math.abs(value);
        }
    });
    
    // Ensure both accept and reject are balanced (sum = 0)
    const acceptSum = Object.values(acceptChanges).reduce((sum, val) => sum + val, 0);
    const rejectSum = Object.values(rejectChanges).reduce((sum, val) => sum + val, 0);
    
    // Adjust if needed
    if (acceptSum !== 0) {
        const firstResource = selectedResources[0];
        acceptChanges[firstResource] -= acceptSum;
    }
    
    if (rejectSum !== 0) {
        const firstResource = selectedResources[0];
        rejectChanges[firstResource] -= rejectSum;
    }
    
    // Ensure all values are within 0-10 range when applied to resources
    const clampValue = (value, resource) => {
        const currentState = window.gameState ? window.gameState.getCurrentState().resources : { fire: 10, water: 10, earth: 10, air: 10 };
        const currentValue = currentState[resource];
        const newValue = currentValue + value;
        
        if (newValue < 0) {
            return -currentValue; // Maximum negative change
        } else if (newValue > 20) {
            return 20 - currentValue; // Maximum positive change
        }
        
        return value;
    };
    
    // Clamp values to valid range
    Object.keys(acceptChanges).forEach(resource => {
        acceptChanges[resource] = clampValue(acceptChanges[resource], resource);
        rejectChanges[resource] = clampValue(rejectChanges[resource], resource);
    });
    
    // Final check: ensure at least one resource has different values between accept and reject
    let hasDifference = false;
    for (const resource of selectedResources) {
        if (acceptChanges[resource] !== rejectChanges[resource]) {
            hasDifference = true;
            break;
        }
    }
    
    // If no difference found, force a difference on the first resource
    if (!hasDifference && selectedResources.length > 0) {
        const firstResource = selectedResources[0];
        if (acceptChanges[firstResource] === 0) {
            acceptChanges[firstResource] = 1;
            rejectChanges[firstResource] = -1;
        } else {
            rejectChanges[firstResource] = -acceptChanges[firstResource];
        }
    }
    
    return {
        accept: acceptChanges,
        reject: rejectChanges
    };
}

// Locally bundled scenario strings used to build each situation card.
const fallbackScenarios = [
    "К вам является посланник народа Воздуха. Он просит помощи в строительстве храма, что укрепит их веру, но потребует дерева из земель народа Земли.",
    "Маги огня предлагают торговое соглашение, которое принесет богатство, но может ослабить ваши связи с племенем воды.",
    "Засуха угрожает южному племени воды. Они просят помощи, что потребует перенаправления ресурсов из царства земли.",
    "Кочевники воздуха обнаружили древний артефакт. Его изучение укрепит духовные силы, но отвлечет от материальных забот.",
    "Шахтеры царства земли находят новые залежи кристаллов. Их разработка укрепит экономику, но может нарушить баланс природы.",
    "Племя воды сталкивается с загадочной болезнью. Лечение требует редких трав, растущих только в землях огня.",
    "Народ огня организует турнир мастеров. Участие укрепит боевой дух, но отвлечет от управления ресурсами.",
    "Царство земли просит помощи в строительстве оборонительных стен. Это усилит защиту, но потребует много ресурсов.",
    "Инженеры Царства Огня разработали прототип боевой машины. Её производство повысит военную мощь, но увеличит расходы на топливо и металлы.",
    "Фермеры Земельского царства жалуются на неурожай. Помощь зерном предотвратит внутренние бунты, но опустосит ваши стратегические запасы.",
    "Таяние ледников угрожает дому Северного Племени Воды. Укрепление защитных стен спасет жителей, но потребует огромных затрат камня.",
    "Флот Огня требует пропуск через нейтральные воды для своей эскадры. Отказ может спровоцировать конфликт, но согласие нарушит ваш нейтралитет.",
    "Духи священного леса проявляют агрессию. Проведение успокоительного обряда восстановит гармонию, но привлечет внимание военных командований.",
    "Купцы Земельного царства предлагают обмен стали на морепродукты. Это разнообразит рацион населения, но ослабит вашу локальную металлургию.",
    "Мастера Воздуха предлагают построить новые гироскопы для связи. Это улучшит логистику между островами, но потребует редких технических деталей.",
    "Знаменитый целитель Племени Воды готов обучить ваших лекарей. Это улучшит здоровье населения, но требует строительства специального целебного дома.",
    "В Царстве Огня отмечается Год Дракона. Участие в праздновании укрепит дипломатические связи, но потребует значительных финансовых вливаний.",
    "Археологи обнаружили древние руины в глубинах Земли. Их расчистка может дать ценные знания о прошлом, но несет высокий риск обвалов.",
    "Группа нелегальных магов-бандитов угрожает торговому каравану. Наем наемников обезопасит пути, но увеличит расходы на содержание войска.",
    "В монастыре Воздуха началась подготовка нового поколения. Это укрепит духовную мощь региона, но на время снизит производительность ремесленников."
];

/**
 * Generate a scenario using only the locally bundled fallback strings
 * @returns {Object} Card object with scenario and choices
 */
function generateFallbackScenario() {
    const randomScenario = fallbackScenarios[Math.floor(Math.random() * fallbackScenarios.length)];
    const resourceChanges = generateBalancedResourceChanges();
    
    return {
        scenario: randomScenario,
        accept: resourceChanges.accept,
        reject: resourceChanges.reject
    };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        generateFallbackScenario,
        generateBalancedResourceChanges
    };
} else {
    // Browser environment - attach to window
    window.llmService = {
        generateFallbackScenario,
        generateBalancedResourceChanges
    };
}
