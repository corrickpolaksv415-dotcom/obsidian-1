export interface Diary {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  tags: string[];
}

export interface AutoTagRule {
  id: string;
  keyword: string;
  tag: string;
}

export interface AppState {
  diaries: Diary[];
  trackedNames: string[];
  autoTagRules: AutoTagRule[];
  autoTagNames: boolean;
  addDiary: (diary: Omit<Diary, 'id'>) => void;
  updateDiary: (id: string, diary: Partial<Diary>) => void;
  deleteDiary: (id: string) => void;
  addTrackedName: (name: string) => void;
  removeTrackedName: (name: string) => void;
  addAutoTagRule: (rule: Omit<AutoTagRule, 'id'>) => void;
  removeAutoTagRule: (id: string) => void;
  setAutoTagNames: (val: boolean) => void;
  importDiaries: (importedDate: Diary[]) => void;
}
