import { useState } from 'react';
import './RecipeImageCarousel.css';

interface RecipeImageCarouselProps {
  images: string[];
  recipeName: string;
}

export default function RecipeImageCarousel({ images, recipeName }: RecipeImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  if (!images || images.length === 0) {
    return null;
  }

  const validImages = images.filter((_, index) => !imageErrors[index]);

  if (validImages.length === 0) {
    return (
      <div className="recipe-image-placeholder">
        <span>🍽️</span>
        <p>No images available</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (index: number) => {
    console.warn(`Failed to load image ${index} for ${recipeName}`);
    setImageErrors(prev => ({ ...prev, [index]: true }));
    
    // Move to next valid image
    if (currentIndex === index && validImages.length > 1) {
      handleNext();
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="recipe-image-carousel">
      <div className="carousel-container">
        <button 
          className="carousel-button carousel-button-prev" 
          onClick={handlePrevious}
          aria-label="Previous image"
        >
          ‹
        </button>

        <div className="carousel-images">
          {images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`${recipeName} - Image ${index + 1}`}
              className={`carousel-image ${index === currentIndex ? 'active' : ''} ${imageErrors[index] ? 'hidden' : ''}`}
              onError={() => handleImageError(index)}
              loading="lazy"
            />
          ))}
        </div>

        <button 
          className="carousel-button carousel-button-next" 
          onClick={handleNext}
          aria-label="Next image"
        >
          ›
        </button>
      </div>

      <div className="carousel-dots">
        {validImages.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      <div className="carousel-counter">
        {currentIndex + 1} / {validImages.length}
      </div>
    </div>
  );
}
