import { supabase } from '../lib/supabase';
import type { CompanyProfile } from '../types';

export const uploadLogo = async (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
};

export const getCompanyProfile = async (): Promise<CompanyProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('company_profile')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {

    return null;
  }

  return data;
};

export const createCompanyProfile = async (profile: Omit<CompanyProfile, 'id' | 'user_id'>): Promise<CompanyProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('company_profile')
    .insert([{ ...profile, user_id: user.id }])
    .select()
    .single();

  if (error) {

    return null;
  }

  return data;
};

export const updateCompanyProfile = async (id: string, profile: Partial<CompanyProfile>): Promise<CompanyProfile | null> => {
  const { data, error } = await supabase
    .from('company_profile')
    .update(profile)
    .eq('id', id)
    .select()
    .single();

  if (error) {

    return null;
  }

  return data;
};