
import { 
  Rocket, 
  Target, 
  Gamepad2, 
  Zap, 
  Shield, 
  Star, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Space,
  Gauge,
  Trophy,
  X
} from 'lucide-react';

const DynamicNeuroverseModa = ({ isOpen, setIsOpen}) => {
 

  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Trigger button for demo */}
    

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-11/12 max-w-4xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white border border-blue-400/30 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Dynamic Asteroid Defense: NASA Edition
                  </h3>
                </div>
                <button 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-red-500/20 transition-colors"
                  onClick={closeModal}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Game Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                
                {/* Objective */}
                <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <h4 className="font-semibold text-blue-300">Objective</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Destroy incoming asteroids</li>
                    <li>• Protect Earth from impact</li>
                    <li>• Survive with 3 lives</li>
                    <li>• Maximize your score</li>
                  </ul>
                </div>

                {/* Controls */}
                <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-4 h-4 text-green-400" />
                    <h4 className="font-semibold text-green-300">Controls</h4>
                  </div>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <ArrowUp className="w-3 h-3" />
                        <ArrowDown className="w-3 h-3" />
                        <ArrowLeft className="w-3 h-3" />
                        <ArrowRight className="w-3 h-3" />
                      </div>
                      <span>Move</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Space className="w-3 h-3" />
                      <span>Fire weapons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      <span>SHIFT: Speed boost</span>
                    </div>
                  </div>
                </div>

                {/* Asteroid Types */}
                <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-red-400" />
                    <h4 className="font-semibold text-red-300">Asteroid Types</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• <span className="text-gray-400">Gray:</span> Regular (100pts)</li>
                    <li>• <span className="text-red-400">Red:</span> Hazardous (200pts)</li>
                    <li>• <span className="text-orange-400">Orange:</span> Split type</li>
                    <li>• <span className="text-blue-400">Blue:</span> Shield type</li>
                  </ul>
                </div>

                {/* Power-ups */}
                <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <h4 className="font-semibold text-yellow-300">Power-ups</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• <span className="text-yellow-400">⚡</span> Rapid Fire (10s)</li>
                    <li>• <span className="text-purple-400">🎯</span> Triple Shot (8s)</li>
                    <li>• <span className="text-cyan-400">🛡️</span> Shield (5s)</li>
                    <li>• <span className="text-red-400">💥</span> Nuke (5s)</li>
                  </ul>
                </div>

                {/* Scoring */}
                <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <h4 className="font-semibold text-purple-300">Scoring</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Combo multiplier: +0.1x per hit</li>
                    <li>• Max combo: 5.0x</li>
                    <li>• Combo resets after 3s</li>
                    <li>• Hazardous = 2x points</li>
                  </ul>
                </div>

                {/* Strategy Tips */}
                <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-semibold text-cyan-300">Pro Tips</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Maintain combo chains</li>
                    <li>• Target red asteroids first</li>
                    <li>• Stay mobile with SHIFT</li>
                    <li>• Collect power-ups quickly</li>
                  </ul>
                </div>

              </div>

              {/* NASA Data Info */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-300">🌌 Real NASA Data</span>
                </div>
                <p className="text-xs text-gray-300">
                  This game uses real Near-Earth Object data from NASA! Each asteroid represents an actual space rock detected by NASA's monitoring systems.
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <button 
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-none text-white rounded-lg flex items-center gap-2"
                  onClick={closeModal}
                >
                  <Rocket className="w-4 h-4" />
                  Ready to Launch!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicNeuroverseModa;