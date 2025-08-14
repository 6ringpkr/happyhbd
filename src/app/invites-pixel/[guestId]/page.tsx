import { headers } from 'next/headers';
import type { Guest } from '@/lib/google-sheets';
import Link from 'next/link';
import Script from 'next/script';

// Extend Window interface for our custom functions
declare global {
  interface Window {
    nextScreen?: (screenId: string) => void;
    godparentResponse?: (response: string) => void;
    rsvpResponse?: (response: string) => void;
    resetInvitation?: () => void;
  }
}

export const dynamic = 'force-dynamic';

export default async function InvitePixelPage({ params, searchParams }: { params: Promise<{ guestId: string }>, searchParams?: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const { guestId } = await params;
  const sp = (await (searchParams || Promise.resolve({}))) as { [k: string]: string | string[] | undefined };
  const acceptedParam = sp?.accepted === '1';

  let guest: Guest | null = null;
  if (guestId) {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'http';
    const origin = host ? `${proto}://${host}` : '';
    const res = await fetch(`${origin}/api/guests?id=${encodeURIComponent(guestId)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      guest = data?.guest || null;
    }
  }

  return (
    <div className="pixel-page">
      <div className="stars"></div>
      
      <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 20, position: 'relative', zIndex: 10 }}>
        {guest ? (
          <>
            {/* Welcome Screen */}
            <div className="screen active" id="welcome">
              <div className="pixel-card" style={{ padding: 30, margin: '20px 0' }}>
                <h1 className="nano-header" style={{ fontSize: 'clamp(16px, 4vw, 24px)', lineHeight: 1.4, textAlign: 'center', marginBottom: 20 }}>
                  🎮 LEVEL 1 COMPLETE! 🎮
                </h1>
                
                <div className="progress-bar">
                  <div className="progress-fill" id="welcomeProgress"></div>
                </div>
                
                <div className="pixel-text" style={{ textAlign: 'center' }}>
                  <span className="controller">🎮</span>
                  <div className="coin"></div>
                  <span className="heart">♥</span>
                  <div className="coin"></div>
                  <span className="controller">🎮</span>
                </div>
                
                <div className="pixel-text">
                  PLAYER NAME: {guest.name.toUpperCase()}<br />
                  ACHIEVEMENT UNLOCKED: FIRST BIRTHDAY!<br />
                  EXP GAINED: 365 DAYS OF AWESOME<br /><br />
                  
                  Join us for an epic retro gaming celebration as our little player reaches Level 1!<br /><br />
                  
                  📅 DATE: OCTOBER 11TH, 2025<br />
                  ⏰ TIME: 3:00 PM<br />
                  📍 LOCATION: TBA<br /><br />
                  
                  Come dressed as your favorite retro game character!<br />
                  Prepare for cake, games, and power-ups galore! <span className="heart">♥♥♥</span>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                  <button className="pixel-btn" onClick={() => window.nextScreen && window.nextScreen('godparent')}>CONTINUE ▶</button>
                </div>
              </div>
            </div>

            {/* Godparent Section */}
            {guest.isGodparent && !guest.godparentAcceptedAt && !acceptedParam && (
              <div className="screen" id="godparent">
                <div className="pixel-card" style={{ padding: 30, margin: '20px 0' }}>
                  <h1 className="nano-header" style={{ fontSize: 'clamp(16px, 4vw, 24px)', lineHeight: 1.4, textAlign: 'center', marginBottom: 20 }}>
                    🌟 SPECIAL QUEST INVITATION 🌟
                  </h1>
                  <h2 className="nano-title" style={{ fontSize: 'clamp(12px, 3vw, 16px)', lineHeight: 1.4, textAlign: 'center', marginBottom: 20 }}>
                    GODPARENT SELECTION SCREEN
                  </h2>
                  
                  <div className="pixel-text">
                    Greetings, chosen warrior! <span className="heart">♥</span><br /><br />
                    
                    You have been selected for the most important side quest of all time:<br />
                    BECOMING BABY LAUAN&apos;S GODPARENT!<br /><br />
                    
                    This legendary role comes with special abilities:<br />
                    • Extra hugs and cuddles power-up<br />
                    • Spoiling privileges activated<br />
                    • Unlimited babysitting tokens<br />
                    • Wisdom sharing bonus multiplier<br />
                    • Love level: MAXIMUM! <span className="heart">♥♥♥</span><br /><br />
                    
                    Do you accept this sacred quest?
                  </div>
                  
                  <div style={{ textAlign: 'center', marginTop: 30 }}>
                    <button className="pixel-btn" onClick={() => window.godparentResponse && window.godparentResponse('accept')}>ACCEPT QUEST! 🌟</button>
                    <button className="pixel-btn decline" onClick={() => window.godparentResponse && window.godparentResponse('decline')}>MAYBE NEXT TIME</button>
                  </div>
                  
                  <div className="response-display" id="godparentResponse" style={{ background: 'rgba(0, 255, 255, 0.1)', border: '2px solid #00ffff', padding: 20, margin: '20px 0', borderRadius: 10, textAlign: 'center', display: 'none' }}></div>
                </div>
              </div>
            )}

            {/* RSVP Section */}
            <div className="screen" id="rsvp">
              <div className="pixel-card" style={{ padding: 30, margin: '20px 0' }}>
                <h1 className="nano-header" style={{ fontSize: 'clamp(16px, 4vw, 24px)', lineHeight: 1.4, textAlign: 'center', marginBottom: 20 }}>
                  🎯 PARTY RSVP CHECKPOINT 🎯
                </h1>
                <h2 className="nano-title" style={{ fontSize: 'clamp(12px, 3vw, 16px)', lineHeight: 1.4, textAlign: 'center', marginBottom: 20 }}>
                  WILL YOU JOIN OUR ARCADE ADVENTURE?
                </h2>
                
                <div className="pixel-text">
                  <span className="controller">🎮</span> MISSION BRIEFING <span className="controller">🎮</span><br /><br />
                  
                  The birthday quest is loading...<br />
                  We need to know our party size for optimal gameplay!<br /><br />
                  
                  PARTY DETAILS REMINDER:<br />
                  📅 OCTOBER 11TH, 2025<br />
                  ⏰ 3:00 PM<br />
                  📍 TBA<br /><br />
                  
                  Features include:<br />
                  • Retro gaming stations<br />
                  • Epic birthday cake boss battle<br />
                  • Goody bag loot drops<br />
                  • Photo booth with pixel props<br />
                  • Dance Dance Birthday moves!<br /><br />
                  
                  Will you be joining our pixel party?
                </div>
                
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                  <button className="pixel-btn" onClick={() => window.rsvpResponse && window.rsvpResponse('attending')}>PLAYER READY! 🎮</button>
                  <button className="pixel-btn decline" onClick={() => window.rsvpResponse && window.rsvpResponse('notattending')}>CAN&apos;T MAKE IT 😔</button>
                </div>
                
                <div className="response-display" id="rsvpResponse" style={{ background: 'rgba(0, 255, 255, 0.1)', border: '2px solid #00ffff', padding: 20, margin: '20px 0', borderRadius: 10, textAlign: 'center', display: 'none' }}></div>
              </div>
            </div>

            {/* Gift Preference Section */}
            <div className="screen" id="gifts">
              <div className="pixel-card" style={{ padding: 30, margin: '20px 0' }}>
                <h1 className="nano-header" style={{ fontSize: 'clamp(16px, 4vw, 24px)', lineHeight: 1.4, textAlign: 'center', marginBottom: 20 }}>
                  🎁 LOOT & TREASURE GUIDE 🎁
                </h1>
                <h2 className="nano-title" style={{ fontSize: 'clamp(12px, 3vw, 16px)', lineHeight: 1.4, textAlign: 'center', marginBottom: 20 }}>
                  OPTIONAL POWER-UP SUGGESTIONS
                </h2>
                
                <div className="pixel-text">
                  Your presence is the greatest gift! <span className="heart">♥</span><br />
                  But if you&apos;d like to bring a power-up, here are some ideas:<br /><br />
                </div>
                
                <div className="pixel-panel" style={{ padding: 15, margin: '10px 0' }}>
                  <strong>🧸 CLASSIC TOYS CATEGORY</strong><br />
                  Soft plushies, stacking blocks, musical toys, or sensory play items
                </div>
                
                <div className="pixel-panel" style={{ padding: 15, margin: '10px 0' }}>
                  <strong>📚 KNOWLEDGE SCROLLS</strong><br />
                  Board books, picture books, or interactive learning toys
                </div>
                
                <div className="pixel-panel" style={{ padding: 15, margin: '10px 0' }}>
                  <strong>👕 COSTUME UPGRADES</strong><br />
                  Size 12-18 months clothing, fun outfits, or cozy pajamas
                </div>
                
                <div className="pixel-panel" style={{ padding: 15, margin: '10px 0' }}>
                  <strong>🏠 BASE BUILDING MATERIALS</strong><br />
                  Items for the nursery, storage solutions, or practical baby gear
                </div>
                
                <div className="pixel-panel" style={{ padding: 15, margin: '10px 0' }}>
                  <strong>💰 COINS FOR FUTURE QUESTS</strong><br />
                  College fund contributions or savings account deposits
                </div>
                
                <div className="pixel-text" style={{ textAlign: 'center', marginTop: 20 }}>
                  Remember: The best loot is your love and friendship! <span className="heart">♥♥♥</span>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                  <button className="pixel-btn" onClick={() => window.nextScreen && window.nextScreen('thankyou')}>CONTINUE ▶</button>
                </div>
              </div>
            </div>

            {/* Thank You Section */}
            <div className="screen" id="thankyou">
              <div className="pixel-card" style={{ padding: 30, margin: '20px 0' }}>
                <h1 className="nano-header" style={{ fontSize: 'clamp(16px, 4vw, 24px)', lineHeight: 1.4, textAlign: 'center', marginBottom: 20 }}>
                  🏆 GAME COMPLETE! 🏆
                </h1>
                <h2 className="nano-title" style={{ fontSize: 'clamp(12px, 3vw, 16px)', lineHeight: 1.4, textAlign: 'center', marginBottom: 20 }}>
                  THANK YOU FOR PLAYING!
                </h2>
                
                <div className="pixel-text" style={{ textAlign: 'center' }}>
                  <div className="coin"></div>
                  <span className="heart">♥</span>
                  <div className="coin"></div>
                  <span className="heart">♥</span>
                  <div className="coin"></div><br /><br />
                  
                  HIGH SCORE: INFINITE LOVE!<br /><br />
                  
                  Thank you for being part of Baby Lauan&apos;s<br />
                  first birthday adventure! <span className="controller">🎮</span><br /><br />
                  
                  We can&apos;t wait to celebrate with you<br />
                  and create new memories together!<br /><br />
                  
                  ACHIEVEMENT UNLOCKED:<br />
                  &quot;AWESOME FRIEND/FAMILY MEMBER&quot;<br /><br />
                  
                  For questions or special requests:<br />
                  📧 EMAIL: PARENTS@BABYLEVEL1.COM<br />
                  📱 CALL/TEXT: (555) GAME-FUN<br /><br />
                  
                  SEE YOU AT THE PARTY!<br />
                  <span className="heart">♥♥♥ LOVE, THE LAUAN FAMILY ♥♥♥</span>
                </div>
                
                <div className="progress-bar">
                  <div className="progress-fill" id="thankyouProgress" style={{ width: '100%' }}></div>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                  <button className="pixel-btn" onClick={() => window.resetInvitation && window.resetInvitation()}>PLAY AGAIN 🔄</button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="pixel-card" style={{ padding: 30, margin: '20px 0', textAlign: 'center' }}>
            <h1 className="nano-header">Invitation Not Found</h1>
            <p className="pixel-text">Sorry, we couldn&apos;t find your invitation. Please check the link and try again.</p>
            <p><Link href="/" style={{ color: '#00ff00' }}>Go back</Link></p>
          </div>
        )}
      </div>

      <Script id="invite-scripts-pixel" strategy="afterInteractive">
        {`
          // Create animated stars
          function createStars() {
            const starsContainer = document.querySelector('.stars');
            if (!starsContainer) return;
            
            for (let i = 0; i < 100; i++) {
              const star = document.createElement('div');
              star.className = 'star';
              star.style.left = Math.random() * 100 + '%';
              star.style.top = Math.random() * 100 + '%';
              star.style.width = Math.random() * 3 + 1 + 'px';
              star.style.height = star.style.width;
              star.style.animationDelay = Math.random() * 2 + 's';
              star.style.position = 'absolute';
              star.style.background = '#fff';
              star.style.borderRadius = '50%';
              star.style.animation = 'twinkle 2s infinite alternate';
              star.style.pointerEvents = 'none';
              starsContainer.appendChild(star);
            }
          }

          // Navigation functions
          function nextScreen(screenId) {
            const currentScreen = document.querySelector('.screen.active');
            const nextScreen = document.getElementById(screenId);
            
            if (currentScreen && nextScreen) {
              currentScreen.classList.remove('active');
              setTimeout(() => {
                nextScreen.classList.add('active');
              }, 300);
            }
          }
          
          function godparentResponse(response) {
            const responseDiv = document.getElementById('godparentResponse');
            
            if (response === 'accept') {
              responseDiv.innerHTML = \`
                <div style="color: #00ff00;">
                  <div class="heart" style="font-size: 24px;">♥♥♥</div><br>
                  QUEST ACCEPTED!<br>
                  Welcome to the family, Godparent!<br>
                  Your legendary status is now activated!<br>
                  <div class="coin"></div><div class="coin"></div><div class="coin"></div>
                </div>
              \`;
            } else {
              responseDiv.innerHTML = \`
                <div style="color: #ffff00;">
                  No worries! The quest will remain available.<br>
                  Thank you for considering! <span class="heart">♥</span>
                </div>
              \`;
            }
            
            responseDiv.classList.add('show');
            responseDiv.style.display = 'block';
            
            setTimeout(() => {
              nextScreen('rsvp');
            }, 3000);
          }
          
          function rsvpResponse(response) {
            const responseDiv = document.getElementById('rsvpResponse');
            
            if (response === 'attending') {
              responseDiv.innerHTML = \`
                <div style="color: #00ff00;">
                  <span class="controller" style="font-size: 24px;">🎮</span><br>
                  AWESOME! PLAYER CONFIRMED!<br>
                  We can&apos;t wait to party with you!<br>
                  Get ready for an epic celebration!<br>
                  <div class="coin"></div><div class="coin"></div><div class="coin"></div>
                </div>
              \`;
            } else {
              responseDiv.innerHTML = \`
                <div style="color: #ffaa00;">
                  We&apos;ll miss you at the party! <span class="heart">♥</span><br>
                  Hope we can celebrate together next time!<br>
                  Sending virtual hugs your way!
                </div>
              \`;
            }
            
            responseDiv.classList.add('show');
            responseDiv.style.display = 'block';
            
            setTimeout(() => {
              nextScreen('gifts');
            }, 3000);
          }
          
          function resetInvitation() {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
              screen.classList.remove('active');
            });
            
            // Show welcome screen
            setTimeout(() => {
              document.getElementById('welcome').classList.add('active');
              
              // Reset progress bars
              document.getElementById('welcomeProgress').style.width = '0%';
              document.getElementById('thankyouProgress').style.width = '0%';
              
              // Hide response displays
              document.querySelectorAll('.response-display').forEach(div => {
                div.classList.remove('show');
                div.style.display = 'none';
              });
              
              // Restart welcome progress
              setTimeout(() => {
                document.getElementById('welcomeProgress').style.width = '100%';
              }, 500);
              
            }, 500);
          }

          // Make functions available globally
          window.nextScreen = nextScreen;
          window.godparentResponse = godparentResponse;
          window.rsvpResponse = rsvpResponse;
          window.resetInvitation = resetInvitation;
          
          // Initialize
          document.addEventListener('DOMContentLoaded', function() {
            createStars();
            
            // Start welcome progress bar
            setTimeout(() => {
              const welcomeProgress = document.getElementById('welcomeProgress');
              if (welcomeProgress) {
                welcomeProgress.style.width = '100%';
              }
            }, 1000);
            
            // Add some sound effects simulation (visual feedback)
            document.querySelectorAll('.pixel-btn').forEach(button => {
              button.addEventListener('click', function() {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                  this.style.transform = '';
                }, 150);
              });
            });
          });
        `}
      </Script>
    </div>
  );
} 