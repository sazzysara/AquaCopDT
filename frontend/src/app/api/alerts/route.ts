import { NextResponse } from "next/server";
import { INITIAL_ALERTS } from "../../../components/mockData";

export async function GET() {
  return NextResponse.json(INITIAL_ALERTS);
}

