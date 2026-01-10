import { MarketingLayout } from './layout/MarketingLayout';

export function AboutPage() {
    return (
        <MarketingLayout>
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-8 text-white uppercase tracking-wider">
                        Empowering the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-lime to-neon-cyan">
                            One-Person Empire
                        </span>
                    </h1>

                    <div className="prose prose-invert prose-lg text-gray-400 font-mono">
                        <p className="lead text-xl text-white mb-8 font-mono">
                            We believe that with the right tools, a single individual can achieve the output of a 10-person team.
                        </p>

                        <p className="mb-6">
                            SoloSuccess AI was born from a simple observation: the tools available to entrepreneurs were either too simple to be useful or too complex for a single person to manage. There was no middle ground.
                        </p>

                        <p className="mb-6">
                            We set out to build an operating system that leverages the latest advancements in Artificial Intelligence to bridge this gap. Our mission is to democratize business success by giving solopreneurs access to the same strategic intelligence and execution power as large corporations.
                        </p>

                        <div className="my-8 p-6 rounded-sm bg-neon-lime/10 border border-neon-lime/20 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                            <p className="text-neon-lime font-bold font-orbitron uppercase tracking-wide mb-2">We're in Beta</p>
                            <p className="text-sm text-gray-300">
                                Currently building with our founding cohort of solo founders. Every feature you see is production-ready and actively used.
                                Your feedback shapes the future of this platform.
                            </p>
                        </div>

                        <h2 className="text-2xl font-bold font-orbitron text-white mt-12 mb-6 uppercase tracking-wider">Our Values</h2>

                        <div className="grid gap-8">
                            <div className="bg-dark-card p-6 rounded-sm border border-gray-700 hover:border-neon-lime/50 transition-colors">
                                <h3 className="text-xl font-bold font-orbitron text-neon-lime mb-2 uppercase tracking-wide">Ruthless Efficiency</h3>
                                <p>We automate everything that can be automated, so you can focus on high-leverage creative work.</p>
                            </div>

                            <div className="bg-dark-card p-6 rounded-sm border border-gray-700 hover:border-neon-cyan/50 transition-colors">
                                <h3 className="text-xl font-bold font-orbitron text-neon-cyan mb-2 uppercase tracking-wide">Data-Driven Decisions</h3>
                                <p>We believe in gut instinct backed by hard data. Our tools provide the insights you need to move with confidence.</p>
                            </div>

                            <div className="bg-dark-card p-6 rounded-sm border border-gray-700 hover:border-neon-purple/50 transition-colors">
                                <h3 className="text-xl font-bold font-orbitron text-neon-purple mb-2 uppercase tracking-wide">Continuous Evolution</h3>
                                <p>The market never stands still, and neither do we. Our platform evolves daily to keep you ahead of the curve.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
