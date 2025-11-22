import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

const API_URL = import.meta.env.VITE_API_URL || '';

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('access_token');
}

// Helper function to make authenticated requests
async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ===== CLAN QUERIES =====

/**
 * Получить список всех кланов
 */
export function useClans() {
  return useQuery({
    queryKey: ['/api/clans'],
    queryFn: async () => {
      const data = await fetchWithAuth(`${API_URL}/api/clans`);
      return data.clans;
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}

/**
 * Получить детали клана по ID
 */
export function useClan(clanId) {
  return useQuery({
    queryKey: ['/api/clans', clanId],
    queryFn: async () => {
      const data = await fetchWithAuth(`${API_URL}/api/clans/${clanId}`);
      return data.clan;
    },
    enabled: !!clanId,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Получить участников клана
 */
export function useClanMembers(clanId) {
  return useQuery({
    queryKey: ['/api/clans', clanId, 'members'],
    queryFn: async () => {
      const data = await fetchWithAuth(`${API_URL}/api/clans/${clanId}/members`);
      return data.members;
    },
    enabled: !!clanId,
    staleTime: 1 * 60 * 1000
  });
}

/**
 * Получить заявки клана (только для владельца)
 */
export function useClanApplications(clanId) {
  return useQuery({
    queryKey: ['/api/clans', clanId, 'applications'],
    queryFn: async () => {
      const data = await fetchWithAuth(`${API_URL}/api/clans/${clanId}/applications`);
      return data.applications;
    },
    enabled: !!clanId,
    staleTime: 30 * 1000 // 30 seconds
  });
}

/**
 * Получить приглашения клана (только для владельца)
 */
export function useClanInvitations(clanId) {
  return useQuery({
    queryKey: ['/api/clans', clanId, 'invitations'],
    queryFn: async () => {
      const data = await fetchWithAuth(`${API_URL}/api/clans/${clanId}/invitations`);
      return data.invitations;
    },
    enabled: !!clanId,
    staleTime: 30 * 1000
  });
}

/**
 * Получить мои заявки
 */
export function useMyApplications() {
  return useQuery({
    queryKey: ['/api/applications/my'],
    queryFn: async () => {
      const data = await fetchWithAuth(`${API_URL}/api/applications/my`);
      return data.applications;
    },
    staleTime: 30 * 1000
  });
}

/**
 * Получить мои приглашения
 */
export function useMyInvitations() {
  return useQuery({
    queryKey: ['/api/invitations/my'],
    queryFn: async () => {
      const data = await fetchWithAuth(`${API_URL}/api/invitations/my`);
      return data.invitations;
    },
    staleTime: 30 * 1000
  });
}

// ===== CLAN MUTATIONS =====

/**
 * Создать клан
 */
export function useCreateClan() {
  return useMutation({
    mutationFn: async (clanData) => {
      return fetchWithAuth(`${API_URL}/api/clans`, {
        method: 'POST',
        body: JSON.stringify(clanData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
    }
  });
}

/**
 * Обновить клан
 */
export function useUpdateClan(clanId) {
  return useMutation({
    mutationFn: async (updates) => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
    }
  });
}

/**
 * Удалить клан
 */
export function useDeleteClan(clanId) {
  return useMutation({
    mutationFn: async () => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
    }
  });
}

/**
 * Вступить в клан
 */
export function useJoinClan(clanId) {
  return useMutation({
    mutationFn: async () => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}/join`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'members'] });
    }
  });
}

/**
 * Покинуть клан
 */
export function useLeaveClan(clanId) {
  return useMutation({
    mutationFn: async () => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}/leave`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'members'] });
    }
  });
}

/**
 * Исключить участника
 */
export function useKickMember(clanId) {
  return useMutation({
    mutationFn: async (memberId) => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}/members/${memberId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'members'] });
    }
  });
}

/**
 * Изменить роль участника
 */
export function useChangeMemberRole(clanId) {
  return useMutation({
    mutationFn: async ({ memberId, role }) => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}/members/${memberId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'members'] });
    }
  });
}

// ===== APPLICATION MUTATIONS =====

/**
 * Подать заявку в клан
 */
export function useApplyToClan(clanId) {
  return useMutation({
    mutationFn: async (message) => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications/my'] });
    }
  });
}

/**
 * Принять заявку
 */
export function useApproveApplication(clanId) {
  return useMutation({
    mutationFn: async (applicationId) => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}/applications/${applicationId}/approve`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'members'] });
    }
  });
}

/**
 * Отклонить заявку
 */
export function useRejectApplication(clanId) {
  return useMutation({
    mutationFn: async (applicationId) => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}/applications/${applicationId}/reject`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'applications'] });
    }
  });
}

/**
 * Отозвать заявку
 */
export function useWithdrawApplication() {
  return useMutation({
    mutationFn: async (applicationId) => {
      return fetchWithAuth(`${API_URL}/api/applications/${applicationId}/withdraw`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications/my'] });
    }
  });
}

// ===== INVITATION MUTATIONS =====

/**
 * Создать приглашение
 */
export function useCreateInvitation(clanId) {
  return useMutation({
    mutationFn: async ({ playerId, message }) => {
      return fetchWithAuth(`${API_URL}/api/clans/${clanId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ player_id: playerId, message })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'invitations'] });
    }
  });
}

/**
 * Принять приглашение
 */
export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async (invitationId) => {
      return fetchWithAuth(`${API_URL}/api/invitations/${invitationId}/accept`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invitations/my'] });
      // Also refresh clan lists since user joined a clan
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
    }
  });
}

/**
 * Отклонить приглашение
 */
export function useRejectInvitation() {
  return useMutation({
    mutationFn: async (invitationId) => {
      return fetchWithAuth(`${API_URL}/api/invitations/${invitationId}/reject`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invitations/my'] });
    }
  });
}

/**
 * Отменить приглашение (только владелец)
 */
export function useCancelInvitation(clanId) {
  return useMutation({
    mutationFn: async (invitationId) => {
      return fetchWithAuth(`${API_URL}/api/invitations/${invitationId}/cancel`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans', clanId, 'invitations'] });
    }
  });
}
