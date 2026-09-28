export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { images, age, subs } = req.body || {};
  if (!images || !images.length) return res.status(400).json({ error: 'Screenshot nahi mila' });

  const prompt = `Tum ek YouTube analytics expert ho. Neeche YouTube Studio analytics ke screenshots hain.
Extra info: video upload hua ${age || 'pata nahi'} pehle, subscribers: ${subs || 'pata nahi'}.

Screenshots se views, watch time, retention, traffic sources aur graph ka trend padho. Phir Hinglish me ye batao:
1. Abhi ka snapshot (kitne views, trend badh raha hai ya gir raha hai)
2. Expected views agle 7 din me (RANGE me, jaise 8K-12K)
3. Expected views agle 30 din me (RANGE me)
4. Confidence: Low / Medium / High, aur kyun
5. 2-3 practical tips views badhane ke liye

Rules: hamesha range do, exact number nahi. Agar data kam hai to saaf bolo aur confidence low rakho. Kabhi guarantee mat do.`;

  const parts = [{ text: prompt }, ...images.map(d => ({ inline_data: { mime_type: 'image/jpeg', data: d } }))];

  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts }] })
    });
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ;
    if (!text) return res.status(500).json({ error: data?.error?.message || 'AI se jawab nahi aaya' });
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}
