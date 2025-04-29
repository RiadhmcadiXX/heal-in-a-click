
import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  animationUrl: string;
  width?: number;
  height?: number;
  className?: string;
}

export function LoadingAnimation({
  animationUrl,
  width = 200,
  height = 200,
  className = ''
}: LoadingAnimationProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimationData = async () => {
      try {
        const response = await fetch(animationUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch animation: ${response.status}`);
        }
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        console.error("Error loading animation:", err);
        setError(err instanceof Error ? err.message : "Failed to load animation");
      }
    };

    fetchAnimationData();
  }, [animationUrl]);

  if (error) {
    return <div className="text-center text-red-500">Error loading animation: {error}</div>;
  }

  if (!animationData) {
    return <div className="text-center">Loading animation...</div>;
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Lottie
        animationData={animationData}
        style={{ width, height }}
        loop={true}
        autoplay={true}
      />
    </div>
  );
}
