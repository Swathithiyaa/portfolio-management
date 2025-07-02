/**
 * Utility functions for sentiment analysis display
 * Updated for points-based sentiment analysis (-100 to +100)
 */

/**
 * Convert sentiment points to a more readable format
 * Points range from -100 to +100
 */
export const getSentimentDisplay = (sentiment) => {
  if (sentiment === undefined || sentiment === null || isNaN(sentiment)) {
    return {
      label: 'Neutral',
      color: '#9e9e9e',
      points: 0,
      intensity: 'Neutral'
    };
  }
  if (sentiment >= 15) {
    return {
      label: 'Positive',
      color: '#4caf50',
      points: Math.round(sentiment),
      intensity: sentiment >= 50 ? 'Strong' : sentiment >= 30 ? 'Moderate' : 'Mild'
    };
  } else if (sentiment <= -15) {
    return {
      label: 'Negative',
      color: '#f44336',
      points: Math.round(Math.abs(sentiment)),
      intensity: sentiment <= -50 ? 'Strong' : sentiment <= -30 ? 'Moderate' : 'Mild'
    };
  } else {
    return {
      label: 'Neutral',
      color: '#9e9e9e',
      points: 0,
      intensity: 'Neutral'
    };
  }
};

/**
 * Get sentiment label based on points with improved thresholds
 */
export const getSentimentLabel = (sentiment) => {
  if (sentiment >= 15) return 'Positive';
  if (sentiment <= -15) return 'Negative';
  return 'Neutral';
};

/**
 * Get sentiment color based on points
 */
export const getSentimentColor = (sentiment) => {
  if (sentiment >= 15) return '#4caf50';
  if (sentiment <= -15) return '#f44336';
  return '#9e9e9e';
};

/**
 * Format sentiment points for display with intensity
 */
export const formatSentimentScore = (sentiment) => {
  const display = getSentimentDisplay(sentiment);
  return display.label;
};

/**
 * Get sentiment icon based on points
 */
export const getSentimentIcon = (sentiment) => {
  if (sentiment >= 15) return '📈';
  if (sentiment <= -15) return '📉';
  return '➡️';
};

/**
 * Get sentiment description for tooltips
 */
export const getSentimentDescription = (sentiment) => {
  const display = getSentimentDisplay(sentiment);
  if (display.label === 'Neutral') {
    return 'Market sentiment is neutral with balanced positive and negative factors';
  }
  return `Market sentiment is ${display.intensity.toLowerCase()} ${display.label.toLowerCase()} based on recent news and market analysis`;
};

/**
 * Get sentiment severity for alerts
 */
export const getSentimentSeverity = (sentiment) => {
  if (sentiment >= 50) return 'strong_positive';
  if (sentiment >= 15) return 'positive';
  if (sentiment <= -50) return 'strong_negative';
  if (sentiment <= -15) return 'negative';
  return 'neutral';
};

export const getSentimentImpact = (sentiment) => {
  if (sentiment >= 15) {
    return { label: 'Positive Impact', color: '#4caf50', icon: '📈' };
  } else if (sentiment <= -15) {
    return { label: 'Negative Impact', color: '#f44336', icon: '📉' };
  } else {
    return { label: 'Neutral Impact', color: '#9e9e9e', icon: '➡️' };
  }
};

export const getImpactScoreAndQuantum = (sentiment) => {
  if (sentiment === undefined || sentiment === null || isNaN(sentiment)) {
    return { impactScore: 0, quantumLabel: 'No Impact', color: '#9e9e9e' };
  }
  const impactScore = Math.abs(sentiment);
  let quantumLabel = 'Small Impact';
  if (impactScore >= 0.7) {
    quantumLabel = 'Large Impact';
  } else if (impactScore >= 0.3) {
    quantumLabel = 'Medium Impact';
  } else if (impactScore >= 0.1) {
    quantumLabel = 'Small Impact';
  } else {
    quantumLabel = 'No Impact';
  }
  let color = '#9e9e9e';
  if (sentiment >= 0.15) color = '#4caf50';
  else if (sentiment <= -0.15) color = '#f44336';
  return {
    impactScore: impactScore.toFixed(2),
    quantumLabel,
    color
  };
}; 