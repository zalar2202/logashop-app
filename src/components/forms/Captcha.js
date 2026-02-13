"use client";

import { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";

/**
 * Simple Math Captcha Component
 * 
 * @param {Object} props
 * @param {Function} props.onVerify - Callback function when captcha is solved or changed
 * @param {string} props.error - Error message to display
 */
export const Captcha = ({ onVerify, error }) => {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [isSolved, setIsSolved] = useState(false);

    const generateCaptcha = () => {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        setNum1(n1);
        setNum2(n2);
        setUserInput("");
        setIsSolved(false);
        onVerify(false, "");
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setUserInput(val);
        
        if (parseInt(val) === num1 + num2) {
            setIsSolved(true);
            onVerify(true, val);
        } else {
            setIsSolved(false);
            onVerify(false, val);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                Security Check
            </label>
            <div className="flex items-center gap-3">
                <div 
                    className="flex-1 flex items-center justify-center h-11 px-4 rounded-lg border font-mono text-lg font-bold select-none tracking-widest"
                    style={{ 
                        backgroundColor: "var(--color-background-secondary)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                        backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 0)",
                        backgroundSize: "10px 10px"
                    }}
                >
                    {num1} + {num2} = ?
                </div>
                
                <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-3 rounded-lg border hover:bg-[var(--color-hover)] transition-colors"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                    title="Refresh Captcha"
                >
                    <RefreshCcw size={18} />
                </button>
            </div>
            
            <input
                type="number"
                value={userInput}
                onChange={handleChange}
                placeholder="Answer"
                className={`w-full h-11 px-4 rounded-lg border transition-all outline-none focus:ring-2 ${
                    isSolved 
                        ? "border-green-500 focus:ring-green-500/20" 
                        : error 
                            ? "border-red-500 focus:ring-red-500/20" 
                            : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                }`}
                style={{ 
                    backgroundColor: "var(--color-background-elevated)",
                    color: "var(--color-text-primary)"
                }}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};
