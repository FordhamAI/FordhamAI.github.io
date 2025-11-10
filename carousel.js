const DEFAULT_ICONS = {
    FiFileText: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="carousel-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    FiCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="carousel-icon"><circle cx="12" cy="12" r="10"></circle></svg>',
    FiLayers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="carousel-icon"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
    FiLayout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="carousel-icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
    FiCode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="carousel-icon"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
};

const DEFAULT_ITEMS = [
    { title: 'Text Animations', description: 'Cool text animations for your projects.', id: 1, icon: DEFAULT_ICONS.FiFileText },
    { title: 'Animations', description: 'Smooth animations for your projects.', id: 2, icon: DEFAULT_ICONS.FiCircle },
    { title: 'Components', description: 'Reusable components for your projects.', id: 3, icon: DEFAULT_ICONS.FiLayers },
    { title: 'Backgrounds', description: 'Beautiful backgrounds and patterns for your projects.', id: 4, icon: DEFAULT_ICONS.FiLayout },
    { title: 'Common UI', description: 'Common UI components are coming soon!', id: 5, icon: DEFAULT_ICONS.FiCode }
];

const GAP = 16;
const DRAG_BUFFER = 50; 

function createCarousel(
    targetElement, 
    {
        items = DEFAULT_ITEMS,
        baseWidth = 300,
        autoplay = false,
        autoplayDelay = 3000,
        pauseOnHover = false,
        loop = false,
        round = false
    } = {}
) {
    let container = targetElement;

    if (!container) {
        console.error('Carousel target element not found.');
        return;
    }
    
    container.innerHTML = ''; 

    const containerPadding = 16;
    const itemWidth = baseWidth - containerPadding * 2;
    const trackItemOffset = itemWidth + GAP;

    let currentIndex = 0;
    let isHovered = false;
    let autoplayInterval = null;
    let startX = 0;
    let isDragging = false;
    let trackX = 0;

    const carouselItems = loop ? [...items, items[0]] : items;


    function updateTrackPosition(animate = true) {
        const track = container.querySelector('.carousel-track');
        if (!track) return;

        trackX = -(currentIndex * trackItemOffset);

        if (animate) {
            track.style.transition = `transform 0.5s cubic-bezier(0.3, 0.7, 0.4, 1)`;
        } else {
            track.style.transition = 'none';
        }

        track.style.transform = `translateX(${trackX}px)`;

        updateIndicators();

        if (loop && currentIndex === items.length) {
            setTimeout(() => {
                currentIndex = 0;
                updateTrackPosition(false);
            }, animate ? 500 : 0);
        }
    }

    function updateIndicators() {
        const indicators = container.querySelectorAll('.carousel-indicator');
        const activeIndex = currentIndex % items.length;

        indicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'inactive');
            if (index === activeIndex) {
                indicator.classList.add('active');
                indicator.style.transform = 'scale(1.2)';
            } else {
                indicator.classList.add('inactive');
                indicator.style.transform = 'scale(1)';
            }
        });
    }

    function goToIndex(index) {
        if (index < 0) {
            if (loop) {
                currentIndex = carouselItems.length - 1;
            } else {
                currentIndex = 0;
            }
        } else if (index >= carouselItems.length) {
            if (loop) {
                currentIndex = items.length;
            } else {
                currentIndex = carouselItems.length - 1;
            }
        } else {
            currentIndex = index;
        }
        updateTrackPosition();
    }


    function startAutoplay() {
        if (!autoplay || (pauseOnHover && isHovered)) return;

        clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            goToIndex(currentIndex + 1);
        }, autoplayDelay);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }


    function handleDragStart(e) {
        if (e.touches) {
            e.preventDefault(); 
        }
        isDragging = true;
        startX = e.clientX || e.touches[0].clientX;
        stopAutoplay();
        container.querySelector('.carousel-track').style.transition = 'none';
    }

    function handleDragMove(e) {
        if (!isDragging) return;
        const currentX = e.clientX || e.touches[0].clientX;
        const diffX = currentX - startX;

        container.querySelector('.carousel-track').style.transform = `translateX(${trackX + diffX}px)`;
    }

    function handleDragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        startAutoplay();

        const endX = e.clientX || e.changedTouches[0].clientX;
        const offset = endX - startX;

        if (offset < -DRAG_BUFFER) {
            goToIndex(currentIndex + 1);
        } else if (offset > DRAG_BUFFER) {
            goToIndex(currentIndex - 1);
        } else {
            updateTrackPosition();
        }
    }



    function render() {
        const innerCarousel = document.createElement('div');
        innerCarousel.className = `carousel-container ${round ? 'round' : ''}`;
        innerCarousel.style.width = `${baseWidth}px`;
        if (round) {
            innerCarousel.style.height = `${baseWidth}px`;
            innerCarousel.style.borderRadius = '50%';
        }
        
        const track = document.createElement('div');
        track.className = 'carousel-track';
        track.style.width = `${itemWidth}px`;
        track.style.gap = `${GAP}px`;

        carouselItems.forEach((item) => {
            const itemEl = document.createElement('div');
            itemEl.className = `carousel-item ${round ? 'round' : ''}`;
            itemEl.style.width = `${itemWidth}px`;
            itemEl.style.height = round ? `${itemWidth}px` : '100%';
            if (round) itemEl.style.borderRadius = '50%';

            itemEl.innerHTML = `
                <div class="carousel-item-header ${round ? 'round' : ''}">
                    <span class="carousel-icon-container">${item.icon}</span>
                </div>
                <div class="carousel-item-content">
                    <div class="carousel-item-title">${item.title}</div>
                    <p class="carousel-item-description">${item.description}</p>
                </div>
            `;
            track.appendChild(itemEl);
        });

        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = `carousel-indicators-container ${round ? 'round' : ''}`;
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';

        items.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator inactive';
            indicator.addEventListener('click', () => goToIndex(index));
            indicators.appendChild(indicator);
        });

        indicatorsContainer.appendChild(indicators);
        innerCarousel.appendChild(track);
        innerCarousel.appendChild(indicatorsContainer);
        
        container.appendChild(innerCarousel);
        
        return innerCarousel;
    }


    function initialize() {
        const innerCarousel = render();

        if (autoplay) {
            startAutoplay();
        }
        if (pauseOnHover) {
            innerCarousel.addEventListener('mouseenter', () => {
                isHovered = true;
                stopAutoplay();
            });
            innerCarousel.addEventListener('mouseleave', () => {
                isHovered = false;
                startAutoplay();
            });
        }

        const track = innerCarousel.querySelector('.carousel-track');
        track.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        track.addEventListener('touchstart', handleDragStart, { passive: false });
        track.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd); 
        updateTrackPosition(false);
    }

    initialize();
}

function initializeCarousels() {
    const targets = document.querySelectorAll('.Carousel');
    targets.forEach(target => {
        createCarousel(target, { 
            baseWidth: 300,
            autoplay: true,
            loop: true,
            round: false 
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeCarousels);
