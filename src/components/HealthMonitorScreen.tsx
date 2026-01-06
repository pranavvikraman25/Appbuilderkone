import { ArrowLeft, Heart, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen } from '../App';

export function HealthMonitorScreen({ 
  onNavigate,
  onAcknowledge 
}: { 
  onNavigate: (screen: Screen) => void;
  onAcknowledge: () => void;
}) {
  const [lastCheckTime, setLastCheckTime] = useState(new Date());
  const [nextCheckTime, setNextCheckTime] = useState(new Date(Date.now() + 30 * 60 * 1000));
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = nextCheckTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        const mins = Math.floor(Math.abs(diff) / 1000 / 60);
        setTimeRemaining(`Overdue by ${mins} min`);
      } else {
        const mins = Math.floor(diff / 1000 / 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeRemaining(`${mins}:${String(secs).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextCheckTime]);

  const handleAcknowledge = () => {
    const now = new Date();
    setLastCheckTime(now);
    setNextCheckTime(new Date(now.getTime() + 30 * 60 * 1000));
    onAcknowledge();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate({ name: 'dashboard' })}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="text-sm text-gray-600">Health Monitor</div>
            <div className="text-[#005EB8]">Safety Check</div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white border border-gray-300 p-6">
          <div className="flex flex-col items-center text-center">
            <Heart className="w-16 h-16 text-[#005EB8] mb-4" />
            <div className="text-lg text-gray-900 mb-2">Health Check Active</div>
            <div className="text-sm text-gray-600">
              Regular safety monitoring is enabled
            </div>
          </div>
        </div>

        {/* Timer Information */}
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-sm text-gray-600 mb-3">Next Check In</div>
          <div className="text-3xl text-[#005EB8] text-center mb-4 font-mono">
            {timeRemaining}
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Last Check:</span>
              <span className="text-gray-900">{formatTime(lastCheckTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Next Check:</span>
              <span className="text-gray-900">{formatTime(nextCheckTime)}</span>
            </div>
          </div>
        </div>

        {/* Acknowledge Button */}
        <button
          onClick={handleAcknowledge}
          className="w-full bg-green-600 text-white px-4 py-4 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          <span>I'm OK - Acknowledge</span>
        </button>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-300 p-4">
          <div className="text-sm text-blue-900 mb-2 font-medium">Safety Instructions</div>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• The app will vibrate every 30 minutes</li>
            <li>• Click "I'm OK - Acknowledge" to confirm your safety</li>
            <li>• You can also press Volume Up/Down buttons to stop the vibration</li>
            <li>• If no response, emergency contact will be notified</li>
          </ul>
        </div>

        {/* Location Status */}
        <div className="bg-white border border-gray-300 p-4">
          <div className="text-sm text-gray-600 mb-3">Current Status</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
              <span className="text-sm text-gray-700">Location Tracking</span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
              <span className="text-sm text-gray-700">Safety Timer</span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
              <span className="text-sm text-gray-700">Vibration Alerts</span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
