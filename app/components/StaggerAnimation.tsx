"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 24,
        },
    },
};

export function StaggerContainer({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div className={className} variants={itemVariants}>
            {children}
        </motion.div>
    );
}

/**
 * Scroll-triggered animated list item. Slides up + fades in
 * when it enters the viewport, with a stagger-like delay via index.
 */
export function ScrollRevealItem({
    children,
    className,
    index = 0,
}: {
    children: ReactNode;
    className?: string;
    index?: number;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 24,
                delay: Math.min(index * 0.05, 0.3),
            }}
        >
            {children}
        </motion.div>
    );
}

export { containerVariants, itemVariants };
