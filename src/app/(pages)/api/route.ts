import { NextResponse } from "next/server";

export async function GET() {
  const tasks = [
    { id: "1", date: "2026-09-08", title: "Design review",    desc: "Review the new dashboard mockups with the product team",           status: 1 },
    { id: "2", date: "2026-09-10", title: "Fix login bug",     desc: "Investigate the OAuth redirect issue on staging",                  status: 2 },
    { id: "3", date: "2026-09-15", title: "Deploy v2.1",       desc: "Push the new release to production after smoke tests pass",        status: 1 },
    { id: "4", date: "2026-09-22", title: "Sprint planning",   desc: "Plan next sprint with the product team",                          status: 1 },
    { id: "5", date: "2026-09-23", title: "Q3 retrospective",  desc: "Retro for the quarter — what went well, what didn't",            status: 3 },
  ];
  return NextResponse.json(tasks);
}
