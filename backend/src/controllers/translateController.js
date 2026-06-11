export const translateText = async (req, res) => {
  const { text, from, to } = req.query;

  if (!text) {
    return res.status(400).json({ message: 'Text to translate is required' });
  }

  if (!to) {
    return res.status(400).json({ message: 'Target language code (to) is required' });
  }

  try {
    const sl = from || 'auto';
    const tl = to;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Translate API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data[0]) {
      throw new Error('Invalid response from Google Translate API');
    }

    const translatedText = data[0]
      .map((item) => item[0])
      .filter(Boolean)
      .join('');

    res.json({ translatedText });
  } catch (error) {
    console.error('Translation controller error:', error);
    res.status(500).json({ message: error.message || 'Failed to translate text' });
  }
};
