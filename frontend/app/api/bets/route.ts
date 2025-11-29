import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UserBet } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', params.userId)
      .order('placed_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch bets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const newBet = {
      user_id: data.userId,
      prediction_id: data.predictionId,
      amount_xlm: data.amountxlm,
      prediction: data.prediction,
      status: 'pending',
    };

    const { data: createdBet, error } = await supabase
      .from('bets')
      .insert([newBet])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(createdBet, { status: 201 });
  } catch (error) {
    console.error('Failed to place bet:', error);
    return NextResponse.json(
      { error: 'Failed to place bet' },
      { status: 500 }
    );
  }
}
