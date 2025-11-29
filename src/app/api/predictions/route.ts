import { NextRequest, NextResponse } from 'next/server';
import { Prediction } from '@/types';

// Mock database
let predictions: Prediction[] = [];

export async function GET() {
  try {
    return NextResponse.json(predictions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const newPrediction: Prediction = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      category: data.category,
      createdBy: data.createdBy || 'Anonymous',
      createdAt: new Date(),
      targetDate: new Date(data.targetDate),
      status: 'active',
      technicalAnalysis: data.technicalAnalysis,
      emotionalAnalysis: data.emotionalAnalysis,
      totalxlmStaked: data.initialxlm,
      supportingxlm: Math.floor(data.initialxlm * 0.6),
      opposingxlm: Math.floor(data.initialxlm * 0.4),
      successRate: 50,
      probability: 50,
      odds: 1.5,
      result: null,
    };

    predictions.push(newPrediction);

    return NextResponse.json(newPrediction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    );
  }
}
