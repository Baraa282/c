// Quran App - Main JavaScript File

// Global variables
let currentSurah = null;
let currentAyah = null;
let currentReciter = 'ar.alafasy'; // Default reciter
let currentTranslation = 'en.sahih'; // Default translation
let audioPlayer = null;
let isPlaying = false;

// Quran API endpoints
const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
const RECITERS = [
    { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
    { id: 'ar.abdul_basit', name: 'Abdul Basit Abdul Samad' },
    { id: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman As-Sudais' },
    { id: 'ar.ahmedalhuthayfi', name: 'Ahmed Al-Huthayfi' },
    { id: 'ar.aliabdurrahmanalhuthayfi', name: 'Ali Abdur-Rahman Al-Huthayfi' }
];

const TRANSLATIONS = [
    { id: 'en.sahih', name: 'English - Sahih International' },
    { id: 'en.pickthall', name: 'English - Pickthall' },
    { id: 'en.yusufali', name: 'English - Yusuf Ali' },
    { id: 'en.hilali', name: 'English - Hilali & Khan' },
    { id: 'ur.jalandhry', name: 'Urdu - Jalandhry' },
    { id: 'tr.diyanet', name: 'Turkish - Diyanet' }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize hamburger menu
    initializeHamburgerMenu();
    
    // Initialize menu functionality
    initializeMenuFunctionality();
    
    // Initialize audio player
    initializeAudioPlayer();
    
    // Load default content
    loadWelcomeContent();
}

// Hamburger Menu Functionality
function initializeHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const closeMenu = document.getElementById('closeMenu');
    
    // Open menu
    hamburgerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        hamburgerMenu.classList.add('open');
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.id = 'menuOverlay';
        document.body.appendChild(overlay);
        
        // Show overlay
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    });
    
    // Close menu
    function closeHamburgerMenu() {
        hamburgerMenu.classList.remove('open');
        
        // Hide and remove overlay
        const overlay = document.getElementById('menuOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
    
    // Close menu when clicking close button
    closeMenu.addEventListener('click', closeHamburgerMenu);
    
    // Close menu when clicking overlay
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('menu-overlay')) {
            closeHamburgerMenu();
        }
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && hamburgerMenu.classList.contains('open')) {
            closeHamburgerMenu();
        }
    });
}

// Initialize Menu Functionality
function initializeMenuFunctionality() {
    // Select Surah
    document.getElementById('selectSurah').addEventListener('click', function(e) {
        e.preventDefault();
        showSurahSelection();
    });
    
    // Select Ayah
    document.getElementById('selectAyah').addEventListener('click', function(e) {
        e.preventDefault();
        if (currentSurah) {
            showAyahSelection(currentSurah);
        } else {
            alert('Please select a Surah first');
        }
    });
    
    // Select Reciter
    document.getElementById('selectReciter').addEventListener('click', function(e) {
        e.preventDefault();
        showReciterSelection();
    });
    
    // Select Transliteration
    document.getElementById('selectTransliteration').addEventListener('click', function(e) {
        e.preventDefault();
        showTranslationSelection();
    });
    
    // Dark Mode
    document.getElementById('darkMode').addEventListener('click', function(e) {
        e.preventDefault();
        toggleDarkMode();
    });
    
    // Font Size
    document.getElementById('fontSize').addEventListener('click', function(e) {
        e.preventDefault();
        showFontSizeSelection();
    });
    
    // Arabic Font
    document.getElementById('arabicFont').addEventListener('click', function(e) {
        e.preventDefault();
        showArabicFontSelection();
    });
    
    // About
    document.getElementById('about').addEventListener('click', function(e) {
        e.preventDefault();
        showAbout();
    });
}

// Show Surah Selection Modal
async function showSurahSelection() {
    try {
        const response = await fetch(`${QURAN_API_BASE}/surah`);
        const data = await response.json();
        
        if (data.code === 200) {
            const surahs = data.data;
            createSelectionModal('Select Surah', surahs.map(surah => ({
                id: surah.number,
                name: `${surah.number}. ${surah.englishName} (${surah.englishNameTranslation})`,
                arabicName: surah.name
            })), (selectedSurah) => {
                loadSurah(selectedSurah.id);
            });
        }
    } catch (error) {
        console.error('Error fetching surahs:', error);
        alert('Error loading surahs. Please try again.');
    }
}

// Show Ayah Selection Modal
async function showAyahSelection(surahNumber) {
    try {
        const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}`);
        const data = await response.json();
        
        if (data.code === 200) {
            const surah = data.data;
            const ayahs = surah.ayahs.map(ayah => ({
                id: ayah.numberInSurah,
                name: `Ayah ${ayah.numberInSurah}`,
                text: ayah.text
            }));
            
            createSelectionModal('Select Ayah', ayahs, (selectedAyah) => {
                loadAyah(surahNumber, selectedAyah.id);
            });
        }
    } catch (error) {
        console.error('Error fetching ayahs:', error);
        alert('Error loading ayahs. Please try again.');
    }
}

// Show Reciter Selection Modal
function showReciterSelection() {
    createSelectionModal('Select Reciter', RECITERS, (selectedReciter) => {
        currentReciter = selectedReciter.id;
        if (currentSurah && currentAyah) {
            loadAyah(currentSurah, currentAyah);
        }
        alert(`Reciter changed to: ${selectedReciter.name}`);
    });
}

// Show Translation Selection Modal
function showTranslationSelection() {
    createSelectionModal('Select Translation', TRANSLATIONS, (selectedTranslation) => {
        currentTranslation = selectedTranslation.id;
        if (currentSurah && currentAyah) {
            loadAyah(currentSurah, currentAyah);
        }
        alert(`Translation changed to: ${selectedTranslation.name}`);
    });
}

// Create Selection Modal
function createSelectionModal(title, items, onSelect) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.selection-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'selection-modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    const titleElement = document.createElement('h2');
    titleElement.className = 'modal-title';
    titleElement.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-modal';
    closeBtn.innerHTML = '<i class="fa fa-times"></i>';
    closeBtn.onclick = () => modal.remove();
    
    header.appendChild(titleElement);
    header.appendChild(closeBtn);
    
    const list = document.createElement('ul');
    list.className = 'selection-list';
    
    items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#">${item.name}</a>`;
        li.onclick = () => {
            onSelect(item);
            modal.remove();
        };
        list.appendChild(li);
    });
    
    modalContent.appendChild(header);
    modalContent.appendChild(list);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Load Surah
async function loadSurah(surahNumber) {
    try {
        const [surahResponse, translationResponse] = await Promise.all([
            fetch(`${QURAN_API_BASE}/surah/${surahNumber}`),
            fetch(`${QURAN_API_BASE}/surah/${surahNumber}/${currentTranslation}`)
        ]);
        
        const surahData = await surahResponse.json();
        const translationData = await translationResponse.json();
        
        if (surahData.code === 200 && translationData.code === 200) {
            currentSurah = surahNumber;
            currentAyah = null;
            
            displaySurah(surahData.data, translationData.data);
        }
    } catch (error) {
        console.error('Error loading surah:', error);
        alert('Error loading surah. Please try again.');
    }
}

// Load Specific Ayah
async function loadAyah(surahNumber, ayahNumber) {
    try {
        const [ayahResponse, translationResponse] = await Promise.all([
            fetch(`${QURAN_API_BASE}/ayah/${surahNumber}:${ayahNumber}`),
            fetch(`${QURAN_API_BASE}/ayah/${surahNumber}:${ayahNumber}/${currentTranslation}`)
        ]);
        
        const ayahData = await ayahResponse.json();
        const translationData = await translationResponse.json();
        
        if (ayahData.code === 200 && translationData.code === 200) {
            currentSurah = surahNumber;
            currentAyah = ayahNumber;
            
            displayAyah(ayahData.data, translationData.data);
        }
    } catch (error) {
        console.error('Error loading ayah:', error);
        alert('Error loading ayah. Please try again.');
    }
}

// Display Surah
function displaySurah(surah, translation) {
    const surahInfo = document.getElementById('surahInfo');
    const quranText = document.getElementById('quranText');
    
    surahInfo.innerHTML = `
        <h1 class="surah-title">${surah.name}</h1>
        <p class="surah-subtitle">${surah.englishName} - ${surah.englishNameTranslation}</p>
        <p class="surah-subtitle">${surah.revelationType} • ${surah.numberOfAyahs} Ayahs</p>
    `;
    
    let arabicText = '';
    let translationText = '';
    
    surah.ayahs.forEach((ayah, index) => {
        arabicText += `<span class="ayah-number">${ayah.numberInSurah}.</span> ${ayah.text} `;
        translationText += `<span class="ayah-number">${ayah.numberInSurah}.</span> ${translation.ayahs[index].text}<br><br>`;
    });
    
    quranText.innerHTML = `
        <div class="arabic-text">${arabicText}</div>
        <div class="translation-text">${translationText}</div>
    `;
    
    // Show controls
    document.getElementById('controls').style.display = 'block';
}

// Display Ayah
function displayAyah(ayah, translation) {
    const surahInfo = document.getElementById('surahInfo');
    const quranText = document.getElementById('quranText');
    
    surahInfo.innerHTML = `
        <h1 class="surah-title">${ayah.surah.name}</h1>
        <p class="surah-subtitle">Ayah ${ayah.numberInSurah}</p>
    `;
    
    quranText.innerHTML = `
        <div class="arabic-text">${ayah.text}</div>
        <div class="translation-text">${translation.text}</div>
    `;
    
    // Show controls
    document.getElementById('controls').style.display = 'block';
}

// Load Welcome Content
function loadWelcomeContent() {
    const surahInfo = document.getElementById('surahInfo');
    const quranText = document.getElementById('quranText');
    
    surahInfo.innerHTML = `
        <h1 class="surah-title">القرآن الكريم</h1>
        <p class="surah-subtitle">The Holy Quran</p>
    `;
    
    quranText.innerHTML = `
        <p class="welcome-text">Welcome to the Quran App. Select a Surah from the menu to begin reading.</p>
    `;
    
    // Hide controls initially
    document.getElementById('controls').style.display = 'none';
}

// Initialize Audio Player
function initializeAudioPlayer() {
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    playBtn.addEventListener('click', playAudio);
    pauseBtn.addEventListener('click', pauseAudio);
}

// Play Audio
async function playAudio() {
    if (!currentSurah || !currentAyah) {
        alert('Please select a specific ayah to play audio');
        return;
    }
    
    try {
        const audioUrl = `https://cdn.islamic.network/quran/audio/${currentReciter}/${currentSurah}/${currentAyah}`;
        
        if (audioPlayer) {
            audioPlayer.pause();
        }
        
        audioPlayer = new Audio(audioUrl);
        audioPlayer.play();
        
        isPlaying = true;
        document.getElementById('playBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
        
        audioPlayer.onended = () => {
            isPlaying = false;
            document.getElementById('playBtn').style.display = 'inline-block';
            document.getElementById('pauseBtn').style.display = 'none';
        };
        
    } catch (error) {
        console.error('Error playing audio:', error);
        alert('Error playing audio. Please try again.');
    }
}

// Pause Audio
function pauseAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        isPlaying = false;
        document.getElementById('playBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
    }
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    const icon = document.querySelector('#darkMode i');
    if (isDark) {
        icon.className = 'fa fa-sun-o';
    } else {
        icon.className = 'fa fa-moon-o';
    }
}

// Show Font Size Selection
function showFontSizeSelection() {
    const sizes = [
        { id: 'small', name: 'Small', size: '1em' },
        { id: 'medium', name: 'Medium', size: '1.2em' },
        { id: 'large', name: 'Large', size: '1.5em' },
        { id: 'xlarge', name: 'Extra Large', size: '2em' }
    ];
    
    createSelectionModal('Select Font Size', sizes, (selectedSize) => {
        document.documentElement.style.setProperty('--font-size', selectedSize.size);
        localStorage.setItem('fontSize', selectedSize.id);
        alert(`Font size changed to: ${selectedSize.name}`);
    });
}

// Show Arabic Font Selection
function showArabicFontSelection() {
    const fonts = [
        { id: 'uthmanic', name: 'Uthmanic Script', font: 'Uthmanic Script' },
        { id: 'kufi', name: 'Kufi', font: 'Kufi' },
        { id: 'naskh', name: 'Naskh', font: 'Naskh' },
        { id: 'ruqaa', name: 'Ruqaa', font: 'Ruqaa' }
    ];
    
    createSelectionModal('Select Arabic Font', fonts, (selectedFont) => {
        document.documentElement.style.setProperty('--arabic-font', selectedFont.font);
        localStorage.setItem('arabicFont', selectedFont.id);
        alert(`Arabic font changed to: ${selectedFont.name}`);
    });
}

// Show About
function showAbout() {
    const aboutContent = `
        <div class="about-content">
            <h2>Quran App</h2>
            <p>A beautiful and functional Quran application built with modern web technologies.</p>
            <p><strong>Features:</strong></p>
            <ul>
                <li>Complete Quran text in Arabic</li>
                <li>Multiple translations</li>
                <li>Audio recitations</li>
                <li>Dark mode</li>
                <li>Customizable fonts</li>
            </ul>
            <p><strong>API:</strong> Powered by AlQuran Cloud API</p>
        </div>
    `;
    
    createSelectionModal('About', [{ id: 'about', name: aboutContent }], () => {});
}

// Load saved preferences
function loadPreferences() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const arabicFont = localStorage.getItem('arabicFont') || 'uthmanic';
    
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('#darkMode i').className = 'fa fa-sun-o';
    }
    
    const sizeMap = { small: '1em', medium: '1.2em', large: '1.5em', xlarge: '2em' };
    document.documentElement.style.setProperty('--font-size', sizeMap[fontSize]);
    
    const fontMap = { uthmanic: 'Uthmanic Script', kufi: 'Kufi', naskh: 'Naskh', ruqaa: 'Ruqaa' };
    document.documentElement.style.setProperty('--arabic-font', fontMap[arabicFont]);
}

// Load preferences when page loads
window.addEventListener('load', loadPreferences);
