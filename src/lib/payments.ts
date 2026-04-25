import { supabase } from './supabase';

export interface Split {
  id: string;
  ride_id: string;
  title: string;
  total_amount: number;
  created_by: string;
  created_at: string;
}

export interface SplitMember {
  id: string;
  split_id: string;
  user_id: string;
  amount: number;
  payment_status: 'paid' | 'pending';
  stripe_payment_intent_id?: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
}

export const createSplit = async (
  rideId: string, 
  title: string, 
  totalAmount: number, 
  members: { user_id: string; amount: number }[],
  createdBy: string
) => {
  const { data: split, error: splitError } = await supabase
    .from('splits')
    .insert([{ ride_id: rideId, title, total_amount: totalAmount, created_by: createdBy }])
    .select()
    .single();

  if (splitError) throw splitError;

  const splitMembers = members.map(m => ({
    split_id: split.id,
    user_id: m.user_id,
    amount: m.amount,
    payment_status: 'pending' // Default everyone to pending so creator can test the payment flow
  }));

  const { error: membersError } = await supabase
    .from('split_members')
    .insert(splitMembers);

  if (membersError) throw membersError;

  return split;
};

export const fetchRideSplits = async (rideId: string) => {
  const { data, error } = await supabase
    .from('splits')
    .select(`
      *,
      split_members (
        *,
        profiles:user_id (full_name, avatar_url, username)
      )
    `)
    .eq('ride_id', rideId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchUserBills = async (userId: string) => {
  const { data, error } = await supabase
    .from('split_members')
    .select(`
      *,
      split:split_id (
        id,
        title,
        ride:ride_id (title)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updatePaymentStatus = async (memberId: string, status: 'paid' | 'pending') => {
  const { error } = await supabase
    .from('split_members')
    .update({ payment_status: status })
    .eq('id', memberId);

  if (error) throw error;
};

export const createPaymentIntent = async (
  amount: number, 
  userId: string, 
  splitMemberId: string, 
  splitId: string
) => {
  const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/payments/create-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, userId, splitMemberId, splitId, currency: 'inr' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment intent');
  }

  return response.json();
};
