import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetDate } = body

    if (!targetDate) {
      return NextResponse.json(
        { error: 'Target date is required' },
        { status: 400 }
      )
    }

    const { stdout, stderr } = await execAsync(
      `python predict_api.py "${targetDate}"`
    )

    if (stderr) {
      console.error('Python stderr:', stderr)
    }

    const result = JSON.parse(stdout)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}
