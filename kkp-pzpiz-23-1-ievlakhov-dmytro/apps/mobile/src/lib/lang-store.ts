import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'warehouse.lang';

export async function getStoredLang(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}

export async function setStoredLang(lang: string): Promise<void> {
  await AsyncStorage.setItem(KEY, lang);
}
