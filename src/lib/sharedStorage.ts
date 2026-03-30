import { registerPlugin } from '@capacitor/core';

interface SharedStoragePlugin {
  set(options: { key: string; value: string }): Promise<void>;
}

const SharedStorage = registerPlugin<SharedStoragePlugin>('SharedStorage');

export const saveMealToWidget = async (data: object) => {
  try {
    console.log('Saving meal to widget:', JSON.stringify(data));
    await SharedStorage.set({
      key: 'mealWeekPlanner',
      value: JSON.stringify(data)
    });
    console.log('Saved successfully!');
  } catch (e) {
    console.log('Widget sync error:', e);
  }
};