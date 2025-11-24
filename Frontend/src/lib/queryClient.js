import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    
    try {
      const text = await res.text();
      if (text) {
        const json = JSON.parse(text);
        errorMessage = json.error || json.message || text;
      }
    } catch (e) {
      errorMessage = await res.text() || res.statusText;
    }
    
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method,
  url,
  data,
) {
  const headers = data ? { "Content-Type": "application/json" } : {};
  
  // Добавляем Authorization токен из localStorage
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  const responseData = await res.json();
  
  // Автоматически распаковываем {success, ...} формат
  if (responseData && typeof responseData === 'object' && responseData.success === true) {
    const { success, ...rest } = responseData;
    const keys = Object.keys(rest);
    if (keys.length === 1) {
      return rest[keys[0]];
    }
    return rest;
  }
  
  return responseData;
}

export const getQueryFn =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers = {};
    
    // Добавляем Authorization токен из localStorage
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch(queryKey.join("/"), {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    
    // Автоматически распаковываем {success, ...} формат
    // Если есть success: true, возвращаем остальные поля
    if (data && typeof data === 'object' && data.success === true) {
      // Удаляем success из результата и возвращаем остальное
      const { success, ...rest } = data;
      // Если остался только один ключ (например {clan: {...}}), возвращаем его значение
      const keys = Object.keys(rest);
      if (keys.length === 1) {
        return rest[keys[0]];
      }
      return rest;
    }
    
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
