/**
 * 自定义Tooltip组件
 * 用于在hover时显示详细信息
 */

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  maxWidth?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 300,
  className = '',
  maxWidth = '320px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!containerRef.current || !tooltipRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = containerRect.top - tooltipRect.height - 8;
        left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = containerRect.bottom + 8;
        left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
        left = containerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
        left = containerRect.right + 8;
        break;
    }

    // 确保tooltip不超出视窗
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible, placement]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowClass = () => {
    switch (placement) {
      case 'top':
        return 'after:top-full after:left-1/2 after:-translate-x-1/2 after:border-t-gray-800 after:border-t-[6px] after:border-x-transparent after:border-x-[6px]';
      case 'bottom':
        return 'after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-b-gray-800 after:border-b-[6px] after:border-x-transparent after:border-x-[6px]';
      case 'left':
        return 'after:left-full after:top-1/2 after:-translate-y-1/2 after:border-l-gray-800 after:border-l-[6px] after:border-y-transparent after:border-y-[6px]';
      case 'right':
        return 'after:right-full after:top-1/2 after:-translate-y-1/2 after:border-r-gray-800 after:border-r-[6px] after:border-y-transparent after:border-y-[6px]';
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 bg-gray-800 text-white text-sm rounded-lg shadow-lg p-3 pointer-events-none
            transform transition-all duration-200 ease-out
            after:content-[''] after:absolute after:w-0 after:h-0 after:border-solid
            ${getArrowClass()}
            ${className}
          `}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxWidth: maxWidth,
            opacity: isVisible ? 1 : 0,
            transform: `scale(${isVisible ? 1 : 0.95})`
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;