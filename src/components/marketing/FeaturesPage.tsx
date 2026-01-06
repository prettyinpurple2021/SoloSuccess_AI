import React from 'react';
import { MarketingLayout } from './layout/MarketingLayout';
import { Target, Zap, Shield, BarChart3, Brain, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FeaturesPage() {
    return (
        <MarketingLayout>
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-white uppercase tracking-wider">
                        Everything You Need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-lime to-neon-cyan">
                            Dominate Your Niche
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 font-mono">
                        A complete suite of AI-powered tools designed specifically for the modern solopreneur.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureDetail
                        icon={<Target className="w-8 h-8 text-neon-lime" />}
                        title="Strategic Planning"
                        description="AI-driven roadmaps that adapt to your progress. Set goals, track milestones, and get intelligent suggestions on what to focus on next."
                        variant="lime"
                    />
                    <FeatureDetail
                        icon={<Zap className="w-8 h-8 text-neon-cyan" />}
                        title="Rapid Execution"
                        description="Turn ideas into actionable tasks instantly. Our AI breaks down complex projects into manageable steps and helps you execute them."
                        variant="cyan"
                    />
                    <FeatureDetail
                        icon={<Shield className="w-8 h-8 text-neon-purple" />}
                        title="Competitor Intelligence"
                        description="Monitor your competitors in real-time. Get alerts on their pricing changes, marketing strategies, and product launches."
                        variant="purple"
                    />
                    <FeatureDetail
                        icon={<Brain className="w-8 h-8 text-neon-magenta" />}
                        title="AI Advisory Board"
                        description="Consult with specialized AI agents for marketing, legal, finance, and strategy. It's like having a C-suite in your pocket."
                        variant="magenta"
                    />
                    <FeatureDetail
                        icon={<BarChart3 className="w-8 h-8 text-neon-orange" />}
                        title="Financial Treasury"
                        description="Track revenue, expenses, and runway. Get AI-powered financial forecasts and budget optimization tips."
                        variant="orange"
                    />
                    <FeatureDetail
                        icon={<Rocket className="w-8 h-8 text-neon-orange" />}
                        title="Idea Incinerator"
                        description="Validate your business ideas against market data. Our AI ruthlessly critiques and refines your concepts before you invest time."
                        variant="orange"
                    />
                </div>

                {/* CTA Section */}
                <div className="mt-32 p-12 rounded-sm bg-dark-card border border-neon-lime/20 text-center relative overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                    <div className="absolute inset-0 bg-neon-lime/5 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-orbitron font-bold mb-4 text-white uppercase tracking-wider">Ready to Build Your Empire?</h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto font-mono">
                            Join our beta cohort of ambitious solo founders building the future with AI.
                        </p>
                        <Button className="w-full sm:w-auto" variant="lime">
                            Start Free Trial
                        </Button>
                        <p className="text-sm text-gray-500 mt-4 font-mono">14 days free · No credit card required</p>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}

function FeatureDetail({ icon, title, description, variant = 'cyan' }: { icon: React.ReactNode, title: string, description: string, variant?: string }) {
    const borderColor = {
        lime: 'group-hover:border-neon-lime/50',
        cyan: 'group-hover:border-neon-cyan/50',
        purple: 'group-hover:border-neon-purple/50',
        magenta: 'group-hover:border-neon-magenta/50',
        orange: 'group-hover:border-neon-orange/50',
    }[variant] || 'group-hover:border-neon-cyan/50';

    const glowColor = {
        lime: 'group-hover:shadow-[0_0_20px_rgba(57,255,20,0.2)]',
        cyan: 'group-hover:shadow-[0_0_20px_rgba(11,228,236,0.2)]',
        purple: 'group-hover:shadow-[0_0_20px_rgba(179,0,255,0.2)]',
        magenta: 'group-hover:shadow-[0_0_20px_rgba(255,0,110,0.2)]',
        orange: 'group-hover:shadow-[0_0_20px_rgba(255,102,0,0.2)]',
    }[variant] || 'group-hover:shadow-neon-cyan/20';

    return (
        <div className={`p-8 rounded-sm bg-dark-card border border-gray-700/50 transition-all duration-300 hover:bg-dark-elem group ${borderColor} ${glowColor} hover:-translate-y-1`}>
            <div className="mb-6 p-3 rounded-sm bg-dark-bg w-fit border border-gray-700 group-hover:border-white/20 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold font-orbitron text-white mb-3 uppercase tracking-wider">{title}</h3>
            <p className="text-gray-400 leading-relaxed font-mono text-sm">{description}</p>
        </div>
    );
}
