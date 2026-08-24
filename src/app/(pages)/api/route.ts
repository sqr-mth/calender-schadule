import { NextResponse } from "next/server";

export async function GET() {
  const tasks = [
    { id: "1", date: "2025-08-20", title: "Design review",   desc: "Review the new dashboard mockups with the team",          status: 1 },
    { id: "2", date: "2025-08-22", title: "Fix login bug",    desc: "Investigate and fix the OAuth redirect issue on staging", status: 2 },
    { id: "3", date: "2025-08-24", title: "Deploy v2.1",      desc: "Deploy the new release to production after smoke tests",  status: 1 },
    { id: "4", date: "2025-08-28", title: "Sprint planning",  desc: "Plan next sprint with the product team",                  status: 1 },
    { id: "5", date: "2025-09-01", title: "Q3 retrospective", desc: "Team retro for the past quarter",                        status: 3 },
  ];
  return NextResponse.json(tasks);
}
