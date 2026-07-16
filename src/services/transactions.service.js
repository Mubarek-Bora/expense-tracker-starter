const API_URL = import.meta.env.VITE_API_URL;

async function request(path, token, options = {}) {
  const res = await fetch(`${API_URL}/api/transactions${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function getTransactions(token) {
  return request('', token);
}

export function createTransaction(token, transaction) {
  return request('', token, { method: 'POST', body: JSON.stringify(transaction) });
}

export function deleteTransaction(token, id) {
  return request(`/${id}`, token, { method: 'DELETE' });
}

export function createTransactionFromText(token, text) {
  return request('/ai', token, { method: 'POST', body: JSON.stringify({ text }) });
}
