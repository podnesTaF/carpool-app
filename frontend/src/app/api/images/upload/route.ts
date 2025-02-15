import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '../../../../lib/s3';

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  if (!formData) {
    return new NextResponse('No form data found', { status: 400 });
  }

  const file = formData.get('file');
  if (!file) {
    return new NextResponse('No file found in form data', { status: 400 });
  }

  return await uploadToS3(file, 'public/');
};
