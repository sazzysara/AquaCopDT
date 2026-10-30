import { NextResponse } from "next/server";
import { INITIAL_WATERBODIES } from "../../../components/mockData";

export async function GET() {
  return NextResponse.json(INITIAL_WATERBODIES);
}
