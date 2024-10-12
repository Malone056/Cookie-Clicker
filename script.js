// Game Variables
let cookies = 0;
let totalCookies = 0;
let cps = 0;
let clickPower = 1;
let prestigeLevel = 0;
let prestigeMultiplier = 1;
let soundEnabled = true;
let notificationsEnabled = true;
let purchaseAmount = 1; // New variable for purchase amount

// Buildings Data
const buildingsData = [
  { name: 'Cursor', baseCost: 15, cps: 0.1, icon: 'https://via.placeholder.com/60' },
  { name: 'Grandma', baseCost: 100, cps: 1, icon: 'https://via.placeholder.com/60' },
  { name: 'Farm', baseCost: 1100, cps: 8, icon: 'https://via.placeholder.com/60' },
  { name: 'Mine', baseCost: 12000, cps: 47, icon: 'https://via.placeholder.com/60' },
  { name: 'Factory', baseCost: 130000, cps: 260, icon: 'https://via.placeholder.com/60' },
  { name: 'Bank', baseCost: 1400000, cps: 1400, icon: 'https://via.placeholder.com/60' },
  { name: 'Temple', baseCost: 20000000, cps: 7800, icon: 'https://via.placeholder.com/60' },
  { name: 'Wizard Tower', baseCost: 330000000, cps: 44000, icon: 'https://via.placeholder.com/60' },
  // Add more buildings as needed
];
const buildings = {};

// Upgrades Data
const upgradesData = [
  { name: 'Reinforced Index Finger', cost: 100, effect: () => clickPower += 1, icon: 'https://via.placeholder.com/60', purchased: false },
  { name: 'Carpal Tunnel Prevention Cream', cost: 500, effect: () => clickPower += 5, icon: 'https://via.placeholder.com/60', purchased: false },
  { name: 'Ambidextrous', cost: 10000, effect: () => clickPower *= 2, icon: 'https://via.placeholder.com/60', purchased: false },
  // Add more upgrades as needed
];

// Achievements Data
const achievementsData = [
  { name: 'Getting Started', condition: () => totalCookies >= 1, unlocked: false, description: 'Bake 1 cookie.', icon: 'https://via.placeholder.com/50' },
  { name: 'Casual Baker', condition: () => totalCookies >= 1000, unlocked: false, description: 'Bake 1,000 cookies.', icon: 'https://via.placeholder.com/50' },
  { name: 'Cookie Monster', condition: () => totalCookies >= 1000000, unlocked: false, description: 'Bake 1,000,000 cookies.', icon: 'https://via.placeholder.com/50' },
  // Add more achievements as needed
];

// Sound Effects
const clickSound = new Audio(''); // Add your sound file URL
const purchaseSound = new Audio(''); // Add your sound file URL

// Initialize Game
window.onload = () => {
  loadGame();
  initBuildings();
  initUpgrades();
  updateUI();
  setPurchaseAmount(1); // Set default purchase amount
};

// Initialize Buildings
function initBuildings() {
  const buildingsContainer = document.getElementById('buildings');
  buildingsContainer.innerHTML = '';
  buildingsData.forEach((buildingData, index) => {
    const building = {
      ...buildingData,
      owned: 0,
      cost: buildingData.baseCost,
    };
    buildings[buildingData.name] = building;

    // Create Building Element
    const buildingElement = document.createElement('div');
    buildingElement.className = 'building';
    buildingElement.id = `building-${index}`;
    buildingElement.onclick = () => buyBuilding(buildingData.name);

    const buildingIcon = document.createElement('img');
    buildingIcon.src = buildingData.icon;

    const buildingInfo = document.createElement('div');
    buildingInfo.className = 'building-info';

    const buildingName = document.createElement('div');
    buildingName.className = 'building-name';
    buildingName.textContent = buildingData.name;

    const buildingCost = document.createElement('div');
    buildingCost.className = 'building-cost';
    buildingCost.id = `building-cost-${index}`;
    buildingCost.textContent = `Cost: ${formatNumber(building.cost)}`;

    const buildingOwned = document.createElement('div');
    buildingOwned.className = 'building-owned';
    buildingOwned.id = `building-owned-${index}`;
    buildingOwned.textContent = `Owned: ${building.owned}`;

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const progressBarInner = document.createElement('div');
    progressBarInner.className = 'progress-bar-inner';
    progressBarInner.id = `progress-bar-${index}`;

    progressBar.appendChild(progressBarInner);
    buildingInfo.appendChild(buildingName);
    buildingInfo.appendChild(buildingCost);
    buildingInfo.appendChild(buildingOwned);
    buildingInfo.appendChild(progressBar);

    buildingElement.appendChild(buildingIcon);
    buildingElement.appendChild(buildingInfo);

    buildingsContainer.appendChild(buildingElement);
  });
}

// Initialize Upgrades
function initUpgrades() {
  const upgradesContainer = document.getElementById('upgrades');
  upgradesContainer.innerHTML = '';
  upgradesData.forEach((upgrade, index) => {
    if (upgrade.purchased) return;
    const upgradeElement = document.createElement('div');
    upgradeElement.className = 'upgrade';
    upgradeElement.id = `upgrade-${index}`;
    upgradeElement.onclick = () => buyUpgrade(index);

    const upgradeIcon = document.createElement('img');
    upgradeIcon.src = upgrade.icon;

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = `${upgrade.name}\nCost: ${formatNumber(upgrade.cost)}`;

    upgradeElement.appendChild(upgradeIcon);
    upgradeElement.appendChild(tooltip);
    upgradesContainer.appendChild(upgradeElement);
  });
}

// Set Purchase Amount
function setPurchaseAmount(amount) {
  purchaseAmount = amount;
  document.querySelectorAll('.toggle-button').forEach(button => {
    button.classList.remove('active');
  });
  document.getElementById(`toggle-${amount}`).classList.add('active');
  updateUI();
}

// Cookie Click Event
document.getElementById('cookie').addEventListener('click', () => {
  cookies += clickPower * prestigeMultiplier;
  totalCookies += clickPower * prestigeMultiplier;
  playSound(clickSound);
  updateUI();
});

// Buy Building
function buyBuilding(name) {
  const building = buildings[name];
  let quantity = purchaseAmount === 'max' ? calculateMaxAffordable(building) : purchaseAmount;
  const totalCost = calculateTotalCost(building, quantity);

  if (cookies >= totalCost && quantity > 0) {
    cookies -= totalCost;
    building.owned += quantity;
    cps += building.cps * prestigeMultiplier * quantity;
    building.cost = Math.round(building.baseCost * Math.pow(1.15, building.owned));
    playSound(purchaseSound);
    updateUI();
  }
}

// Calculate Total Cost for Purchasing Multiple Buildings
function calculateTotalCost(building, quantity) {
  let totalCost = 0;
  for (let i = 0; i < quantity; i++) {
    totalCost += Math.round(building.baseCost * Math.pow(1.15, building.owned + i));
  }
  return totalCost;
}

// Calculate Max Affordable Buildings
function calculateMaxAffordable(building) {
  let quantity = 0;
  let totalCost = 0;
  while (true) {
    const cost = Math.round(building.baseCost * Math.pow(1.15, building.owned + quantity));
    if (cookies >= totalCost + cost) {
      totalCost += cost;
      quantity++;
    } else {
      break;
    }
  }
  return quantity;
}

// Buy Upgrade
function buyUpgrade(index) {
  const upgrade = upgradesData[index];
  if (cookies >= upgrade.cost && !upgrade.purchased) {
    cookies -= upgrade.cost;
    upgrade.effect();
    upgrade.purchased = true;
    document.getElementById(`upgrade-${index}`).style.display = 'none';
    playSound(purchaseSound);
    updateUI();
  }
}

// Update UI
function updateUI() {
  document.getElementById('counter').textContent = `Cookies: ${formatNumber(cookies)}`;
  document.getElementById('cpsCounter').textContent = `CPS: ${formatNumber(cps)}`;

  // Update Buildings
  buildingsData.forEach((buildingData, index) => {
    const building = buildings[buildingData.name];
    let quantity = purchaseAmount === 'max' ? calculateMaxAffordable(building) : purchaseAmount;
    const totalCost = calculateTotalCost(building, quantity);

    // Update Cost Display with Quantity for Max
    if (purchaseAmount === 'max') {
      document.getElementById(`building-cost-${index}`).textContent = quantity > 0
        ? `Cost: ${formatNumber(totalCost)} (${quantity} units)`
        : `Cost: N/A (0 units)`;
    } else {
      document.getElementById(`building-cost-${index}`).textContent = `Cost: ${formatNumber(totalCost)}`;
    }

    document.getElementById(`building-owned-${index}`).textContent = `Owned: ${building.owned}`;

    const buildingElement = document.getElementById(`building-${index}`);
    if (cookies < totalCost || quantity === 0) {
      buildingElement.classList.add('disabled');
    } else {
      buildingElement.classList.remove('disabled');
    }

    // Update Progress Bar (Shows percentage towards next purchase)
    const progress = totalCost > 0 ? Math.min((cookies / totalCost) * 100, 100) : 0;
    document.getElementById(`progress-bar-${index}`).style.width = `${progress}%`;
  });

  // Update Upgrades
  upgradesData.forEach((upgrade, index) => {
    const upgradeElement = document.getElementById(`upgrade-${index}`);
    if (!upgradeElement) return;
    if (cookies < upgrade.cost || upgrade.purchased) {
      upgradeElement.classList.add('disabled');
      upgradeElement.onclick = null;
    } else {
      upgradeElement.classList.remove('disabled');
      upgradeElement.onclick = () => buyUpgrade(index);
    }
  });

  // Check Achievements
  checkAchievements();
}

// Game Loop
setInterval(() => {
  cookies += cps;
  totalCookies += cps;
  updateUI();
  saveGame();
}, 1000);

// Format Number
function formatNumber(num) {
  if (num >= 1e15) return (num / 1e15).toFixed(2) + ' Qa';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + ' K';
  return num.toFixed(0);
}

// Achievements
function checkAchievements() {
  achievementsData.forEach((achievement, index) => {
    if (!achievement.unlocked && achievement.condition()) {
      achievement.unlocked = true;
      if (notificationsEnabled) {
        alert(`Achievement Unlocked: ${achievement.name}`);
      }
    }
  });
}

function showAchievements() {
  const achievementsList = document.getElementById('achievementsList');
  achievementsList.innerHTML = '';

  achievementsData.forEach(achievement => {
    const div = document.createElement('div');
    div.className = 'achievement ' + (achievement.unlocked ? 'unlocked' : 'locked');

    const icon = document.createElement('img');
    icon.src = achievement.unlocked ? achievement.icon : 'https://via.placeholder.com/50';

    const name = document.createElement('div');
    name.textContent = achievement.unlocked ? achievement.name : '???';
    name.style.fontWeight = 'bold';
    name.style.marginBottom = '5px';

    const desc = document.createElement('div');
    desc.textContent = achievement.unlocked ? achievement.description : '';

    div.appendChild(icon);
    div.appendChild(name);
    div.appendChild(desc);
    achievementsList.appendChild(div);
  });

  document.getElementById('achievementsModal').style.display = 'block';
}

function closeAchievements() {
  document.getElementById('achievementsModal').style.display = 'none';
}

// Prestige System
function prestige() {
  if (confirm('Are you sure you want to reincarnate? You will lose all progress but gain a permanent bonus.')) {
    prestigeLevel += 1;
    prestigeMultiplier += 0.5; // Increase multiplier by 50% each time
    resetGame(false);
  }
}

// Settings
function openSettings() {
  document.getElementById('settingsModal').style.display = 'block';
  document.getElementById('soundToggle').checked = soundEnabled;
  document.getElementById('notificationsToggle').checked = notificationsEnabled;
}

function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
}

function toggleSound() {
  soundEnabled = document.getElementById('soundToggle').checked;
  saveGame();
}

function toggleNotifications() {
  notificationsEnabled = document.getElementById('notificationsToggle').checked;
  saveGame();
}

// Play Sound
function playSound(sound) {
  if (soundEnabled && sound.src) {
    sound.currentTime = 0;
    sound.play();
  }
}

// Reset Game
function resetGame(fullReset = true) {
  if (fullReset && !confirm('Are you sure you want to reset the game?')) {
    return;
  }
  cookies = 0;
  cps = 0;
  clickPower = 1;
  totalCookies = 0;

  for (const buildingName in buildings) {
    const building = buildings[buildingName];
    building.owned = 0;
    building.cost = building.baseCost;
  }

  upgradesData.forEach(upgrade => {
    upgrade.purchased = false;
  });

  achievementsData.forEach(achievement => {
    achievement.unlocked = false;
  });

  initUpgrades();
  updateUI();
  saveGame();
  closeSettings();
}

// Save Game
function saveGame() {
  const gameData = {
    cookies,
    totalCookies,
    cps,
    clickPower,
    prestigeLevel,
    prestigeMultiplier,
    buildings,
    upgradesData,
    achievementsData,
    soundEnabled,
    notificationsEnabled,
  };
  localStorage.setItem('advancedCookieClickerSave', JSON.stringify(gameData));
}

// Load Game
function loadGame() {
  const savedData = JSON.parse(localStorage.getItem('advancedCookieClickerSave'));
  if (savedData) {
    cookies = savedData.cookies;
    totalCookies = savedData.totalCookies;
    cps = savedData.cps;
    clickPower = savedData.clickPower;
    prestigeLevel = savedData.prestigeLevel;
    prestigeMultiplier = savedData.prestigeMultiplier;
    soundEnabled = savedData.soundEnabled;
    notificationsEnabled = savedData.notificationsEnabled;

    Object.assign(buildings, savedData.buildings);

    upgradesData.forEach((upgrade, index) => {
      upgrade.purchased = savedData.upgradesData[index].purchased;
    });

    achievementsData.forEach((achievement, index) => {
      achievement.unlocked = savedData.achievementsData[index].unlocked;
    });
  }
}
