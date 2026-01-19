
import React from 'react';

interface HeaderProps {
  isSpeaking?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSpeaking }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 relative overflow-hidden">
            <i className="fas fa-graduation-cap text-white text-xl z-10"></i>
            {isSpeaking && (
              <div className="absolute inset-0 bg-indigo-400 animate-ping opacity-20"></div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
              Khalid
              {isSpeaking && (
                <span className="flex gap-0.5 items-center px-2 py-0.5 bg-indigo-50 text-[10px] text-indigo-600 rounded-full animate-pulse border border-indigo-100">
                  <span className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce"></span>
                  SPEAKING
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Your Real-Time English Mentor</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-indigo-500 animate-ping' : 'bg-green-500'} transition-colors`}></div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {isSpeaking ? 'Khalid Speaking' : 'AI Live'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
