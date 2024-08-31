// I used App routing
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const tasks = [
    { id: '1', date: '2024-08-06',title:'test1', desc: 'Task 1', status: "1" },
    { id: '2', date: '2024-08-07',title:'test2', desc: 'Task 2', status: "2" },
  ];
  return NextResponse.json(tasks)
}