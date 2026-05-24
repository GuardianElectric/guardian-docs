export default async function handler(req, res) {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  if (!AIRTABLE_TOKEN) {
    return res.status(500).json({ error: 'AIRTABLE_TOKEN env var not set' });
  }

  const { method, query } = req;
  const { base, table, recordId, pageSize, sortField, sortDir } = query;

  if (!base || !table) {
    return res.status(400).json({ error: 'Missing required params: base, table' });
  }

  const baseUrl = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;

  let fetchUrl = recordId ? `${baseUrl}/${recordId}` : baseUrl;

  if (method === 'GET') {
    const params = new URLSearchParams();
    if (pageSize) params.set('pageSize', pageSize);
    if (sortField) {
      params.set('sort[0][field]', sortField);
      params.set('sort[0][direction]', sortDir || 'asc');
    }
    if (params.toString()) fetchUrl += `?${params}`;
  }

  const fetchOptions = {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  if (method !== 'GET' && req.body) {
    fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  const response = await fetch(fetchUrl, fetchOptions);
  const data = await response.json();
  res.status(response.status).json(data);
}
