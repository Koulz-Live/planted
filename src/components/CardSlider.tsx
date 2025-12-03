import React, { useEffect, useRef } from 'react';
import './CardSlider.css';

export interface CardSliderProps {
  children: React.ReactNode[];
  cardClassName?: string;
  containerClassName?: string;
  showIndicators?: boolean;
  autoSlide?: boolean;
  interval?: number;
}

/**
 * CardSlider - A mobile-friendly swipeable card carousel component
 * 
 * Based on Bootstrap carousel pattern but optimized for touch gestures.
 * Features:
 * - Touch/swipe navigation on mobile
 * - Keyboard arrow navigation
 * - Optional auto-slide
 * - Customizable indicators
 * - Fully responsive
 * 
 * @example
 * <CardSlider showIndicators>
 *   <div>Card 1</div>
 *   <div>Card 2</div>
 *   <div>Card 3</div>
 * </CardSlider>
 */
export function CardSlider({
  children,
  cardClassName = '',
  containerClassName = '',
  showIndicators = true,
  autoSlide = false,
  interval = 5000
}: CardSliderProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselId = useRef(`card-slider-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Dynamically import Bootstrap's Carousel if not already loaded
    if (typeof window !== 'undefined' && carouselRef.current) {
      const loadBootstrap = async () => {
        if (!(window as any).bootstrap?.Carousel) {
          // Bootstrap should already be loaded via CDN or package
          // This is just a safety check
          console.warn('Bootstrap Carousel not found. Make sure Bootstrap JS is loaded.');
        }
      };
      loadBootstrap();
    }
  }, []);

  const childArray = React.Children.toArray(children);

  return (
    <div
      ref={carouselRef}
      id={carouselId.current}
      className={`carousel slide card-slider ${containerClassName}`}
      data-bs-ride={autoSlide ? 'carousel' : 'false'}
      data-bs-interval={autoSlide ? interval : 'false'}
      data-bs-touch="true"
    >
      {/* Indicators */}
      {showIndicators && childArray.length > 1 && (
        <div className="carousel-indicators card-slider-indicators">
          {childArray.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target={`#${carouselId.current}`}
              data-bs-slide-to={index}
              className={index === 0 ? 'active' : ''}
              aria-current={index === 0 ? 'true' : 'false'}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slides */}
      <div className="carousel-inner">
        {childArray.map((child, index) => (
          <div
            key={index}
            className={`carousel-item ${index === 0 ? 'active' : ''} ${cardClassName}`}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Optional navigation arrows (hidden by default, can be shown with CSS) */}
      {childArray.length > 1 && (
        <>
          <button
            className="carousel-control-prev card-slider-control"
            type="button"
            data-bs-target={`#${carouselId.current}`}
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next card-slider-control"
            type="button"
            data-bs-target={`#${carouselId.current}`}
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </>
      )}
    </div>
  );
}
