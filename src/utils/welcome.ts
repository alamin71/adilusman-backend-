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
      <div class="welcome-shell">
        <div class="welcome-card">
          <p class="badge">ADILUSMAN QURAN BACKEND</p>
          <p class="arabic text-center">السلام عليكم ورحمة الله وبركاته</p>
          <h2>Alhamdulillah. API is ready for service.</h2>
          <p class="sub">${greeting}</p>
          <p class="time">Server time: <strong>${date}</strong></p>

          <div class="grid">
            <article>
              <h3>Brand</h3>
              <p>Adilusman Quran platform is online with a clean production setup.</p>
            </article>
            <article>
              <h3>Core APIs</h3>
              <p>Reciters, suras, listen count, downloads, and favorites are available.</p>
            </article>
            <article>
              <h3>Base Route</h3>
              <p>Use <strong>/api/v1</strong> to access all Quran backend endpoints.</p>
            </article>
          </div>

          <p class="foot">May this service bring benefit and barakah. Ameen.</p>
        </div>
      </div>

      <style>
        :root {
          --brand-primary: #0f766e;
          --brand-secondary: #1d4ed8;
          --brand-ink: #102a43;
          --brand-muted: #486581;
          --brand-surface: #f8fafc;
          --brand-card: rgba(255, 255, 255, 0.88);
          --brand-line: rgba(15, 118, 110, 0.18);
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background:
            radial-gradient(circle at 10% 10%, rgba(29, 78, 216, 0.14), transparent 36%),
            radial-gradient(circle at 90% 85%, rgba(15, 118, 110, 0.18), transparent 32%),
            linear-gradient(145deg, #f0f9ff 0%, #eff6ff 40%, #f8fafc 100%);
          min-height: 100vh;
          color: var(--brand-ink);
        }

        .welcome-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          animation: fadeIn 900ms ease-out;
        }

        .welcome-card {
          width: min(920px, 100%);
          background: var(--brand-card);
          border: 1px solid var(--brand-line);
          border-radius: 22px;
          padding: 34px 24px;
          box-shadow: 0 24px 50px rgba(16, 42, 67, 0.13);
          backdrop-filter: blur(4px);
        }

        .badge {
          display: inline-block;
          margin: 0 0 14px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 0.12em;
          font-weight: 800;
          color: #075985;
          background: #e0f2fe;
        }

        .arabic {
          margin: 0;
          font-size: 26px;
          color: var(--brand-primary);
          font-weight: 700;
          line-height: 1.4;
          direction: rtl;
          text-align: center;
        }

        h1 {
          margin: 14px 0 8px;
          font-size: clamp(30px, 5vw, 50px);
          line-height: 1.14;
          color: #0b3a53;
          animation: riseUp 800ms ease-out;
        }

        .sub {
          margin: 0;
          font-size: 19px;
          color: #243b53;
        }

        .time {
          margin: 10px 0 0;
          color: var(--brand-muted);
          font-size: 15px;
        }

        .grid {
          margin-top: 26px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }

        article {
          background: var(--brand-surface);
          border: 1px solid #dbeafe;
          border-radius: 14px;
          padding: 14px;
          transform: translateY(0);
          transition: transform 200ms ease, box-shadow 200ms ease;
        }

        article:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 18px rgba(15, 118, 110, 0.15);
        }

        h3 {
          margin: 0 0 6px;
          font-size: 18px;
          color: #0f172a;
        }

        article p {
          margin: 0;
          font-size: 14px;
          color: #334e68;
          line-height: 1.5;
        }

        .foot {
          margin: 22px 0 0;
          padding-top: 14px;
          border-top: 1px dashed #bfdbfe;
          color: #1e3a8a;
          font-size: 15px;
          font-weight: 600;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes riseUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .welcome-card {
            padding: 24px 16px;
            border-radius: 16px;
          }

          .arabic {
            font-size: 22px;
          }

          .sub {
            font-size: 17px;
          }
        }
      </style>
    `;
};
