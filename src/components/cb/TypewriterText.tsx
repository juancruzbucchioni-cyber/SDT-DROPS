import { useEffect, useState } from "react";

type TypewriterTextProps = {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
};

export function TypewriterText({
  text,
  speed = 40,
  delay = 300,
  className = "",
  onComplete,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let index = 0;
      const timer = setInterval(() => {
        index++;
        setDisplayedText(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(timer);
          setIsTyping(false);
          if (onComplete) onComplete();
        }
      }, speed);
      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {isTyping && <span className="typewriter-cursor" />}
    </span>
  );
}
