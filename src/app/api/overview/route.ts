export async function GET() {
  return Response.json({
    overview: {
      documents: "128",
      reviews: "47",
      riskScore: "7.4/10",
      pendingReviews: "12",
    },
    aiUsage: [58, 72, 81, 67, 88, 91, 94],
    recentActivity: [
      "New NDA drafted for Northstar AI",
      "Vendor agreement reviewed with 3 flagged clauses",
      "Two lawyer consultations booked for tomorrow",
    ],
  });
}
