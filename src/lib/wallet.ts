import { supabase } from './supabase';

export type TransactionType = 'wallet_credit' | 'wallet_debit' | 'split_pay' | 'split_receive';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  split_id?: string;
  created_at: string;
}

export const fetchWalletBalance = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data.wallet_balance || 0;
};

export const fetchTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Transaction[];
};

export const recordTransaction = async (
  userId: string,
  type: TransactionType,
  amount: number,
  description: string,
  splitId?: string
) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      type,
      amount,
      description,
      split_id: splitId
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateWalletBalance = async (userId: string, newBalance: number) => {
  const { error } = await supabase
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', userId);

  if (error) throw error;
};

export const addMoneyToWallet = async (userId: string, currentBalance: number, amount: number) => {
  const newBalance = currentBalance + amount;
  await updateWalletBalance(userId, newBalance);
  await recordTransaction(userId, 'wallet_credit', amount, `Top-up via UPI`);
  return newBalance;
};

export const payFromWallet = async (userId: string, currentBalance: number, amount: number, splitId: string, splitTitle: string) => {
  if (currentBalance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  
  const newBalance = currentBalance - amount;
  await updateWalletBalance(userId, newBalance);
  await recordTransaction(userId, 'wallet_debit', amount, `Payment for split: ${splitTitle}`, splitId);
  return newBalance;
};
