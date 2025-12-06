import type { Database } from '../../../database.types';
import { supabase } from '../supabase';


type StudyLogRow = Database["public"]["Tables"]["study-record"]["Row"]
type StudyLogInsert = Database['public']['Tables']['study-record']['Insert']

export const getAllStudyLog = async (): Promise<StudyLogRow[]> => {
  const { data, error } = await supabase
    .from('study-record')
    .select('*') // 取得
  if (error) throw error
  return data ?? []
};

export const addStudyLog = async (title: string, time: number) => {
  const { data, error } = await supabase
    .from('study-record')
    .insert({ title, time } satisfies StudyLogInsert)
    .select()
    .single();
  if (error) throw error

  return data;
};

export const DeleteStudyLog = async (id:string) => {
  const { error } = await supabase
  .from('study-record')
  .delete()
  .eq('id', id);
  if(error) throw error;
};
