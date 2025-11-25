// src/utils/matchingLogic.js

// Function to calculate the overlap score (used for skills and interests)
const calculateOverlap = (userItems, candidateItems) => {
    if (!Array.isArray(userItems) || !Array.isArray(candidateItems)) return 0;
    
    // Use Sets for efficient intersection
    const userSet = new Set(userItems.map(item => item.toLowerCase().trim()));
    
    let overlapCount = 0;
    candidateItems.forEach(item => {
        if (userSet.has(item.toLowerCase().trim())) {
            overlapCount++;
        }
    });
    
    // Normalize score based on the current user's total number of items
    const totalItems = userItems.length;
    return totalItems > 0 ? overlapCount / totalItems : 0;
};


// Main function to match one user against all candidates
export const getMatchScores = (currentUserProfile, allCandidateProfiles) => {
    if (!currentUserProfile || !allCandidateProfiles) return [];

    const scores = [];
    const maxAvailability = 50; // Max hours from your profile form

    allCandidateProfiles.forEach(candidate => {
        // Skip comparing the user to themselves
        if (currentUserProfile.id === candidate.id) return;

        // 1. Skill Overlap (Weight: 0.6)
        const skillOverlapScore = calculateOverlap(currentUserProfile.skills, candidate.skills);
        const skillScore = skillOverlapScore * 0.6;

        // 2. Interest Match (Weight: 0.3)
        const interestOverlapScore = calculateOverlap(currentUserProfile.interests, candidate.interests);
        const interestScore = interestOverlapScore * 0.3;

        // 3. Availability Match (Weight: 0.1)
        // Score is higher if availability hours are closer (lower difference)
        const diff = Math.abs(currentUserProfile.availabilityHours - candidate.availabilityHours);
        // Normalize the difference (1 - diff/max_diff) and multiply by weight
        const availabilityMatch = (1 - Math.min(diff / maxAvailability, 1));
        const availabilityScore = availabilityMatch * 0.1;

        // Total Match Score
        const totalScore = skillScore + interestScore + availabilityScore;

        scores.push({
            candidateId: candidate.id,
            totalScore: parseFloat(totalScore.toFixed(3)),
            details: { 
                skillScore: skillScore, 
                interestScore: interestScore, 
                availabilityScore: availabilityScore
            }
        });
    });

    // Sort by total score (highest match first)
    return scores.sort((a, b) => b.totalScore - a.totalScore);
};