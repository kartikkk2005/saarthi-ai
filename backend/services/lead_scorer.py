class LeadScorer:
    """
    Lead Qualification Engine (Phase 4).
    Evaluates lead intent and assigns a score based on keywords.
    Automatically classifies leads into Hot, Warm, or Cold based on their accumulated score.
    """

    def __init__(self):
        self.interest_signals = ['interested', 'yes', 'tell me more', 'how', 'join', 'commission', 'partner', 'haan', 'batao', 'accha']
        self.rejection_signals = ['no', 'not interested', 'nahi', 'already', 'stop', 'busy']

    def calculate_score_delta(self, message: str) -> int:
        """Calculate the score change based on the current message."""
        msg_lower = message.lower()
        
        # Check for rejection first
        for signal in self.rejection_signals:
            if signal in msg_lower:
                return -15
                
        # Check for interest
        for signal in self.interest_signals:
            if signal in msg_lower:
                return 15
                
        # Neutral engagement bonus
        return 5

    def classify(self, score: int) -> str:
        """Classifies the lead based on the score."""
        if score >= 75:
            return "Hot"
        elif score >= 40:
            return "Warm"
        else:
            return "Cold"

lead_scorer = LeadScorer()
