export default function Head() {
  return (
    <>
      <title>🎮 LEVEL 1 COMPLETE! • You&apos;re Invited!</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'NanoPix';
          src: url('/NanoPixDemoRegular-1Gg7B.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        
        .pixel-page { 
          font-family: 'Press Start 2P', system-ui, sans-serif; 
          background: linear-gradient(45deg, #0f0f23, #1a1a40);
          color: #00ff00;
          overflow-x: hidden;
          min-height: 100vh;
        }
        
        .pixel-card { 
          background: #000;
          border: 4px solid #00ff00;
          border-radius: 15px;
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
          animation: screenGlow 3s ease-in-out infinite alternate;
          image-rendering: pixelated;
        }
        
        .pixel-btn { 
          background: linear-gradient(45deg, #ff6b00, #ff8533);
          border: 3px solid #fff;
          color: #000;
          padding: 15px 25px;
          font-family: 'Press Start 2P', cursive;
          font-size: clamp(8px, 2vw, 10px);
          border-radius: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 0 #cc5500;
          position: relative;
          top: 0;
          text-transform: uppercase;
        }
        
        .pixel-btn:hover {
          background: linear-gradient(45deg, #ff8533, #ffaa66);
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #cc5500;
        }
        
        .pixel-btn:active {
          top: 4px;
          box-shadow: 0 0 0 #cc5500;
        }
        
        .pixel-btn.decline {
          background: linear-gradient(45deg, #666, #999);
          box-shadow: 0 4px 0 #333;
        }
        
        .pixel-btn.decline:hover {
          background: linear-gradient(45deg, #888, #bbb);
          box-shadow: 0 6px 0 #333;
        }
        
        .pixel-input { 
          background: #0a0f1f;
          border: 4px solid #1e2a56;
          color: #e6f0ff;
          padding: 10px;
          font-family: 'Press Start 2P', system-ui, sans-serif;
          image-rendering: pixelated;
        }
        
        .pixel-panel {
          background: rgba(0, 255, 0, 0.1);
          border: 2px solid #00ff00;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .pixel-panel:hover {
          background: rgba(0, 255, 0, 0.2);
          transform: translateX(10px);
        }
        
        .nano-header {
          font-family: 'NanoPix', 'Press Start 2P', system-ui, sans-serif;
          color: #ff6b00;
          text-shadow: 2px 2px 0px #000;
          animation: pulse 2s infinite;
        }
        
        .nano-title {
          font-family: 'NanoPix', 'Press Start 2P', system-ui, sans-serif;
          color: #00ffff;
        }
        
        .pixel-text {
          line-height: 1.8;
          margin: 15px 0;
          font-size: clamp(8px, 2vw, 12px);
          text-shadow: 1px 1px 0px #000;
        }
        
        .coin {
          width: 30px;
          height: 30px;
          background: #ffd700;
          border-radius: 50%;
          display: inline-block;
          margin: 0 10px;
          animation: spin 2s linear infinite;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
        }
        
        .heart {
          color: #ff0080;
          animation: heartbeat 1.5s ease-in-out infinite;
          display: inline-block;
        }
        
        .controller {
          font-size: 30px;
          animation: bounce 2s infinite;
          display: inline-block;
        }
        
        .progress-bar {
          width: 100%;
          height: 20px;
          background: #333;
          border: 2px solid #00ff00;
          border-radius: 10px;
          overflow: hidden;
          margin: 20px 0;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff00, #00ff80);
          width: 0%;
          transition: width 1s ease;
          animation: progressGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes screenGlow {
          0% { box-shadow: 0 0 30px rgba(0, 255, 0, 0.3); }
          100% { box-shadow: 0 0 50px rgba(0, 255, 0, 0.6); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes progressGlow {
          0% { box-shadow: 0 0 5px rgba(0, 255, 0, 0.5); }
          100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.9); }
        }
        
        @keyframes slideIn {
          0% { 
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          100% { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .screen {
          display: none;
          animation: slideIn 0.8s ease-out;
        }
        
        .screen.active {
          display: block;
        }
        
        @media (max-width: 768px) {
          .pixel-btn {
            padding: 12px 20px;
            margin: 8px 5px;
            display: block;
            width: calc(100% - 20px);
          }
          
          .coin {
            width: 25px;
            height: 25px;
            margin: 0 5px;
          }
        }
      `}</style>
    </>
  );
}

