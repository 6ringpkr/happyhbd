"use client";

import { useState } from 'react';

interface CoverImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

export default function CoverImage({ src, fallbackSrc, alt, className }: CoverImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
    />
  );
}
