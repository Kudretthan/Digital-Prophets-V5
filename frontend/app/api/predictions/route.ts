import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Prediction } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const newPrediction = {
      title: data.title,
      description: data.description,
      category: data.category,
      created_by: data.createdBy || 'Anonymous',
      target_date: new Date(data.targetDate).toISOString(),
      status: 'active',
      technical_analysis: data.technicalAnalysis,
      emotional_analysis: data.emotionalAnalysis,
      total_xlm_staked: data.initialxlm,
      supporting_xlm: Math.floor(data.initialxlm * 0.6),
      opposing_xlm: Math.floor(data.initialxlm * 0.4),
      success_rate: 50,
      probability: 50,
      odds: 1.5,
      result: null,
    };

    const { data: createdPrediction, error } = await supabase
      .from('predictions')
      .insert([newPrediction])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(createdPrediction, { status: 201 });
  } catch (error) {
    console.error('Failed to create prediction:', error);
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    );
  }
}
