# Примеры Использования API

## 📚 Содержание
1. [Базовая Настройка](#базовая-настройка)
2. [Сценарии Использования](#сценарии-использования)
3. [Коды Ошибок](#коды-ошибок)
4. [React Hooks Примеры](#react-hooks-примеры)

---

## 🛠️ Базовая Настройка

### API Client Setup
```typescript
// client/src/lib/api.ts
const API_BASE = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = localStorage.getItem('authToken'); // или ваш метод хранения токена
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return response.json();
  }

  // Players
  async getMyProfile() {
    return this.request<ProfileResponse>('/players/me');
  }

  async updateProfile(data: UpdateProfileData) {
    return this.request<PlayerResponse>('/players/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getPlayerById(id: string) {
    return this.request<PlayerResponse>(`/players/${id}`);
  }

  // Clans
  async getClans(params?: { search?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ClansResponse>(`/clans?${query}`);
  }

  async getClan(id: string) {
    return this.request<ClanDetailResponse>(`/clans/${id}`);
  }

  async createClan(data: CreateClanData) {
    return this.request<ClanResponse>('/clans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClan(id: string, data: UpdateClanData) {
    return this.request<ClanResponse>(`/clans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteClan(id: string) {
    return this.request<void>(`/clans/${id}`, {
      method: 'DELETE',
    });
  }

  // Clan Members
  async getClanMembers(clanId: string, sortBy?: string) {
    const query = sortBy ? `?sortBy=${sortBy}` : '';
    return this.request<ClanMembersResponse>(`/clans/${clanId}/members${query}`);
  }

  async updateMemberRole(clanId: string, memberId: string, role: string) {
    return this.request<MemberResponse>(`/clans/${clanId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async removeMember(clanId: string, memberId: string) {
    return this.request<void>(`/clans/${clanId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async leaveClan(clanId: string) {
    return this.request<void>(`/clans/${clanId}/leave`, {
      method: 'POST',
    });
  }

  // Applications
  async getClanApplications(clanId: string) {
    return this.request<ApplicationsResponse>(`/clans/${clanId}/applications`);
  }

  async applyToClan(clanId: string, message: string) {
    return this.request<ApplicationResponse>(`/clans/${clanId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async acceptApplication(clanId: string, appId: string) {
    return this.request<MemberResponse>(`/clans/${clanId}/applications/${appId}/accept`, {
      method: 'POST',
    });
  }

  async rejectApplication(clanId: string, appId: string) {
    return this.request<void>(`/clans/${clanId}/applications/${appId}/reject`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
```

---

## 🎯 Сценарии Использования

### Сценарий 1: Гость Просматривает Кланы и Подает Заявку

```typescript
// 1. Загрузка списка кланов
const clansResponse = await api.getClans({ limit: 10 });
console.log(clansResponse.clans);
// [
//   { id: 'alpha', name: 'Отряд Альфа', tag: 'ALPHA', ... },
//   { id: 'df', name: 'Delta Force', tag: 'DF', ... }
// ]

// 2. Просмотр деталей выбранного клана
const clanDetails = await api.getClan('alpha');
console.log(clanDetails);
// {
//   clan: { id: 'alpha', name: 'Отряд Альфа', ... },
//   owner: { id: '...', username: 'CommanderX' },
//   members: [
//     { username: 'TacticalViper', role: 'Офицер', ... }
//   ],
//   stats: { totalMembers: 5, onlineMembers: 3, ... }
// }

// 3. Подача заявки
const application = await api.applyToClan('alpha', 
  'Хочу в крутой клан, играю каждый день! У меня 100+ часов и KD 1.5'
);
console.log(application);
// {
//   application: {
//     id: 'app-uuid',
//     clanId: 'alpha',
//     playerId: 'my-uuid',
//     message: '...',
//     status: 'pending',
//     createdAt: '2024-11-20T10:00:00Z'
//   }
// }
```

### Сценарий 2: Owner Управляет Заявками

```typescript
// 1. Просмотр заявок
const applicationsResponse = await api.getClanApplications('alpha');
console.log(applicationsResponse.applications);
// [
//   {
//     id: 'app-101',
//     player: { id: '...', username: 'Rookie_One', avatarUrl: '...' },
//     message: 'Хочу в крутой клан!',
//     status: 'pending',
//     createdAt: '2024-11-20T08:00:00Z',
//     stats: { kills: 150, kd: 1.1, hours: '5д 0ч', ... }
//   }
// ]

// 2. Принять заявку
const newMember = await api.acceptApplication('alpha', 'app-101');
console.log(newMember);
// {
//   member: {
//     id: 'member-uuid',
//     clanId: 'alpha',
//     playerId: 'player-uuid',
//     role: 'Рекрут',
//     joinedAt: '2024-11-20T10:00:00Z'
//   }
// }

// 3. Отклонить заявку
await api.rejectApplication('alpha', 'app-102');
```

### Сценарий 3: Owner Управляет Составом Клана

```typescript
// 1. Получить список членов с сортировкой по K/D
const membersResponse = await api.getClanMembers('alpha', 'kd');
console.log(membersResponse.members);
// [
//   { username: 'SniperWolf', role: 'Боец', stats: { kd: 1.5 }, ... },
//   { username: 'TacticalViper', role: 'Офицер', stats: { kd: 0.31 }, ... }
// ]

// 2. Повысить члена до офицера
const updatedMember = await api.updateMemberRole(
  'alpha',
  'member-uuid',
  'Офицер'
);
console.log(updatedMember);
// {
//   member: {
//     id: 'member-uuid',
//     role: 'Офицер',
//     ...
//   }
// }

// 3. Исключить члена из клана
await api.removeMember('alpha', 'bad-member-uuid');
```

### Сценарий 4: Owner Обновляет Настройки Клана

```typescript
// 1. Обновить баннер и описание
const updatedClan = await api.updateClan('alpha', {
  description: 'Обновленное описание нашего элитного отряда',
  bannerUrl: 'https://example.com/new-banner.png',
  discordLink: 'https://discord.gg/new-link',
  requirements: '150ч+, KD > 1.2'
});

console.log(updatedClan);
// {
//   clan: {
//     id: 'alpha',
//     description: 'Обновленное описание...',
//     updatedAt: '2024-11-20T10:30:00Z',
//     ...
//   }
// }
```

### Сценарий 5: Игрок Обновляет Свой Профиль

```typescript
// 1. Получить текущий профиль
const profile = await api.getMyProfile();
console.log(profile);
// {
//   player: {
//     id: 'my-uuid',
//     username: 'TacticalViper',
//     level: 52,
//     xp: 6800,
//     ...
//   },
//   stats: {
//     kills: 1245,
//     deaths: 892,
//     kd: 1.42,
//     ...
//   },
//   clan: {
//     id: 'alpha',
//     name: 'Отряд Альфа',
//     role: 'Офицер'
//   }
// }

// 2. Обновить никнейм и аватар
const updatedPlayer = await api.updateProfile({
  username: 'NewTacticalViper',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewSeed'
});

console.log(updatedPlayer);
// {
//   player: {
//     username: 'NewTacticalViper',
//     avatarUrl: 'https://...',
//     updatedAt: '2024-11-20T10:45:00Z',
//     ...
//   }
// }
```

### Сценарий 6: Member Покидает Клан

```typescript
// Покинуть текущий клан
await api.leaveClan('alpha');

// После этого clan в профиле станет null
const profile = await api.getMyProfile();
console.log(profile.clan); // null
```

---

## ⚠️ Коды Ошибок

### HTTP Status Codes
```typescript
200 OK                  // Успешный запрос
201 Created            // Ресурс создан
204 No Content         // Успешное удаление
400 Bad Request        // Невалидные данные
401 Unauthorized       // Не авторизован
403 Forbidden          // Нет прав доступа
404 Not Found          // Ресурс не найден
409 Conflict           // Конфликт (например, клан уже существует)
422 Unprocessable      // Валидация не пройдена
500 Internal Error     // Ошибка сервера
```

### Примеры Ошибок

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Invalid request body",
  "details": [
    {
      "field": "message",
      "error": "Message is required"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication token is missing or invalid"
}
```

#### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to perform this action"
}
```

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Clan with id 'xyz' not found"
}
```

#### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "You are already a member of a clan"
}
```

#### 422 Unprocessable Entity
```json
{
  "error": "Validation Error",
  "message": "Clan tag must be 2-6 characters",
  "field": "tag"
}
```

### Обработка Ошибок в Коде

```typescript
try {
  await api.applyToClan('alpha', 'My message');
} catch (error) {
  if (error.message.includes('already a member')) {
    toast.error('Вы уже состоите в клане');
  } else if (error.message.includes('already applied')) {
    toast.error('Вы уже подали заявку в этот клан');
  } else {
    toast.error('Произошла ошибка при подаче заявки');
  }
}
```

---

## 🪝 React Hooks Примеры

### useProfile Hook
```typescript
// client/src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getMyProfile(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile: data?.player,
    stats: data?.stats,
    clan: data?.clan,
    isLoading,
    error,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
```

### useClans Hook
```typescript
// client/src/hooks/useClans.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useClans(params?: { search?: string }) {
  return useQuery({
    queryKey: ['clans', params],
    queryFn: () => api.getClans(params),
  });
}

export function useClan(clanId: string) {
  return useQuery({
    queryKey: ['clan', clanId],
    queryFn: () => api.getClan(clanId),
    enabled: !!clanId,
  });
}
```

### useClanApplications Hook
```typescript
// client/src/hooks/useClanApplications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useClanApplications(clanId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['applications', clanId],
    queryFn: () => api.getClanApplications(clanId),
    enabled: !!clanId,
  });

  const acceptMutation = useMutation({
    mutationFn: (appId: string) => api.acceptApplication(clanId, appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', clanId] });
      queryClient.invalidateQueries({ queryKey: ['clan', clanId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (appId: string) => api.rejectApplication(clanId, appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', clanId] });
    },
  });

  return {
    applications: data?.applications || [],
    isLoading,
    acceptApplication: acceptMutation.mutate,
    rejectApplication: rejectMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
```

### useClanMembers Hook
```typescript
// client/src/hooks/useClanMembers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useClanMembers(clanId: string, sortBy?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['members', clanId, sortBy],
    queryFn: () => api.getClanMembers(clanId, sortBy),
    enabled: !!clanId,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      api.updateMemberRole(clanId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', clanId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => api.removeMember(clanId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', clanId] });
      queryClient.invalidateQueries({ queryKey: ['clan', clanId] });
    },
  });

  return {
    members: data?.members || [],
    isLoading,
    updateRole: updateRoleMutation.mutate,
    removeMember: removeMutation.mutate,
  };
}
```

### Использование в Компоненте

```tsx
// client/src/pages/profile.jsx
import { useProfile } from '@/hooks/useProfile';
import { useClans } from '@/hooks/useClans';
import { useClanApplications } from '@/hooks/useClanApplications';

export default function ProfilePage() {
  const { profile, stats, clan, isLoading } = useProfile();
  const { data: clansData } = useClans();
  const { applications, acceptApplication, rejectApplication } = 
    useClanApplications(clan?.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{profile.username}</h1>
      <p>Level: {profile.level}</p>
      <p>Kills: {stats.kills}</p>
      
      {applications.map(app => (
        <div key={app.id}>
          <p>{app.player.username}: {app.message}</p>
          <button onClick={() => acceptApplication(app.id)}>
            Accept
          </button>
          <button onClick={() => rejectApplication(app.id)}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔐 Безопасность

### CSRF Protection
```typescript
// Если используете cookie-based auth
app.use(csrf());

// В API клиенте
headers: {
  'X-CSRF-Token': getCsrfToken(),
}
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // макс 100 запросов
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### Input Sanitization
```typescript
import { z } from 'zod';

const applySchema = z.object({
  message: z.string()
    .min(10, 'Message too short')
    .max(500, 'Message too long')
    .refine(val => !val.includes('<script'), 'Invalid characters'),
});
```

---

**Готово к использованию!** 🚀  
Этот API предоставляет все необходимые endpoints для полнофункционального компонента профиля и управления кланами.
