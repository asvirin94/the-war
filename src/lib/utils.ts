import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const createLobby = async (lobbyName: string, password: string) => {
  try {
    const response = await fetch('http://109.73.199.202/lobby/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: lobbyName,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error('Ошибка создания лобби');
    }

    const data = await response.json();
    console.log('Лобби создано!', data);
  } catch (error) {
    console.error('Ошибка при создании лобби:', error);
  }
};

export const getLobbies = async () => {
  const response = await fetch('http://109.73.199.202/lobby/list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return await response.json();
}

