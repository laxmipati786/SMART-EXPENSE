import { useState, useEffect, useRef } from 'react';

const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 1500, decimals = 0, color = '#e2e8f0' }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    animateValue(0, value, duration);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, hasAnimated]);

    useEffect(() => {
        if (hasAnimated) {
            animateValue(displayValue, value, 800);
        }
    }, [value]);

    const animateValue = (start, end, dur) => {
        const startTime = performance.now();
        const diff = end - start;

        const step = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / dur, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(start + diff * eased);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };

    const formatNumber = (num) => {
        const fixed = Math.abs(num).toFixed(decimals);
        const parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        // Indian numbering for INR
        if (prefix === '₹' || prefix === '-₹') {
            const n = Math.abs(num).toFixed(decimals);
            const p = n.split('.');
            let lastThree = p[0].substring(p[0].length - 3);
            const otherNumbers = p[0].substring(0, p[0].length - 3);
            if (otherNumbers !== '') lastThree = ',' + lastThree;
            p[0] = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
            return p.join('.');
        }
        return parts.join('.');
    };

    return (
        <span ref={ref} style={{ color, fontVariantNumeric: 'tabular-nums' }}>
            {value < 0 ? '-' : ''}{prefix}{formatNumber(displayValue)}{suffix}
        </span>
    );
};

export default AnimatedCounter;
