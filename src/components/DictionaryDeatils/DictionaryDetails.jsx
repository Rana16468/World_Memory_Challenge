import React, { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Play, Pause } from 'lucide-react';
import { useParams } from 'react-router-dom';

const DictionaryDetails = () => {
  const [dictionaryData, setDictionaryData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = useRef(null);

  let {search}=useParams() ;

  if(!search){
     search="round"
  }


  

  useEffect(() => {
    // Auto-search on component mount if there's a search parameter
    if (search) {
      setSearchTerm(search);
      fetchDictionaryData(search);
    }
  }, [search]);

  const fetchDictionaryData = async (word) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_DICTIONARY_API_URL}/${word}`);
      if (!response.ok) {
        throw new Error('Word not found');
      }
      const data = await response.json();
      setDictionaryData(data);
    } catch (err) {
      setError(err.message);
      setDictionaryData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      fetchDictionaryData(searchTerm.trim());
    }
  };

  const playAudio = (audioUrl, audioId) => {
    if (playingAudio === audioId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play().catch(err => {
        console.error('Audio playback failed:', err);
        setPlayingAudio(null);
      });
      setPlayingAudio(audioId);
      
      audioRef.current.onended = () => {
        setPlayingAudio(null);
      };
    }
  };

  const getPartOfSpeechColor = (pos) => {
    const colors = {
      'noun': 'bg-blue-500 text-white',
      'verb': 'bg-green-500 text-white',
      'adjective': 'bg-purple-500 text-white',
      'adverb': 'bg-orange-500 text-white',
      'interjection': 'bg-pink-500 text-white',
      'preposition': 'bg-yellow-500 text-white',
      'conjunction': 'bg-indigo-500 text-white',
      'pronoun': 'bg-red-500 text-white'
    };
    return colors[pos] || 'bg-gray-500 text-white';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto flex flex-col">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Dictionary</h1>
          </div>
          
          {/* Inline Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search word..."
                className="w-full px-4 py-2 pr-12 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 rounded-lg focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-white/30 text-white rounded-md hover:bg-white/40 disabled:bg-gray-400/50 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Panel - Word Info */}
          {dictionaryData && (
            <div className="w-1/3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="h-full flex flex-col">
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold text-white mb-2">{dictionaryData[0].word}</h2>
                  {dictionaryData[0].phonetic && (
                    <p className="text-white/80 text-lg mb-3">{dictionaryData[0].phonetic}</p>
                  )}
                  
                  {/* Audio Controls */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {dictionaryData[0].phonetics?.map((phonetic, phoneticIndex) => (
                      phonetic.audio && (
                        <button
                          key={phoneticIndex}
                          onClick={() => playAudio(phonetic.audio, `0-${phoneticIndex}`)}
                          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-sm text-white transition-colors"
                        >
                          {playingAudio === `0-${phoneticIndex}` ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          <span className="text-xs">{phonetic.text || 'Play'}</span>
                        </button>
                      )
                    ))}
                  </div>
                </div>

                {/* Parts of Speech Overview */}
                <div className="flex-1 overflow-y-auto">
                  <h3 className="text-white font-semibold mb-2">Parts of Speech</h3>
                  <div className="space-y-2">
                    {dictionaryData[0].meanings?.map((meaning, meaningIndex) => (
                      <div key={meaningIndex} className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPartOfSpeechColor(meaning.partOfSpeech)}`}>
                          {meaning.partOfSpeech}
                        </span>
                        <span className="text-white/80 text-sm">
                          {meaning.definitions?.length || 0} definitions
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Source */}
                {dictionaryData[0].sourceUrls && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-white/60 text-xs">
                      Source: <a href={dictionaryData[0].sourceUrls[0]} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white underline">
                        Dictionary API
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Panel - Definitions */}
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            {loading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white/80">Searching...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="h-full flex items-center justify-center">
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                  <p className="text-red-200">Error: {error}</p>
                </div>
              </div>
            )}

            {dictionaryData && (
              <div className="h-full overflow-y-auto">
                <h3 className="text-white font-semibold mb-4 sticky top-0 bg-white/10 backdrop-blur-sm -mx-4 px-4 py-2">
                  Definitions & Examples
                </h3>
                
                <div className="space-y-4">
                  {dictionaryData[0].meanings?.map((meaning, meaningIndex) => (
                    <div key={meaningIndex} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPartOfSpeechColor(meaning.partOfSpeech)}`}>
                          {meaning.partOfSpeech}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {meaning.definitions?.slice(0, 3).map((def, defIndex) => (
                          <div key={defIndex} className="bg-white/5 rounded p-2">
                            <p className="text-white text-sm mb-1">{def.definition}</p>
                            {def.example && (
                              <p className="text-white/70 italic text-xs">
                                "{def.example}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Synonyms and Antonyms in compact format */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {meaning.synonyms && meaning.synonyms.length > 0 && (
                          <div className="bg-green-500/20 rounded p-2">
                            <h4 className="text-green-200 font-medium text-xs mb-1">Synonyms</h4>
                            <div className="flex flex-wrap gap-1">
                              {meaning.synonyms.slice(0, 3).map((synonym, synIndex) => (
                                <span key={synIndex} className="bg-green-500/30 text-green-100 px-1 py-0.5 rounded text-xs">
                                  {synonym}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {meaning.antonyms && meaning.antonyms.length > 0 && (
                          <div className="bg-red-500/20 rounded p-2">
                            <h4 className="text-red-200 font-medium text-xs mb-1">Antonyms</h4>
                            <div className="flex flex-wrap gap-1">
                              {meaning.antonyms.slice(0, 3).map((antonym, antIndex) => (
                                <span key={antIndex} className="bg-red-500/30 text-red-100 px-1 py-0.5 rounded text-xs">
                                  {antonym}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!dictionaryData && !loading && !error && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white/80" />
                  </div>
                  <p className="text-white/80">Search for a word to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictionaryDetails;