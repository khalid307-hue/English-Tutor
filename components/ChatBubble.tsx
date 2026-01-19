
import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  onPlayAudio?: (text: string, messageId: string) => void;
  isSpeaking?: boolean;
  voiceEnabled?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onPlayAudio, isSpeaking, voiceEnabled = true }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-100' : 'bg-slate-100'
        } ${isSpeaking && !isUser ? 'ring-2 ring-indigo-500 ring-offset-2 animate-pulse' : ''}`}>
          <i className={`fas ${isUser ? 'fa-user text-indigo-600' : 'fa-robot text-slate-600'} text-xs`}></i>
        </div>

        <div className="flex flex-col gap-2">
          <div className={`rounded-2xl px-4 py-3 shadow-sm transition-colors duration-300 ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : isSpeaking 
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-tl-none shadow-indigo-100 shadow-md'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
          }`}>
            <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>

          {!isUser && voiceEnabled && (
            <div className="flex items-center gap-2 mt-1">
              <button 
                onClick={() => onPlayAudio?.(message.content, message.id)}
                className={`text-xs font-medium flex items-center gap-1.5 transition-all px-2 py-1 rounded-full ${
                  isSpeaking 
                    ? 'text-indigo-600 bg-indigo-50 font-bold' 
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <i className={`fas ${isSpeaking ? 'fa-volume-up scale-110' : 'fa-play'}`}></i>
                {isSpeaking ? 'Playing...' : 'Replay'}
              </button>
            </div>
          )}

          {message.correction && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-2">
                <i className="fas fa-magic text-amber-500 mt-0.5"></i>
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Teacher's Tip</h4>
                  <p className="text-sm text-slate-700 italic">"{message.correction}"</p>
                  {message.explanation && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {message.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
