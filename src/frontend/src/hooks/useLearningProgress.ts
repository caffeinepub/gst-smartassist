import { useState, useEffect, useCallback } from 'react';
import { Category } from '../backend';

interface LearningProgress {
  [topicTitle: string]: boolean;
}

interface CategoryProgress {
  [key: string]: LearningProgress;
}

const STORAGE_KEY = 'gst-learning-progress';

function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function loadProgress(): CategoryProgress {
  if (!isStorageAvailable()) {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    console.error('Failed to load learning progress:', error);
    return {};
  }
}

function saveProgress(progress: CategoryProgress): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save learning progress:', error);
  }
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<CategoryProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const markTopicComplete = useCallback((category: Category, topicTitle: string) => {
    setProgress((prev) => {
      const categoryKey = category.toString();
      return {
        ...prev,
        [categoryKey]: {
          ...(prev[categoryKey] || {}),
          [topicTitle]: true,
        },
      };
    });
  }, []);

  const isTopicComplete = useCallback(
    (category: Category, topicTitle: string): boolean => {
      const categoryKey = category.toString();
      return progress[categoryKey]?.[topicTitle] || false;
    },
    [progress]
  );

  const getCompletionPercentage = useCallback(
    (category: Category, totalTopics: number): number => {
      if (totalTopics === 0) return 0;
      const categoryKey = category.toString();
      const categoryProgress = progress[categoryKey] || {};
      const completedCount = Object.values(categoryProgress).filter(Boolean).length;
      return Math.round((completedCount / totalTopics) * 100);
    },
    [progress]
  );

  return {
    markTopicComplete,
    isTopicComplete,
    getCompletionPercentage,
  };
}
