import { NextRequest, NextResponse } from 'next/server';
import { UserBet } from '@/types';

// Mock database
let bets: UserBet[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userBets = bets.filter((b) => b.userId === params.userId);
    return NextResponse.json(userBets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const newBet: UserBet = {
      id: Date.now().toString(),
      userId: data.userId,
      predictionId: data.predictionId,
      amountxlm: data.amountxlm,
      prediction: data.prediction,
      placedAt: new Date(),
      status: 'pending',
    };

    bets.push(newBet);

    return NextResponse.json(newBet, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to place bet' },
      { status: 500 }
    );
  }
}
