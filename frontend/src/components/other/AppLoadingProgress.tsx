"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Progress } from "../ui/progress";

const AppLoadingProgress = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsedTime / 500) * 100);

      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 100);
      }
    };

    requestAnimationFrame(updateProgress);

    return () => setProgress(0); // Reset progress on unmount
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <Image
        src="/logo.png"
        priority={true}
        alt="Axxes Logo"
        width={250}
        height={200}
        className="mb-5"
      />
      <Progress value={progress} className="w-64 h-2" />
    </div>
  );
};

export default AppLoadingProgress;
