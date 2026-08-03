import { put, list } from '@vercel/blob';

const BLOB_PATH = 'tablero-data.json';

const JULY_SEED = {
  'm-chats': '1173', 'm-inv': '303', 'x-reg-m': '35',
  'e-visits': '716', 'e-leads': '78', 'e-inv': '41',
  'c-visits': '166', 'c-leads': '86', 'c-inv': '0',
  'em-sent': '63000', 'em-open': '5688', 'em-click': '350', 'em-inv': '382', 'x-reg-em': '6',
  'x-reg-wa': '7',
  'x-mem-org': '10', 'x-dip-org': '4'
};

const DEFAULT_DATA = { months: { '2025-07': JULY_SEED }, config: {} };

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
      if (!blobs.length) {
        return res.status(200).json(DEFAULT_DATA);
      }
      const response = await fetch(blobs[0].url, { cache: 'no-store' });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'No se pudo leer el almacenamiento compartido.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (!body || typeof body !== 'object' || !body.months || !body.config) {
        return res.status(400).json({ error: 'Formato inválido.' });
      }
      await put(BLOB_PATH, JSON.stringify(body), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'No se pudo guardar en el almacenamiento compartido.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end('Method Not Allowed');
}
