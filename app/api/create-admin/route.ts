import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use regular signUp (this works with triggers)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'employee' // Start as employee
        }
      }
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    // Update role to admin in public.users
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully. You can now sign in.',
      user: {
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: 'admin'
      }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
