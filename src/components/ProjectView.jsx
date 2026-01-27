// src/components/ProjectView.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProjectView({ project, onProjectUpdate }) {
  const [name, setName] = useState(project?.name || '');
  const [desc, setDesc] = useState(project?.description || '');
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setDesc(project.description);
    loadFiles();
    loadMessages();
  }, [project]);

  const loadFiles = async () => {
    const { data } = await supabase.storage.from('project-files').list(project.id);
    setFiles(data || []);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const handleSave = async () => {
    await supabase.from('projects').update({ name, description }).eq('id', project.id);
    onProjectUpdate();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { error } = await supabase.storage
      .from('project-files')
      .upload(`${project.id}/${file.name}`, file, { upsert: true });
    if (!error) {
      loadFiles();
    } else {
      console.error('Ошибка загрузки файла:', error);
      alert('Не удалось загрузить файл');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !project) return;

    const userMsg = { role: 'user', content: input, project_id: project.id };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    // Сохраняем сообщение пользователя
    await supabase.from('messages').insert(userMsg);

    try {
      // ✅ ТОЧНЫЙ REFERER — без пробелов, как в адресной строке Railway
      const HTTP_REFERER = "https://jarvis-projects-production35.up.railway.app";

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": HTTP_REFERER, // ← критически важно: без пробелов!
          "X-Title": "JARVIS Projects"
        },
        body: JSON.stringify({
          model: "qwen/qwen-3-32b",
          messages: [{ role: "user", content: input }]
        })
      });

      let aiReply = "ИИ не вернул ответ.";

      if (response.ok) {
        const data = await response.json();
        aiReply = data?.choices?.[0]?.message?.content?.trim() || "Пустой ответ от ИИ.";
      } else {
        const errorData = await response.json().catch(() => ({}));
        aiReply = `Ошибка OpenRouter (${response.status}): ${errorData.detail || "Неверный запрос."}`;
      }

      const aiMsg = { role: 'assistant', content: aiReply, project_id: project.id };
      setMessages((prev) => [...prev, aiMsg]);
      await supabase.from('messages').insert(aiMsg);

    } catch (err) {
      console.error("Сетевая ошибка:", err);
      const errorMsg = {
        role: 'assistant',
        content: "❌ Не удалось подключиться к ИИ. Проверьте интернет.",
        project_id: project.id,
      };
      setMessages((prev) => [...prev, errorMsg]);
      await supabase.from('messages').insert(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-900">
        Выберите проект
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Шапка */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          className="text-xl font-bold bg-transparent w-full outline-none text-white"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={handleSave}
          placeholder="Описание проекта"
          className="mt-2 w-full bg-transparent text-gray-400 outline-none resize-none"
          rows="2"
        />
      </div>

      {/* Файлы */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <label className="block text-sm text-gray-400 mb-1">Файлы</label>
        <div className="flex gap-2 flex-wrap">
          {files.map((f) => (
            <span
              key={f.name}
              className="text-xs bg-gray-700 px-2 py-1 rounded border border-gray-600 cursor-pointer text-gray-200"
              title={f.name}
            >
              📄 {f.name.length > 15 ? f.name.slice(0, 12) + "..." : f.name}
            </span>
          ))}
        </div>
        <input
          type="file"
          onChange={handleFileUpload}
          className="mt-2 text-sm text-gray-400"
        />
      </div>

      {/* Чат */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded max-w-[80%] ${
              m.role === "user"
                ? "bg-gray-800 text-gray-100 ml-auto"
                : "bg-blue-900 text-gray-100 mr-auto"
            }`}
          >
            {m.content}
          </div>
        ))}
        {isSending && (
          <div className="p-3 rounded bg-blue-900 text-gray-100 mr-auto max-w-[80%]">
            JARVIS думает...
          </div>
        )}
      </div>

      {/* Ввод */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isSending && sendMessage()}
            placeholder="Спроси JARVIS..."
            disabled={isSending}
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 outline-none text-white"
          />
          <button
            onClick={sendMessage}
            disabled={isSending || !input.trim()}
            className={`px-4 rounded font-medium transition ${
              isSending || !input.trim()
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isSending ? "⏳" : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}
