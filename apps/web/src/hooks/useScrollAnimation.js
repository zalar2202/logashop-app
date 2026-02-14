"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Root margin for early/late triggering
 * @param {boolean} options.triggerOnce - Only trigger animation once
 * @returns {Object} - { ref, isVisible }
 */
export function useScrollAnimation(options = {}) {
    const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", triggerOnce = true } = options;

    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
}

/**
 * Hook for staggered animations on multiple children
 * @param {number} itemCount - Number of items to animate
 * @param {Object} options - Configuration options
 * @returns {Object} - { containerRef, isVisible, getItemDelay }
 */
export function useStaggerAnimation(itemCount, options = {}) {
    const { staggerDelay = 100, ...scrollOptions } = options;
    const { ref: containerRef, isVisible } = useScrollAnimation(scrollOptions);

    const getItemDelay = (index) => ({
        animationDelay: `${index * staggerDelay}ms`,
        transitionDelay: `${index * staggerDelay}ms`,
    });

    return { containerRef, isVisible, getItemDelay };
}

export default useScrollAnimation;
