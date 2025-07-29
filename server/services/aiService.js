// server/services/aiService.js

class AIService {
  constructor() {
    // Fraud detection keywords and patterns
    this.fraudKeywords = [
      'money upfront', 'registration fee', 'processing fee', 'bank details',
      'credit card', 'western union', 'bitcoin', 'cryptocurrency',
      'immediate payment', 'urgent transfer', 'deposit required',
      'advance payment', 'security deposit', 'training fee'
    ];

    this.suspiciousPatterns = [
      /pay.*\$\d+.*start/i,
      /send.*money.*job/i,
      /bank.*account.*details/i,
      /urgent.*payment.*required/i,
      /deposit.*\$\d+.*position/i
    ];

    this.inappropriateKeywords = [
      'personal photos', 'private meeting', 'hotel room', 'after hours',
      'inappropriate', 'sexual', 'harassment', 'discriminatory'
    ];
  }

  // Comprehensive message analysis
  analyzeMessage(messageText) {
    const analysis = {
      fraudScore: 0,
      sentimentScore: 0,
      riskFlags: [],
      inappropriate: false,
      suspiciousKeywords: [],
      analysisTimestamp: new Date()
    };

    // Convert to lowercase for analysis
    const text = messageText.toLowerCase();

    // 1. Fraud Detection
    analysis.fraudScore = this.calculateFraudScore(text);
    
    // 2. Suspicious Keywords Detection
    analysis.suspiciousKeywords = this.findSuspiciousKeywords(text);
    
    // 3. Pattern Analysis
    analysis.riskFlags = this.detectRiskPatterns(text);
    
    // 4. Inappropriate Content Detection
    analysis.inappropriate = this.detectInappropriateContent(text);
    
    // 5. Sentiment Analysis (basic)
    analysis.sentimentScore = this.calculateSentiment(text);

    return analysis;
  }

  calculateFraudScore(text) {
    let score = 0;
    
    // Check for fraud keywords
    this.fraudKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 15;
      }
    });

    // Check for suspicious patterns
    this.suspiciousPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        score += 25;
      }
    });

    // Check for urgency indicators
    const urgencyWords = ['urgent', 'immediately', 'asap', 'right now', 'quick'];
    urgencyWords.forEach(word => {
      if (text.includes(word)) {
        score += 5;
      }
    });

    // Check for money mentions
    if (/\$\d+|\d+\s*(dollars|usd|euros|pounds)/.test(text)) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  findSuspiciousKeywords(text) {
    const found = [];
    this.fraudKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        found.push(keyword);
      }
    });
    return found;
  }

  detectRiskPatterns(text) {
    const flags = [];
    
    if (this.suspiciousPatterns.some(pattern => pattern.test(text))) {
      flags.push('suspicious_payment_request');
    }
    
    if (text.includes('bank') && text.includes('details')) {
      flags.push('banking_info_request');
    }
    
    if (text.includes('fee') || text.includes('deposit')) {
      flags.push('upfront_payment_request');
    }
    
    if (/meet.*private|private.*meeting|hotel.*room/.test(text)) {
      flags.push('inappropriate_meeting_request');
    }

    return flags;
  }

  detectInappropriateContent(text) {
    return this.inappropriateKeywords.some(keyword => text.includes(keyword));
  }

  calculateSentiment(text) {
    // Basic sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'pleased', 'happy', 'satisfied'];
    const negativeWords = ['bad', 'terrible', 'awful', 'upset', 'angry', 'disappointed'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 0.1;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, score));
  }

  // Conversation-level analysis
  analyzeConversation(messages) {
    let totalFraudScore = 0;
    let riskFlags = new Set();
    let inappropriateCount = 0;

    messages.forEach(message => {
      if (message.aiAnalysis) {
        totalFraudScore += message.aiAnalysis.fraudScore;
        message.aiAnalysis.riskFlags.forEach(flag => riskFlags.add(flag));
        if (message.aiAnalysis.inappropriate) inappropriateCount++;
      }
    });

    const avgFraudScore = messages.length > 0 ? totalFraudScore / messages.length : 0;

    return {
      averageFraudScore: avgFraudScore,
      totalRiskFlags: Array.from(riskFlags),
      inappropriateMessages: inappropriateCount,
      riskLevel: avgFraudScore > 70 ? 'critical' : 
                avgFraudScore > 50 ? 'high' :
                avgFraudScore > 30 ? 'medium' : 'low'
    };
  }

  // Real-time fraud alert
  shouldTriggerAlert(analysis) {
    return analysis.fraudScore > 60 || 
           analysis.riskFlags.includes('banking_info_request') ||
           analysis.riskFlags.includes('upfront_payment_request') ||
           analysis.inappropriate;
  }

  // Generate warning message for users
  generateWarningMessage(analysis) {
    if (analysis.fraudScore > 80) {
      return "🚨 HIGH FRAUD RISK: This message contains multiple fraud indicators. Please be extremely cautious and report if you feel unsafe.";
    } else if (analysis.fraudScore > 60) {
      return "⚠️ CAUTION: This message shows potential fraud patterns. Verify all requests independently.";
    } else if (analysis.inappropriate) {
      return "⚠️ INAPPROPRIATE CONTENT: This message may contain inappropriate content. Report if you feel harassed.";
    }
    return null;
  }
}

module.exports = new AIService();
