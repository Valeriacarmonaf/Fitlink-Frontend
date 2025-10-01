import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventReal from '../components/EventReal'; 
import events from '../data/eventsDataDummy'; 

const PrimaryButtonClasses = "inline-block px-10 py-4 text-lg bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02]";

// FIX: Duplicate TWO items at start and end. Structure: [Last 2, ...Events, First 2]
const visibleEvents = [
  ...events.slice(-2).map(e => ({...e, id: `${e.id}-clone-last`})),
  ...events,
  ...events.slice(0, 2).map(e => ({...e, id: `${e.id}-clone-first`})),
];

const LandingPage = () => {
  const scrollContainerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false); 
  
  const SCROLL_AMOUNT = 352; 
  const SCROLL_DURATION = 300;
  
  // FIX: Define EXACT scroll positions based on SCROLL_AMOUNT * index
  // -----------------------------------------------------------------
  // Snap from end clone to: The first REAL item (Index 2)
  const SNAP_TO_START_POS = SCROLL_AMOUNT * 2; 
  
  // Snap from start clone to: The last REAL item (Index events.length + 1)
  const SNAP_TO_END_POS = SCROLL_AMOUNT * (events.length + 1); 
  
  // Trigger boundary for teleport when scrolling right (at Index events.length + 2)
  const BOUNDARY_RIGHT = SCROLL_AMOUNT * (events.length + 2) - 1;

  // Trigger boundary for teleport when scrolling left (at Index 0)
  const BOUNDARY_LEFT = SCROLL_AMOUNT * 0 + 1;
  // -----------------------------------------------------------------


  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Initialize scroll position to the first real item (Index 2) instantly.
      container.scrollLeft = SNAP_TO_START_POS;
    }
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container || isScrolling) return;

    setIsScrolling(true);

    const currentScroll = container.scrollLeft;
    let targetScroll = currentScroll;
    
    if (direction === 'left') {
        targetScroll = currentScroll - SCROLL_AMOUNT;
    } else { 
        targetScroll = currentScroll + SCROLL_AMOUNT;
    }

    const animateScroll = (start, end, duration) => {
      let startTime = null;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        
        const easedPercentage = percentage < 0.5 ? 2 * percentage * percentage : 1 - Math.pow(-2 * percentage + 2, 2) / 2;

        container.scrollLeft = start + (end - start) * easedPercentage;

        if (progress < duration) {
          window.requestAnimationFrame(step);
        } else {
          // --- FINAL FIX: Use exact boundary conditions for seamless loop ---
          const finalScroll = container.scrollLeft;
          
          // SCROLLING RIGHT (Check if we landed on a clone at the end)
          if (finalScroll >= BOUNDARY_RIGHT) { 
            // Teleport to the position of the real first item
            container.scrollLeft = SNAP_TO_START_POS; 
          }
          // SCROLLING LEFT (Check if we landed on a clone at the start)
          else if (finalScroll <= BOUNDARY_LEFT) { 
            // Teleport to the position of the real last item
            container.scrollLeft = SNAP_TO_END_POS; 
          }
          
          setIsScrolling(false);
        }
      };

      window.requestAnimationFrame(step);
    };

    animateScroll(currentScroll, targetScroll, SCROLL_DURATION);
  };

  return (
    <main className="flex-grow p-10 bg-gray-50">
      
      <section className="max-w-4xl mx-auto py-20 px-8 text-center rounded-2xl bg-white shadow-2xl mb-12">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-6">Bienvenido a FitLink</h1>
        <p className="text-xl text-gray-600 mb-10">
          Conecta con personas para entrenar, correr o jugar en equipo.
        </p>
        <Link to="/dashboard" className={PrimaryButtonClasses}>
          Ir al Panel de Control
        </Link>
      </section>

      <section className="max-w-6xl mx-auto py-8 px-4 bg-white rounded-2xl shadow-xl">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Próximos Eventos</h2>
        
        <div className="relative">
          <button 
            onClick={() => scroll('left')} 
            className={`absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none z-20 ${isScrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Scroll left"
            disabled={isScrolling}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="w-[352px] mx-auto overflow-hidden">
            <div 
              ref={scrollContainerRef} 
              className={`flex overflow-x-auto hide-scrollbar p-4`} 
            >
              {visibleEvents.map((event, index) => (
                <EventReal 
                  key={event.id + index} 
                  title={event.title}
                  description={event.description}
                  imageUrl={event.imageUrl}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={() => scroll('right')} 
            className={`absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none z-20 ${isScrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Scroll right"
            disabled={isScrolling}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;