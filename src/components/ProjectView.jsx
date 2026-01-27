// src/components/ProjectView.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';  // ← новый импорт

const APP_URL = "https://jarvis-projects-production33.up.railway.app";

export default function ProjectView({ project, onProjectUpdate }) {
  const [name, setName] = useState(project?.name || '');
  const [desc, setDesc] = useState(project?.description || '');
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'ru-RU',  // или 'en-US' / 'uk-UA' и т.д.
    continuous: true,
    interimResults: true,
    onFinalTranscript: (final) => {
      // Можно сразу добавлять в input или отправлять — здесь просто обновляем
      setInput((prev) => (prev + ' ' + final).trim());
    },
  });

  useEffect(() => {
    if (!project) return;

    setName(project.name || '');
    setDesc(project.description || '');
    loadFiles();
    loadMessages();
  }, [project]);

  const loadFiles = async () => {
    if (!project?.id) return;
    const { data } = await supabase.storage.from('project-files').list(project.id);
    setFiles(data || []);
  };

  const loadMessages = async () => {
    if (!project?.id) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const handleSave = async () => {
    if (!project?.id) return;
    await supabase
      .from('projects')
      .update({ name, description: desc })
      .eq('id', project.id);
    onProjectUpdate?.();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !project?.id) return;

    const filePath = `${project.id}/${file.name}`;

    const { error } = await supabase.storage
      .from('project-files')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error('Ошибка загрузки файла:', error);
      alert('Не удалось загрузить файл');
    } else {
      loadFiles();
    }
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !project?.id || isSending) return;

    const userMessage = {
      role: 'user',
      content: trimmedInput,
      project_id: project.id,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      await supabase.from('messages').insert(userMessage);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": APP_URL,
          "X-Title": "JARVIS Projects",
        },
        body: JSON.stringify({
          model: "qwen/qwen3-coder:free",  // бесплатная, мощная, актуальная на 2026
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })).concat({ role: "user", content: trimmedInput }),
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter ошибка ${response.status}: ${errData.error?.message || errData.detail || 'неизвестно'}`
        );
      }

      const data = await response.json();
      const aiReply = data?.choices?.[0]?.message?.content?.trim() || "—";

      const aiMessage = {
        role: 'assistant',
        content: aiReply,
        project_id: project.id,
      };

      setMessages((prev) => [...prev, aiMessage]);
      await supabase.from('messages').insert(aiMessage);
    } catch (err) {
      console.error("Ошибка при запросе к ИИ:", err);

      const errorMessage = {
        role: 'assistant',
        content: `❌ Ошибка связи с JARVIS:\n${err.message || 'проверьте ключ / модель / интернет'}`,
        project_id: project.id,
      };

      setMessages((prev) => [...prev, errorMessage]);
      await supabase.from('messages').insert(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Выберите проект
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Шапка проекта */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          className="text-xl font-bold bg-transparent w-full outline-none"
          placeholder="Название проекта"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={handleSave}
          placeholder="Описание проекта..."
          className="mt-2 w-full bg-transparent text-gray-400 outline-none resize-none"
          rows={2}
        />
      </div>

      {/* Файлы */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <label className="block text-sm text-gray-400 mb-1">Файлы проекта</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file) => (
            <span
              key={file.name}
              className="text-xs bg-gray-700 px-3 py-1 rounded border border-gray-600 text-gray-200 cursor-default"
              title={file.name}
            >
              📄 {file.name.length > 18 ? file.name.slice(0, 15) + '...' : file.name}
            </span>
          ))}
        </div>
        <input
          type="file"
          onChange={handleFileUpload}
          className="text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
        />
      </div>

      {/* Чат */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-gray-800 text-gray-100 ml-auto'
                : 'bg-blue-950 text-gray-100 mr-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {isSending && (
          <div className="p-3 rounded-lg bg-blue-950 text-gray-100 mr-auto max-w-[85%]">
            JARVIS думает...
          </div>
        )}
      </div>

      {/* Поле ввода + микрофон */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Спроси JARVIS о проекте... (или говори голосом)"
            disabled={isSending}
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 outline-none text-white placeholder-gray-500 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`px-4 py-2 rounded transition min-w-[60px] ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
            title={isListening ? 'Остановить запись' : 'Начать голосовой ввод'}
            disabled={isSending}
          >
            {isListening ? '🛑' : '🎤'}
          </button>

          <button
            onClick={sendMessage}
            disabled={isSending || !input.trim()}
            className={`px-5 py-2 rounded font-medium transition min-w-[90px] ${
              isSending || !input.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isSending ? '⏳' : 'Отправить'}
          </button>
        </div>

        {/* Показываем текущий распознанный текст (промежуточный) */}
        {isListening && transcript && (
          <div className="mt-2 text-sm text-gray-400">
            Распознано: {transcript}
          </div>
        )}
      </div>
    </div>
  );
}
