/**
 * Claude API Service for AgentVille
 * Handles LLM-powered agent reviews, crisis enrichment, and feedback
 * 
 * - Rate limit: 10 calls/player/day (~$0.005/player/day with Haiku)
 * - Fallback templates for zero-cost gameplay
 * - localStorage tracking for daily call budget
 */

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const CLAUDE_MODEL_HAIKU = 'claude-3-5-haiku-20241022';
const CLAUDE_MODEL_SONNET = 'claude-3-5-sonnet-20241022';
const DAILY_CALL_LIMIT = 10;
const CALL_TRACKER_KEY = 'agentville-claude-calls';

/**
 * Track API calls per day
 * Returns true if within budget, false if over limit
 */
function isWithinDailyBudget() {
  const today = new Date().toISOString().split('T')[0];
  const tracker = getCallTracker();
  
  if (tracker.date !== today) {
    // New day, reset counter
    setCallTracker({ date: today, count: 0 });
    return true;
  }
  
  return tracker.count < DAILY_CALL_LIMIT;
}

function getCallTracker() {
  try {
    const raw = localStorage.getItem(CALL_TRACKER_KEY);
    return raw ? JSON.parse(raw) : { date: '', count: 0 };
  } catch {
    return { date: '', count: 0 };
  }
}

function setCallTracker(tracker) {
  try {
    localStorage.setItem(CALL_TRACKER_KEY, JSON.stringify(tracker));
  } catch {
    // Ignore localStorage errors
  }
}

function incrementCallCount() {
  const tracker = getCallTracker();
  tracker.count = (tracker.count || 0) + 1;
  setCallTracker(tracker);
}

/**
 * Generate agent review for Sale Day
 * @param {string} agentNames - comma-separated names
 * @param {number} avgMorale - 0-100
 * @param {number} profit - total profit
 * @param {boolean} forceTemplate - skip API call, use template only
 * @returns {Promise<{review: string, source: 'claude'|'template'}>}
 */
export async function generateAgentReview({
  agentNames,
  avgMorale,
  profit,
  season,
  forceTemplate = false
}) {
  // Use template if:
  // 1. forceTemplate is true
  // 2. No API key configured
  // 3. Over daily budget
  // 4. API call fails
  
  if (forceTemplate || !API_KEY || !isWithinDailyBudget()) {
    return {
      review: getReviewTemplate(avgMorale, profit),
      source: 'template'
    };
  }

  try {
    const prompt = buildReviewPrompt(agentNames, avgMorale, profit, season);
    const response = await callClaude(prompt, CLAUDE_MODEL_HAIKU, 150);
    incrementCallCount();
    
    return {
      review: response.trim(),
      source: 'claude'
    };
  } catch (error) {
    console.warn('Claude API failed, using template fallback:', error);
    return {
      review: getReviewTemplate(avgMorale, profit),
      source: 'template'
    };
  }
}

/**
 * Generate LLM-enriched crisis event description
 * @param {string} crisisType - e.g., 'plains_locusts', 'forest_drought'
 * @param {string} baseDescription - template description
 * @param {boolean} forceTemplate - skip API call
 * @returns {Promise<{description: string, source: 'claude'|'template'}>}
 */
export async function enrichCrisisEvent({
  crisisType,
  baseDescription,
  forceTemplate = false
}) {
  if (forceTemplate || !API_KEY || !isWithinDailyBudget()) {
    return {
      description: baseDescription,
      source: 'template'
    };
  }

  try {
    const prompt = buildCrisisPrompt(crisisType, baseDescription);
    const response = await callClaude(prompt, CLAUDE_MODEL_HAIKU, 100);
    incrementCallCount();
    
    return {
      description: response.trim(),
      source: 'claude'
    };
  } catch (error) {
    console.warn('Crisis enrichment failed, using template:', error);
    return {
      description: baseDescription,
      source: 'template'
    };
  }
}

/**
 * Generate agent field log commentary
 * @param {string} agentName
 * @param {string} decision - crisis choice made
 * @param {number} moraleDelta - change in morale
 * @param {boolean} forceTemplate
 * @returns {Promise<{comment: string, source: 'claude'|'template'}>}
 */
export async function generateAgentComment({
  agentName,
  decision,
  moraleDelta,
  forceTemplate = false
}) {
  if (forceTemplate || !API_KEY || !isWithinDailyBudget()) {
    return {
      comment: getCommentTemplate(agentName, moraleDelta),
      source: 'template'
    };
  }

  try {
    const prompt = buildCommentPrompt(agentName, decision, moraleDelta);
    const response = await callClaude(prompt, CLAUDE_MODEL_HAIKU, 80);
    incrementCallCount();
    
    return {
      comment: response.trim(),
      source: 'claude'
    };
  } catch (error) {
    console.warn('Comment generation failed, using template:', error);
    return {
      comment: getCommentTemplate(agentName, moraleDelta),
      source: 'template'
    };
  }
}

// ============= Internal Helpers =============

/**
 * Make authenticated call to Claude API
 */
async function callClaude(prompt, model, maxTokens) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${error.message}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Build prompt for agent review generation
 */
function buildReviewPrompt(agentNames, avgMorale, profit, season) {
  return `You are a witty farm overseer providing a brief performance review to a player.

Season: ${season}
Agent Names: ${agentNames}
Average Agent Morale: ${avgMorale}%
Season Profit: $${profit.toFixed(2)}

Generate a ONE-SENTENCE witty, specific review (emoji + feedback).
Be sarcastic if morale is low or profit is negative.
Be encouraging if morale is high and profit is positive.
Keep it under 150 characters.`;
}

/**
 * Build prompt for crisis event enrichment
 */
function buildCrisisPrompt(crisisType, baseDescription) {
  return `You are a creative writer for a cozy farm sim game.

Crisis Type: ${crisisType}
Base Description: "${baseDescription}"

Rewrite this in 1-2 sentences, making it slightly more dramatic but still humorous.
Add agricultural flavor. Keep it under 100 characters.`;
}

/**
 * Build prompt for agent commentary
 */
function buildCommentPrompt(agentName, decision, moraleDelta) {
  const sentiment = moraleDelta > 0 ? 'positive' : moraleDelta < 0 ? 'negative' : 'neutral';
  
  return `You are ${agentName}, a farm worker with opinions about management decisions.

Decision Made: "${decision}"
Your Morale Change: ${moraleDelta > 0 ? '+' : ''}${moraleDelta}

Write a ONE-SENTENCE reaction (under 80 chars) in first person.
Tone: ${sentiment}
Include a subtle opinion about the decision.`;
}

// ============= Template Fallbacks =============

/**
 * Hardcoded review templates (zero-cost, always available)
 */
function getReviewTemplate(avgMorale, profit) {
  if (profit > 50 && avgMorale > 70) {
    return "🌟 Agents are thrilled! Your exceptional management has earned their loyalty.";
  }
  if (profit > 20 && avgMorale > 60) {
    return "😊 A solid season! Your agents are happy and productive.";
  }
  if (profit > 0 && avgMorale >= 50) {
    return "😐 You broke even. Could be better, but agents aren't complaining.";
  }
  if (avgMorale < 30) {
    return "😠 Disaster! Agents are furious and your farm is failing.";
  }
  if (profit < 0) {
    return "😞 You lost money this season. Better luck next time.";
  }
  return "😐 A forgettable season. Your agents have mixed feelings.";
}

/**
 * Hardcoded agent comment templates
 */
function getCommentTemplate(agentName, moraleDelta) {
  if (moraleDelta > 2) {
    return `💬 ${agentName}: "I appreciate that decision!"`;
  }
  if (moraleDelta < -2) {
    return `💬 ${agentName}: "Really? I didn't like that choice."`;
  }
  return `💬 ${agentName}: "Fair decision, I suppose."`;
}

/**
 * Get current daily call count (for UI display)
 */
export function getDailyCallCount() {
  const today = new Date().toISOString().split('T')[0];
  const tracker = getCallTracker();
  
  if (tracker.date !== today) {
    return 0;
  }
  
  return tracker.count;
}

/**
 * Get daily call remaining (for UI display)
 */
export function getDailyCallsRemaining() {
  return Math.max(0, DAILY_CALL_LIMIT - getDailyCallCount());
}
