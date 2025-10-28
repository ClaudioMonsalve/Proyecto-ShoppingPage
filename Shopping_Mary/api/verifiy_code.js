let codes = {};

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, code } = req.body;

  if (codes[email] && Number(code) === codes[email]) {
    delete codes[email];
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
}
