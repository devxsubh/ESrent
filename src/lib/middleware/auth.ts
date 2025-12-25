import { NextRequest, NextResponse } from 'next/server';
import { UserService, User } from '@/lib/services/userService';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

export async function authenticateToken(request: NextRequest): Promise<NextResponse | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    const user = await UserService.verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Add user to request for use in route handlers
    (request as AuthenticatedRequest).user = user;
    return null; // Continue to next middleware/route
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  return await authenticateToken(request);
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await authenticateToken(request);
  if (authResult) return authResult;

  const user = (request as AuthenticatedRequest).user;
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return null;
}

export async function requireSuperAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await authenticateToken(request);
  if (authResult) return authResult;

  const user = (request as AuthenticatedRequest).user;
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Super admin access required' },
      { status: 403 }
    );
  }

  return null;
} 