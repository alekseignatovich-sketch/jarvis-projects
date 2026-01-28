const speak = (text) => {
  if (!voiceEnabled) return;

  // Останавливаем предыдущую речь
  window.speechSynthesis?.cancel();

  // Пытаемся использовать ttsMP3 (бесплатно, русский голос)
  const voice = 'Maxim'; // или 'Tatyana', 'Irina', 'Pavel' — проверь на сайте варианты
  const url = `https://ttsmp3.com/makemp3_new.php?msg=${encodeURIComponent(text)}&lang=ru-RU&source=ttsmp3&voice=${voice}&pitch=0&rate=0&volume=0`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.url) {
        const audio = new Audio(data.url);
        audio.play().catch(err => console.error('Audio play error:', err));
      } else {
        // fallback на браузерный TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        window.speechSynthesis.speak(utterance);
      }
    })
    .catch(err => {
      console.error('ttsMP3 error:', err);
      // fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      window.speechSynthesis.speak(utterance);
    });
};
