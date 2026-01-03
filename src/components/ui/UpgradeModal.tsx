import React from 'react';
import { X, Check, Lock } from 'lucide-react';

/**
 * UpgradeModal component following Cyberpunk Design System v3
 * Uses neon colors, dark backgrounds, and glow effects
 */
interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
    requiredTier?: 'Solo' | 'Pro' | 'Agency';
}

export function UpgradeModal({ isOpen, onClose, featureName, requiredTier = 'Solo' }: UpgradeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-dark-card rounded-sm border-2 border-neon-cyan overflow-hidden shadow-[0_0_30px_rgba(11,228,236,0.3)] animate-in fade-in zoom-in duration-200">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-neon-purple" />
                <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-neon-purple" />
                <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-neon-purple" />
                <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-neon-purple" />

                {/* Header */}
                <div className="p-8 text-center border-b border-gray-700 bg-gradient-to-b from-neon-cyan/10 to-transparent">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-sm bg-neon-cyan/10 flex items-center justify-center border-2 border-neon-cyan shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                        <Lock className="w-8 h-8 text-neon-cyan" />
                    </div>
                    <h2 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-white mb-2">
                        Unlock {featureName}
                    </h2>
                    <p className="font-mono text-gray-400">
                        Upgrade to the {requiredTier} plan to access this feature and more.
                    </p>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-neon-cyan transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Comparison */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-orbitron font-bold text-gray-500 text-sm uppercase tracking-wider">Free Plan</h3>
                        <div className="space-y-3 font-mono">
                            <div className="flex items-center gap-3 text-gray-600">
                                <X className="w-5 h-5 text-neon-magenta" />
                                <span>{featureName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                                <Check className="w-5 h-5 text-gray-600" />
                                <span>Basic AI Generation</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                                <Check className="w-5 h-5 text-gray-600" />
                                <span>1 Business Profile</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-orbitron font-bold text-neon-cyan text-sm uppercase tracking-wider">{requiredTier} Plan</h3>
                        <div className="space-y-3 font-mono">
                            <div className="flex items-center gap-3 text-white">
                                <Check className="w-5 h-5 text-neon-lime" />
                                <span className="font-bold text-neon-lime">{featureName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <Check className="w-5 h-5 text-neon-lime" />
                                <span>Unlimited AI Generation</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <Check className="w-5 h-5 text-neon-lime" />
                                <span>Increased Storage</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-dark-bg border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <div className="font-orbitron text-2xl font-bold text-white">$29<span className="text-sm text-gray-500 font-mono font-normal">/mo</span></div>
                        <div className="text-xs font-mono text-neon-lime">30-day money-back guarantee</div>
                    </div>
                    <button className="w-full md:w-auto px-8 py-3 bg-neon-cyan/10 border-2 border-neon-cyan text-neon-cyan font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(11,228,236,0.5)] transition-all hover:scale-105 active:scale-95">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
}
