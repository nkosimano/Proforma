import { supabase } from '../lib/supabase';
import type { Customer } from '../types';

export interface CustomerSuggestion {
  name: string;
  address: string;
  email: string;
}

// Get all customers for the authenticated user
export const getAllCustomers = async (): Promise<Customer[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  if (error) {

    return [];
  }

  return data || [];
};

// Get a specific customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {

    return null;
  }

  return data;
};

// Create a new customer
export const createCustomer = async (customer: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Customer | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...customer,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {

    return null;
  }

  return data;
};

// Update an existing customer
export const updateCustomer = async (id: string, updates: Partial<Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Customer | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {

    return null;
  }

  return data;
};

// Delete a customer
export const deleteCustomer = async (id: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {

    return false;
  }

  return true;
};

// Search customers by name (updated to use customers table)
export const searchCustomers = async (query: string): Promise<CustomerSuggestion[]> => {
  if (query.length < 2) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('customers')
    .select('name, address, email')
    .eq('user_id', user.id)
    .ilike('name', `%${query}%`)
    .limit(10);

  if (error) {

    return [];
  }

  return data || [];
};