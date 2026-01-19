'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ProficiencyLevel, Topic, Message, TeacherState } from '@/types';
import Header from '@/components/Header';
import ChatBubble from '@/components/ChatBubble';
import { getTeacherResponse, generateSpeech, decodeBase64Audio } from '@/services/geminiService';

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am Khalid, your AI English Teacher. Let's practice together. How are you feeling today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [quotaReached, setQuotaReached] = useState(false);
  const [state, setState] = useState<TeacherState>({
    level: ProficiencyLevel.BEGINNER,
    topic: Topic.GREETINGS,
    isGenerating: false,
    isSpeaking: false
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const lastPlayedMessageId = useRef<string | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-play the last assistant message if voice is enabled
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (voiceEnabled && !quotaReached && lastMessage && lastMessage.role === 'assistant' && lastMessage.id !== lastPlayedMessageId.current) {
      playAudio(lastMessage.content, lastMessage.id);
    }
  }, [messages, voiceEnabled, quotaReached]);

  const stopCurrentAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    setState(prev => ({ ...prev, isSpeaking: false }));
  };

  const playAudio = async (text: string, messageId?: string) => {
    if (!voiceEnabled) return;
    
    stopCurrentAudio();
    const ctx = initAudioContext();
    
    setState(prev => ({ ...prev, isSpeaking: true }));
    if (messageId) lastPlayedMessageId.current = messageId;

    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        const buffer = await decodeBase64Audio(base64, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
          audioSourceRef.current = null;
        };
        audioSourceRef.current = source;
        source.start();
        setQuotaReached(false); // Reset if successful
      }
    } catch (error: any) {
      console.error('Speech generation failed:', error);
      setState(prev => ({ ...prev, isSpeaking: false }));
      
      // Check for quota error
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        setQuotaReached(true);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || state.isGenerating) return;

    initAudioContext();
    stopCurrentAudio();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const result = await getTeacherResponse(input, history, state.level, state.topic);
      
      const teacherMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        correction: result.correction || undefined,
        explanation: result.explanation || undefined,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, teacherMessage]);
    } catch (error) {
      console.error('Failed to get teacher response:', error);
      const errorMessage: Message = {
        id: 'error',
        role: 'assistant',
        content: "I'm sorry, I hit a snag. Could you try saying that again?",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isSpeaking={state.isSpeaking} />
      
      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-4 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Settings Panel */}
        <aside className="w-full md:w-80 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 shadow-sm overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Proficiency Level
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(ProficiencyLevel).map(l => (
                <button
                  key={l}
                  onClick={() => setState(prev => ({ ...prev, level: l }))}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                    state.level === l 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-500 ring-offset-2' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Practice Topic
            </label>
            <select
              value={state.topic}
              onChange={(e) => setState(prev => ({ ...prev, topic: e.target.value as Topic }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              {Object.values(Topic).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                AI Voice
              </label>
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${voiceEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${voiceEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              {voiceEnabled ? 'Khalid will speak his responses.' : 'Voice feedback is disabled.'}
            </p>
            {quotaReached && voiceEnabled && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-[10px] text-amber-700 font-medium leading-tight">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Audio quota reached. Continuing in text-only mode.
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto p-4 bg-indigo-50 rounded-2xl">
            <h4 className="text-sm font-bold text-indigo-900 mb-1">Learning Goal</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Today you're practicing <span className="font-bold underline">{state.topic}</span> at a <span className="font-bold underline">{state.level}</span> level. Khalid is listening!
            </p>
          </div>
        </aside>

        {/* Chat Main Area */}
        <section className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            {messages.map(msg => (
              <ChatBubble 
                key={msg.id} 
                message={msg}
                onPlayAudio={() => playAudio(msg.content, msg.id)}
                isSpeaking={state.isSpeaking}
              />
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-slate-200 p-4 sm:p-6 bg-gradient-to-b from-transparent to-slate-50">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
              <button 
                type="button"
                onClick={toggleSpeechRecognition}
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-white border border-slate-200 text-slate-400 hover:text-indigo-600'
                }`}
                title="Speak your input"
              >
                <i className={`fas ${isListening ? 'fa-microphone' : 'fa-microphone-alt'}`}></i>
              </button>
              
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : `Tell me about ${state.topic.toLowerCase()}...`}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                disabled={state.isGenerating}
              />
              
              <button
                type="submit"
                disabled={!input.trim() || state.isGenerating}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  !input.trim() || state.isGenerating
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {state.isGenerating ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
              {quotaReached ? 'Voice limited due to quota - Text mode active' : 'Audio autoplay enabled for real-time conversation'}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
