import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'auto',
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 计算最佳位置
  const calculateBestPosition = () => {
    if (!containerRef.current || position !== 'auto') {
      setActualPosition(position === 'auto' ? 'top' : position);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 估算tooltip的大小（基于内容估算）
    const estimatedWidth = 320; // w-80 = 320px
    const estimatedHeight = 150; // 估算高度
    
    // 检查各个方向是否有足够空间
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;
    
    // 优先级：top > bottom > right > left
    if (spaceTop >= estimatedHeight) {
      setActualPosition('top');
    } else if (spaceBottom >= estimatedHeight) {
      setActualPosition('bottom');
    } else if (spaceRight >= estimatedWidth) {
      setActualPosition('right');
    } else if (spaceLeft >= estimatedWidth) {
      setActualPosition('left');
    } else {
      // 选择空间最大的方向
      const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
      if (maxSpace === spaceTop) setActualPosition('top');
      else if (maxSpace === spaceBottom) setActualPosition('bottom');
      else if (maxSpace === spaceRight) setActualPosition('right');
      else setActualPosition('left');
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculateBestPosition();
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-gray-800 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-gray-800 border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg',
            positionClasses[actualPosition],
            className
          )}
        >
          {content}
          {/* 箭头 */}
          <div 
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowClasses[actualPosition]
            )}
          />
        </div>
      )}
    </div>
  );
};

export { Tooltip };