
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SettingsState, SettingItem, SettingUpdate } from './types';

export const useUpdateSettings = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateSetting = async (data: SettingItem, category: string = 'queue') => {
    try {
      setIsUpdating(true);
      const { key, value } = data;
      
      // Save to Supabase - fix the upsert structure with proper JSONB handling
      const { error } = await supabase
        .from('settings')
        .upsert(
          { 
            category,
            key,
            value: typeof value === 'string' ? value : JSON.stringify(value)
          },
          { 
            onConflict: 'category,key',
            ignoreDuplicates: false 
          }
        );

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Save to localStorage as backup
      const currentSettings = JSON.parse(localStorage.getItem(`settings_${category}`) || '[]');
      const updatedLocalSettings = [...currentSettings];
      const existingIndex = updatedLocalSettings.findIndex(item => item.key === key);
      
      if (existingIndex >= 0) {
        updatedLocalSettings[existingIndex] = { ...updatedLocalSettings[existingIndex], value };
      } else {
        updatedLocalSettings.push({ category, key, value });
      }
      
      localStorage.setItem(`settings_${category}`, JSON.stringify(updatedLocalSettings));

      return true;
    } catch (err: any) {
      console.error(`Error updating setting:`, err);
      toast.error(`ไม่สามารถบันทึกการตั้งค่าได้: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateMultipleSettings = async (updates: SettingUpdate[] | SettingsState, category: string = 'queue') => {
    try {
      setIsUpdating(true);
      
      // Convert object format to array if needed
      const updatesArray = Array.isArray(updates) 
        ? updates 
        : Object.entries(updates).map(([key, value]) => ({
            category,
            key,
            value
          }));

      // Filter out any entries with null/undefined keys
      const validUpdates = updatesArray.filter(item => item.key && item.key.trim() !== '');

      if (validUpdates.length === 0) {
        console.warn('No valid updates to process');
        return true;
      }

      console.log('Updating settings with proper JSONB format:', validUpdates);

      // Save to Supabase - fix the upsert structure with proper JSONB handling
      const { error } = await supabase
        .from('settings')
        .upsert(
          validUpdates.map((item: any) => ({
            category: item.category || category,
            key: item.key,
            value: typeof item.value === 'string' ? item.value : JSON.stringify(item.value)
          })),
          { 
            onConflict: 'category,key',
            ignoreDuplicates: false 
          }
        );

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Save to localStorage as backup
      const currentLocalSettings = JSON.parse(localStorage.getItem(`settings_${category}`) || '[]');
      const updatedLocalSettings = Array.isArray(currentLocalSettings) ? [...currentLocalSettings] : [];
      
      for (const item of validUpdates) {
        const key = item.key;
        const value = item.value;
        const existingIndex = updatedLocalSettings.findIndex(setting => setting.key === key);
        
        if (existingIndex >= 0) {
          updatedLocalSettings[existingIndex] = { ...updatedLocalSettings[existingIndex], value };
        } else {
          updatedLocalSettings.push({
            category: item.category || category,
            key,
            value
          });
        }
      }
      
      localStorage.setItem(`settings_${category}`, JSON.stringify(updatedLocalSettings));

      toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error(`Error updating multiple settings:`, err);
      toast.error(`ไม่สามารถบันทึกการตั้งค่าได้: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateSetting,
    updateMultipleSettings,
    isUpdating
  };
};
