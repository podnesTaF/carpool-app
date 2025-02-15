import { NextRequest } from 'next/server';
import { getImageFromS3 } from '@/lib/s3';

export const GET = async (req: NextRequest) => {
  return await getImageFromS3(req, "public/");	
};
