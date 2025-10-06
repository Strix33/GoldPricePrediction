import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

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

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(targetDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const { stdout, stderr } = await execFileAsync(
      'python',
      ['predict_api.py', targetDate]
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
