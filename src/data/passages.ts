export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Passage {
  id: string;
  difficulty: Difficulty;
  category: 'prose' | 'code' | 'lyrics';
  text: string;
}

export const passages: Passage[] = [
  {
    id: 'p1',
    difficulty: 'easy',
    category: 'prose',
    text: 'The quick brown fox jumps over the lazy dog near the river bank.',
  },
  {
    id: 'p2',
    difficulty: 'medium',
    category: 'prose',
    text: 'To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune.',
  },
  {
    id: 'p3',
    difficulty: 'hard',
    category: 'code',
    text: 'const fibonacci = (n: number): number => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);',
  },
];

export const getByDifficulty = (difficulty: Difficulty): Passage[] =>
  passages.filter(p => p.difficulty === difficulty);

export const getRandom = (difficulty: Difficulty): Passage => {
  const filtered = getByDifficulty(difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
};