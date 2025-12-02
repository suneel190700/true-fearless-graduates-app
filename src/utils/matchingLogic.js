// src/utils/matchingLogic.js

const calculateOverlap = (userItems, candidateItems) => {
    // Handle cases where fields are null in DynamoDB
    const uItems = userItems || [];
    const cItems = candidateItems || [];
    
    if (uItems.length === 0) return 0;

    const userSet = new Set(uItems.map(item => item.toLowerCase().trim()));
    let overlapCount = 0;
    
    cItems.forEach(item => {
        if (userSet.has(item.toLowerCase().trim())) {
            overlapCount++;
        }
    });
    
    return overlapCount / uItems.length;
};

export const getMatchScores = (currentUser, candidates) => {
    if (!currentUser || !candidates) return [];

    const scores = [];
    const maxAvailability = 50; 

    candidates.forEach(candidate => {
        // Skip self
        if (candidate.id === currentUser.id) return;

        // 1. Skill Overlap (Weight: 0.6)
        const skillOverlap = calculateOverlap(currentUser.skills, candidate.skills);
        const skillScore = skillOverlap * 0.6;

        // 2. Interest Match (Weight: 0.3)
        const interestOverlap = calculateOverlap(currentUser.interests, candidate.interests);
        const interestScore = interestOverlap * 0.3;

        // 3. Availability Match (Weight: 0.1)
        const userHours = currentUser.availability_hours || 0;
        const candHours = candidate.availability_hours || 0;
        const diff = Math.abs(userHours - candHours);
        const availabilityMatch = (1 - Math.min(diff / maxAvailability, 1));
        const availabilityScore = availabilityMatch * 0.1;

        const totalScore = skillScore + interestScore + availabilityScore;

        scores.push({
            candidateId: candidate.id,
            fullName: candidate.full_name || 'Unknown',
            totalScore: parseFloat(totalScore.toFixed(2)),
            details: { 
                skillScore, 
                interestScore, 
                availabilityScore 
            }
        });
    });

    return scores.sort((a, b) => b.totalScore - a.totalScore);
};