
import { onboardingAI, LaunchPlan } from '../src/services/onboarding-ai';
import { logInfo } from '../src/lib/logger';
import { config } from 'dotenv';

// Load env vars
config({ path: '.env.local' });

async function testGeneration() {
  console.log('🧪 Testing Onboarding AI Service...');
  
  const profile = {
    name: "Test User",
    businessType: "SaaS Founder",
    goals: ["Scale Business", "Automate Tasks"]
  };

  console.log(`📋 Profile: ${profile.businessType} - Goals: ${profile.goals.join(', ')}`);

  const start = Date.now();
  try {
    const plan: LaunchPlan = await onboardingAI.generateLaunchPlan(profile);
    const duration = Date.now() - start;
    
    console.log(`✅ Plan Generated in ${duration}ms`);
    console.log(`   Phases: ${plan.roadmap.length}`);
    
    if (plan.roadmap.length > 0) {
      console.log(`   First Phase: ${plan.roadmap[0].phaseName}`);
      console.log(`   First Task: ${plan.roadmap[0].tasks[0].title}`);
    }

    // Verify structure
    if (!plan.roadmap || !Array.isArray(plan.roadmap)) {
      throw new Error('Invalid plan structure: roadmap is missing or not an array');
    }
  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  }
}

testGeneration();
