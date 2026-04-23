export const welcome = () => {
  const date = new Date(Date.now());
  const hours = date.getHours();
  let greeting = '';

  // Time-based greeting
  if (hours < 12) {
    greeting = 'Good morning! Welcome to the Quran backend service.';
  } else if (hours < 18) {
    greeting = 'Good afternoon! Your Quran APIs are running smoothly.';
  } else {
    greeting = 'Good evening! The Quran backend is ready to serve.';
  }

  return `
      <div style="text-align:center; font-family: 'Verdana', sans-serif; color:#1f2937; padding: 56px 24px; border-radius: 18px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12); max-width: 760px; margin: 24px auto; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); animation: fadeIn 1.5s;">
        <div style="display:inline-block; padding: 10px 16px; border-radius: 999px; background:#e0f2fe; color:#075985; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px;">
          Quran Backend
        </div>
        <h1 style="font-size: 44px; line-height: 1.15; color: #0f172a; margin: 0 0 16px; animation: scaleUp 1s ease-in-out;">Bismillah. The Quran backend is live.</h1>
        <p style="font-size: 20px; color: #334155; margin: 0 0 12px; animation: slideIn 1.2s ease-in-out;">${greeting}</p>
        <p style="font-size: 18px; color: #475569; margin: 0 0 24px;">Current server time: <strong style="color: #0f766e;">${date}</strong></p>

        <div style="display:grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin: 28px 0; text-align:left;">
          <div style="background:#f1f5f9; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 8px; color:#0f172a; font-size: 18px;">API Health</h3>
            <p style="margin:0; color:#475569; font-size: 15px;">Root endpoint is responding and ready.</p>
          </div>
          <div style="background:#f1f5f9; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 8px; color:#0f172a; font-size: 18px;">Quran Features</h3>
            <p style="margin:0; color:#475569; font-size: 15px;">Reciters, suras, favorites, and audio routes are online.</p>
          </div>
          <div style="background:#f1f5f9; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 8px; color:#0f172a; font-size: 18px;">Deployment</h3>
            <p style="margin:0; color:#475569; font-size: 15px;">Built for production with PM2 support.</p>
          </div>
        </div>

        <p style="font-size: 16px; color: #64748b; margin: 0;">If you see this page, your Quran backend is up, built, and ready to serve requests.</p>
  
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; animation: fadeIn 2s;">
          <p style="font-size: 16px; color: #0f172a; margin: 0 0 8px; font-weight: 700;">Available routes</p>
          <p style="font-size: 15px; color: #475569; margin: 0;">Explore the API under <strong>/api/v1</strong> for Quran-related endpoints.</p>
        </div>
      </div>
  
      <style>
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
  
        @keyframes scaleUp {
          from {
            transform: scale(0.8);
          }
          to {
            transform: scale(1);
          }
        }
  
        @keyframes slideIn {
          from {
            transform: translateX(-50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      </style>
    `;
};
