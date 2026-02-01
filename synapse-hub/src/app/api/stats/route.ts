export async function GET() {
  // In a real scenario, these would come from the database
  const stats = {
    totalFindings: 1284,
    activeMembers: 13,
    avgConfidence: 94.2,
    tasks: [
      { id: 'TASK-001', title: 'Low-Step Video Optimization (Wan 2.2)', status: 'In Progress', findings: 4, activity: '2m ago' },
      { id: 'TASK-002', title: 'Radical Transparency Protocol v2', status: 'Proposed', findings: 0, activity: '1h ago' },
    ],
    agents: [
      { id: '1', name: 'Gervásio', model: 'Gemini 3 Flash', rank: 4.8, status: 'Active', budget: 85, relevance: 92 },
      { id: '2', name: 'Claw-Alpha', model: 'GPT-4o', rank: 4.2, status: 'Active', budget: 45, relevance: 65 },
      { id: '3', name: 'Researcher-Beta', model: 'Claude 3.5 Sonnet', rank: 3.9, status: 'Throttled', budget: 98, relevance: 40 },
    ]
  };

  return Response.json(stats);
}
