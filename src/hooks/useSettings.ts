
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SettingsData } from '@/integrations/supabase/database.types';

export interface SettingsState {
  [key: string]: any;
}

export const useSettings = (category: string = 'general') => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use any to work around type system limitations
      const { data, error } = await (supabase as any)
        .from('settings')
        .select('key, value')
        .eq('category', category);

      if (error) {
        throw error;
      }

      // Return the array of key-value pairs directly so it's iterable
      if (data) {
        console.log(`Fetched ${data.length || 0} settings for category ${category}`);
        setSettings(data);
      } else {
        // If no data, set an empty array to avoid "not iterable" errors
        setSettings([]);
      }
      
      // Save to localStorage as a fallback for offline access
      localStorage.setItem(`settings_${category}`, JSON.stringify(data || []));
    } catch (err: any) {
      console.error(`Error fetching settings for ${category}:`, err);
      setError(err.message || `Failed to fetch ${category} settings`);
      
      // Try to load from localStorage if network request fails
      const savedSettings = localStorage.getItem(`settings_${category}`);
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          toast.info('ใช้ข้อมูลการตั้งค่าที่บันทึกไว้ในเครื่อง');
        } catch (parseErr) {
          console.error('Error parsing saved settings:', parseErr);
          // Set empty array as fallback to avoid "not iterable" errors
          setSettings([]);
        }
      } else {
        toast.error(`ไม่สามารถโหลดข้อมูลการตั้งค่า ${category} ได้`);
        setSettings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (data: any, category: string = 'general') => {
    try {
      // If data is a key-value pair
      if (typeof data === 'object' && 'key' in data && 'value' in data) {
        const { key, value } = data;
        
        // First update local state for immediate UI update
        setSettings(prev => {
          const updatedSettings = Array.isArray(prev) ? [...prev] : [];
          const existingIndex = updatedSettings.findIndex(item => item.key === key);
          
          if (existingIndex >= 0) {
            updatedSettings[existingIndex] = { ...updatedSettings[existingIndex], value };
          } else {
            updatedSettings.push({ category, key, value });
          }
          
          return updatedSettings;
        });
        
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

        // Then save to Supabase
        const { error } = await (supabase as any)
          .from('settings')
          .upsert(
            { 
              category,
              key,
              value
            },
            { onConflict: 'category,key' }
          );

        if (error) {
          throw error;
        }
      } 
      // If data is an array of updates
      else if (Array.isArray(data)) {
        // Update local state
        setSettings(prev => {
          const updatedSettings = Array.isArray(prev) ? [...prev] : [];
          
          for (const item of data) {
            if (item.key) {
              const existingIndex = updatedSettings.findIndex(setting => setting.key === item.key);
              
              if (existingIndex >= 0) {
                updatedSettings[existingIndex] = { ...updatedSettings[existingIndex], value: item.value };
              } else {
                updatedSettings.push({
                  category: item.category || category,
                  key: item.key,
                  value: item.value
                });
              }
            }
          }
          
          return updatedSettings;
        });
        
        // Save to localStorage
        let localStorageData = {};
        try {
          localStorageData = JSON.parse(localStorage.getItem(`settings_${category}`) || '[]');
        } catch (e) {
          localStorageData = [];
        }
        
        const updatedLocalData = Array.isArray(localStorageData) ? [...localStorageData] : [];
        
        for (const item of data) {
          if (item.key) {
            const existingIndex = updatedLocalData.findIndex(setting => setting.key === item.key);
            
            if (existingIndex >= 0) {
              updatedLocalData[existingIndex] = { ...updatedLocalData[existingIndex], value: item.value };
            } else {
              updatedLocalData.push({
                category: item.category || category,
                key: item.key,
                value: item.value
              });
            }
          }
        }
        
        localStorage.setItem(`settings_${category}`, JSON.stringify(updatedLocalData));
        
        // Save to Supabase
        const { error } = await (supabase as any)
          .from('settings')
          .upsert(
            data.map((item: any) => ({
              ...item,
              category: item.category || category
            })),
            { onConflict: 'category,key' }
          );

        if (error) {
          throw error;
        }
      }

      return true;
    } catch (err: any) {
      console.error(`Error updating setting:`, err);
      toast.error(`ไม่สามารถบันทึกการตั้งค่าได้`);
      return false;
    }
  };

  const updateMultipleSettings = async (newSettings: SettingsState, category: string = 'general') => {
    try {
      // Prepare data for Supabase
      const upsertData = Object.entries(newSettings).map(([key, value]) => ({
        category,
        key,
        value
      }));
      
      // Update local state for immediate UI update
      setSettings(prev => {
        const updatedSettings = Array.isArray(prev) ? [...prev] : [];
        
        for (const [key, value] of Object.entries(newSettings)) {
          const existingIndex = updatedSettings.findIndex(item => item.key === key);
          
          if (existingIndex >= 0) {
            updatedSettings[existingIndex] = { ...updatedSettings[existingIndex], value };
          } else {
            updatedSettings.push({ category, key, value });
          }
        }
        
        return updatedSettings;
      });
      
      // Save to localStorage as backup
      const currentLocalSettings = JSON.parse(localStorage.getItem(`settings_${category}`) || '[]');
      const updatedLocalSettings = Array.isArray(currentLocalSettings) ? [...currentLocalSettings] : [];
      
      for (const [key, value] of Object.entries(newSettings)) {
        const existingIndex = updatedLocalSettings.findIndex(item => item.key === key);
        
        if (existingIndex >= 0) {
          updatedLocalSettings[existingIndex] = { ...updatedLocalSettings[existingIndex], value };
        } else {
          updatedLocalSettings.push({ category, key, value });
        }
      }
      
      localStorage.setItem(`settings_${category}`, JSON.stringify(updatedLocalSettings));

      // Then save to Supabase using any to bypass type checking
      const { error } = await (supabase as any)
        .from('settings')
        .upsert(upsertData, { onConflict: 'category,key' });

      if (error) {
        throw error;
      }

      toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error(`Error updating multiple settings:`, err);
      toast.error(`ไม่สามารถบันทึกการตั้งค่าได้`);
      return false;
    }
  };

  // Initial data fetch and set up real-time subscription
  useEffect(() => {
    fetchSettings();
    
    // Set up real-time subscription for settings changes
    const channel = (supabase as any)
      .channel('settings-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'settings', filter: `category=eq.${category}` },
          (payload: any) => {
            console.log('Settings data change detected:', payload);
            fetchSettings(); // Refresh all settings when changes occur
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateMultipleSettings
  };
};
