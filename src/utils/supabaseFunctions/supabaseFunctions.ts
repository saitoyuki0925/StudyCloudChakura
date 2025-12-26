import { Record } from '@/domain/record';
import type { Database } from '../../../database.types';
import { supabase } from '../supabase';


// type StudyLogRow = Database["public"]["Tables"]["study-record"]["Row"]
type StudyLogInsert = Database['public']['Tables']['study-record']['Insert']

//全取得関数
export const getAllStudyLog = async (): Promise<Record[]> => {
  const { data, error } = await supabase
    .from('study-record')
    .select('*') // 取得

  if (error) throw error
  // nullチェックとRecord型への変換
  const Records = data.map(data => {
    return new Record(data.id, data.title, data.time ?? 0);
  }
  );
  return Records ?? []
};

//追加関数
export const addStudyLog = async (title: string, time: number) => {
  const { data, error } = await supabase
    .from('study-record')
    .insert({ title, time } satisfies StudyLogInsert)
    .select()
    .single();
  if (error) throw error

  return data;
};

//削除関数
export const DeleteStudyLog = async (id:string) => {
  const { error } = await supabase
  .from('study-record')
  .delete()
  .eq('id', id);
  if(error) throw error;
};

//編集関数
export const EditStudyLog = async (id:string, title:string, time:number) => {
  const { data, error } = await supabase
  .from('study-record')
  .update({ title, time } satisfies StudyLogInsert)
  .eq('id', id)
  .select()
  .single();

  if(error) throw error;
  
  return data;
};