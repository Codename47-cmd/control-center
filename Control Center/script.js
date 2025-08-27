document.addEventListener('DOMContentLoaded', function() {
    // Update time
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.querySelector('.time').textContent = `${hours}:${minutes}`;
    }
    updateTime();
    setInterval(updateTime, 60000);

    // Create ripple effect
    function createRipple(event) {
        const element = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        const rect = element.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');

        element.appendChild(circle);

        setTimeout(() => {
            circle.remove();
        }, 600);
    }

    // Module interactions (optimized for mobile)
    const modules = document.querySelectorAll('.module');
    modules.forEach(module => {
        let longPressTimer;
        let touchMoved = false;
        // Mouse long press
        module.addEventListener('mousedown', function(e) {
            longPressTimer = setTimeout(() => {
                this.classList.add('hide');
                if (this.getAttribute('data-module') === 'wifi') showWifiSettings(this);
                if (this.getAttribute('data-module') === 'bluetooth') showBluetoothSettings(this);
                if (this.getAttribute('data-module') === 'cellular') showCellularSettings(this);
                this._longPressed = true;
            }, 600);
        });
        module.addEventListener('mouseup', function(e) {
            clearTimeout(longPressTimer);
            if (this._longPressed) {
                this.classList.remove('hide');
                this._longPressed = false;
            }
        });
        module.addEventListener('mouseleave', function(e) {
            clearTimeout(longPressTimer);
            if (this._longPressed) {
                this.classList.remove('hide');
                this._longPressed = false;
            }
        });
        // Touch long press
        module.addEventListener('touchstart', function(e) {
            touchMoved = false;
            longPressTimer = setTimeout(() => {
                this.classList.add('hide');
                if (this.getAttribute('data-module') === 'wifi') showWifiSettings(this);
                if (this.getAttribute('data-module') === 'bluetooth') showBluetoothSettings(this);
                if (this.getAttribute('data-module') === 'cellular') showCellularSettings(this);
                this._longPressed = true;
            }, 600);
        }, {passive: false});
        module.addEventListener('touchend', function(e) {
            clearTimeout(longPressTimer);
            if (this._longPressed) {
                this.classList.remove('hide');
                this._longPressed = false;
            }
        });
        module.addEventListener('touchmove', function(e) {
            touchMoved = true;
            clearTimeout(longPressTimer);
        });
        module.addEventListener('touchcancel', function(e) {
            clearTimeout(longPressTimer);
            if (this._longPressed) {
                this.classList.remove('hide');
                this._longPressed = false;
            }
        });
        // Click/tap (ignore if long press)
        module.addEventListener('click', function(e) {
            if (module._longPressed) return;
            createRipple(e);
            module.classList.toggle('active');
            createConnectionAnimation(module);
            const moduleType = module.getAttribute('data-module');
            // Wi-Fi icon
            if (moduleType === 'wifi') {
                const wifiIcon = document.getElementById('status-wifi');
                if (wifiIcon) wifiIcon.style.display = module.classList.contains('active') ? 'block' : 'none';
            }
            // Bluetooth icon
            if (moduleType === 'bluetooth') {
                const btIcon = document.getElementById('status-bluetooth');
                if (btIcon) btIcon.style.display = module.classList.contains('active') ? 'block' : 'none';
            }
            // 5G indicator only (cellular bar always visible except airplane)
            if (moduleType === 'cellular') {
                const fiveG = document.getElementById('status-5g');
                if (fiveG) fiveG.style.display = module.classList.contains('active') ? 'block' : 'none';
            }
            // Airplane mode logic (only hide signal bar if airplane is active)
            if (moduleType === 'airplane') {
                const airplaneIcon = document.getElementById('status-airplane');
                const signalIcon = document.getElementById('status-cellular');
                const fiveG = document.getElementById('status-5g');
                if (airplaneIcon && signalIcon) {
                    if (module.classList.contains('active')) {
                        airplaneIcon.style.display = '';
                        signalIcon.style.display = 'none';
                        if (fiveG) fiveG.style.display = 'none';
                    } else {
                        airplaneIcon.style.display = 'none';
                        signalIcon.style.display = '';
                        // Only show 5G if cellular is active
                        const cellularModule = document.querySelector('.module[data-module="cellular"]');
                        if (fiveG && cellularModule && cellularModule.classList.contains('active')) {
                            fiveG.style.display = '';
                        }
                    }
                }
            }
            // Hotspot icon
            if (moduleType === 'hotspot') {
                const hotspotIcon = document.getElementById('status-hotspot');
                if (hotspotIcon) hotspotIcon.style.display = module.classList.contains('active') ? 'block' : 'none';
            }
            // AirDrop icon (no status icon needed, just handle the click)
            if (moduleType === 'airdrop') {
                // AirDrop doesn't have a status icon, just handle the module activation
            }
        });
    });

    // Wi-Fi settings popup (demo)
    function showWifiSettings(wifiModule) {
        let popup = document.getElementById('wifi-settings-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'wifi-settings-popup';
            popup.innerHTML = `
                <div class="wifi-popup-content" style="display:flex;flex-direction:column;align-items:center;">
                    <div style="font-size:18px;font-weight:700;margin-bottom:10px;letter-spacing:0.5px;">Wi-Fi Settings</div>
                    <div class="wifi-settings-list" style="width:220px;background:rgba(255,255,255,0.06);border-radius:14px;box-shadow:0 2px 12px rgba(10,132,255,0.10);padding:16px 0;display:flex;flex-direction:column;gap:10px;">
                        <div class="wifi-setting-item" style="display:flex;align-items:center;gap:10px;padding:0 18px;">
                            <i class="fas fa-wifi" style="color:#0a84ff;font-size:16px;"></i>
                            <span style="flex:1;font-weight:500;">HomeNetwork</span>
                            <span style="font-size:12px;color:#0a84ff;background:rgba(10,132,255,0.08);border-radius:6px;padding:2px 8px;">Connected</span>
                        </div>
                        <div class="wifi-setting-item" style="display:flex;align-items:center;gap:10px;padding:0 18px;">
                            <i class="fas fa-wifi" style="color:#aaa;font-size:16px;"></i>
                            <span style="flex:1;font-weight:500;">Cafe_WiFi</span>
                            <button style="font-size:12px;color:#fff;background:#0a84ff;border:none;border-radius:6px;padding:2px 8px;cursor:pointer;">Connect</button>
                        </div>
                        <div class="wifi-setting-item" style="display:flex;align-items:center;gap:10px;padding:0 18px;">
                            <i class="fas fa-wifi" style="color:#aaa;font-size:16px;"></i>
                            <span style="flex:1;font-weight:500;">Guest_WiFi</span>
                            <button style="font-size:12px;color:#fff;background:#0a84ff;border:none;border-radius:6px;padding:2px 8px;cursor:pointer;">Connect</button>
                        </div>
                    </div>
                    <button id="close-wifi-popup" style="margin-top:18px;padding:8px 24px;border-radius:10px;border:none;background:#0a84ff;color:#fff;cursor:pointer;font-weight:600;box-shadow:0 2px 8px rgba(10,132,255,0.10);">Close</button>
                </div>
            `;
            document.body.appendChild(popup);
            document.getElementById('close-wifi-popup').onclick = function() {
                popup.remove();
            };
        }
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(40,40,60,0.98)';
        popup.style.borderRadius = '22px';
        popup.style.boxShadow = '0 12px 40px rgba(10,132,255,0.22)';
        popup.style.padding = '32px 0';
        popup.style.zIndex = '9999';
        popup.style.color = '#fff';
        popup.style.textAlign = 'center';
        popup.style.minWidth = '320px';
        popup.style.maxWidth = '90vw';
        popup.style.animation = 'floatIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    }

    // Bluetooth settings popup
    function showBluetoothSettings(bluetoothModule) {
        let popup = document.getElementById('bluetooth-settings-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'bluetooth-settings-popup';
            popup.innerHTML = `
                <div class="bluetooth-popup-content" style="display:flex;flex-direction:column;align-items:center;">
                    <div style="font-size:18px;font-weight:700;margin-bottom:10px;letter-spacing:0.5px;">Bluetooth Settings</div>
                    <div class="bluetooth-settings-list" style="width:240px;background:rgba(255,255,255,0.06);border-radius:14px;box-shadow:0 2px 12px rgba(10,132,255,0.10);padding:16px 0;display:flex;flex-direction:column;gap:10px;">
                        <div class="bluetooth-setting-item" style="display:flex;align-items:center;gap:10px;padding:0 18px;">
                            <i class="fab fa-bluetooth-b" style="color:#0a84ff;font-size:16px;"></i>
                            <span style="flex:1;font-weight:500;">AirPods Pro</span>
                            <span style="font-size:12px;color:#0a84ff;background:rgba(10,132,255,0.08);border-radius:6px;padding:2px 8px;">Connected</span>
                        </div>
                        <div class="bluetooth-setting-item" style="display:flex;align-items:center;gap:10px;padding:0 18px;">
                            <i class="fab fa-bluetooth-b" style="color:#aaa;font-size:16px;"></i>
                            <span style="flex:1;font-weight:500;">Beats Headphones</span>
                            <button style="font-size:12px;color:#fff;background:#0a84ff;border:none;border-radius:6px;padding:2px 8px;cursor:pointer;">Connect</button>
                        </div>
                        <div class="bluetooth-setting-item" style="display:flex;align-items:center;gap:10px;padding:0 18px;">
                            <i class="fab fa-bluetooth-b" style="color:#aaa;font-size:16px;"></i>
                            <span style="flex:1;font-weight:500;">Wireless Speaker</span>
                            <button style="font-size:12px;color:#fff;background:#0a84ff;border:none;border-radius:6px;padding:2px 8px;cursor:pointer;">Connect</button>
                        </div>
                        <div class="bluetooth-setting-item" style="display:flex;align-items:center;gap:10px;padding:0 18px;">
                            <i class="fab fa-bluetooth-b" style="color:#aaa;font-size:16px;"></i>
                            <span style="flex:1;font-weight:500;">Smart Watch</span>
                            <button style="font-size:12px;color:#fff;background:#0a84ff;border:none;border-radius:6px;padding:2px 8px;cursor:pointer;">Connect</button>
                        </div>
                    </div>
                    <button id="close-bluetooth-popup" style="margin-top:18px;padding:8px 24px;border-radius:10px;border:none;background:#0a84ff;color:#fff;cursor:pointer;font-weight:600;box-shadow:0 2px 8px rgba(10,132,255,0.10);">Close</button>
                </div>
            `;
            document.body.appendChild(popup);
            document.getElementById('close-bluetooth-popup').onclick = function() {
                popup.remove();
            };
        }
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(40,40,60,0.98)';
        popup.style.borderRadius = '22px';
        popup.style.boxShadow = '0 12px 40px rgba(10,132,255,0.22)';
        popup.style.padding = '32px 0';
        popup.style.zIndex = '9999';
        popup.style.color = '#fff';
        popup.style.textAlign = 'center';
        popup.style.minWidth = '320px';
        popup.style.maxWidth = '90vw';
        popup.style.animation = 'floatIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    }

    // Remove Cellular popup
    function removeCellularPopup() {
        const cellPopup = document.getElementById('cellular-settings-popup');
        if (cellPopup) cellPopup.remove();
    }

    // Cellular settings popup with 2 SIM card options and close button
    function showCellularSettings(cellularModule) {
        let popup = document.getElementById('cellular-settings-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'cellular-settings-popup';
            popup.innerHTML = `
                <div class=\"cellular-popup-content\" style=\"display:flex;flex-direction:column;align-items:center;\">
                    <div style=\"font-size:18px;font-weight:700;margin-bottom:10px;letter-spacing:0.5px;\">Cellular Settings</div>
                    <div class=\"cellular-settings-list\" style=\"width:220px;background:rgba(255,255,255,0.06);border-radius:14px;box-shadow:0 2px 12px rgba(10,132,255,0.10);padding:16px 0;display:flex;flex-direction:column;gap:10px;\">
                        <div class=\"cellular-setting-item\" style=\"display:flex;align-items:center;gap:10px;padding:0 18px;\">
                            <i class=\"fas fa-sim-card\" style=\"color:#0a84ff;font-size:16px;\"></i>
                            <span style=\"flex:1;font-weight:500;\">SIM 1: Globe</span>
                            <span style=\"font-size:12px;color:#0a84ff;background:rgba(10,132,255,0.08);border-radius:6px;padding:2px 8px;\">Active</span>
                        </div>
                        <div class=\"cellular-setting-item\" style=\"display:flex;align-items:center;gap:10px;padding:0 18px;\">
                            <i class=\"fas fa-sim-card\" style=\"color:#aaa;font-size:16px;\"></i>
                            <span style=\"flex:1;font-weight:500;\">SIM 2: Smart</span>
                            <button style=\"font-size:12px;color:#fff;background:#0a84ff;border:none;border-radius:6px;padding:2px 8px;cursor:pointer;\">Switch</button>
                        </div>
                    </div>
                    <button id=\"close-cellular-popup\" style=\"margin-top:18px;padding:8px 24px;border-radius:10px;border:none;background:#0a84ff;color:#fff;cursor:pointer;font-weight:600;box-shadow:0 2px 8px rgba(10,132,255,0.10);\">Close</button>
                </div>
            `;
            document.body.appendChild(popup);
            document.getElementById('close-cellular-popup').onclick = function() {
                popup.remove();
            };
            // Fade in animation
            popup.style.opacity = '0';
            popup.style.transition = 'opacity 0.25s cubic-bezier(0.22,1,0.36,1)';
            setTimeout(() => {
                popup.style.opacity = '1';
            }, 10);
        }
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(40,40,60,0.98)';
        popup.style.borderRadius = '22px';
        popup.style.boxShadow = '0 12px 40px rgba(10,132,255,0.22)';
        popup.style.padding = '32px 0';
        popup.style.zIndex = '9999';
        popup.style.color = '#fff';
        popup.style.textAlign = 'center';
        popup.style.minWidth = '320px';
        popup.style.maxWidth = '90vw';
    }

    // Brightness slider
    const brightnessSlider = document.getElementById('brightness-slider');
    const brightnessValue = document.querySelector('#brightness-slider').closest('.slider-container').querySelector('.slider-labels span:last-child');
    // Initialize
    brightnessSlider.style.setProperty('--val', `${brightnessSlider.value}%`);
    brightnessValue.textContent = `${brightnessSlider.value}%`;
    brightnessSlider.addEventListener('input', function() {
        const value = this.value;
        brightnessValue.textContent = `${value}%`;
        document.body.style.filter = `brightness(${value/100 + 0.5})`;
        this.style.setProperty('--val', `${value}%`);
    });
    brightnessSlider.style.setProperty('--val', `${brightnessSlider.value}%`);

    // Volume slider
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.querySelector('#volume-slider').closest('.slider-container').querySelector('.slider-labels span:last-child');
    // Initialize
    volumeSlider.style.setProperty('--val', `${volumeSlider.value}%`);
    volumeValue.textContent = `${volumeSlider.value}%`;
    volumeSlider.addEventListener('input', function() {
        const value = this.value;
        volumeValue.textContent = `${value}%`;
        this.style.setProperty('--val', `${value}%`);
    });
    volumeSlider.style.setProperty('--val', `${volumeSlider.value}%`);

    // Music player with multiple songs
    const musicPlayer = document.querySelector('.music-player');
    const songTitle = document.querySelector('.song-title');
    const artistName = document.querySelector('.artist');
    const playToggle = document.querySelector('.music-controls i.fa-play, .music-controls i.fa-pause');
    const prevBtn = document.querySelector('.music-controls i.fa-backward');
    const nextBtn = document.querySelector('.music-controls i.fa-forward');

    // Playlist array
    const playlist = [
        { title: 'Cosmic Waves', artist: 'Neon Pulse' },
        { title: 'Starlight Drive', artist: 'Echoes' },
        { title: 'Midnight City', artist: 'Dreamscape' },
        { title: 'Sunset Boulevard', artist: 'Synth Rider' }
    ];
    let currentSong = 0;

    function updateSong() {
        if (songTitle && artistName) {
            songTitle.textContent = playlist[currentSong].title;
            artistName.textContent = playlist[currentSong].artist;
        }
    }
    updateSong();

    // Music controls: support both mouse and touch
    function musicControlHandler(e) {
        if (e.type === 'touchend') e.preventDefault();
        if (e.target.classList.contains('fa-play') || e.target.classList.contains('fa-pause')) {
            e.target.classList.toggle('fa-play');
            e.target.classList.toggle('fa-pause');
            musicPlayer.classList.toggle('playing');
        }
        if (e.target.classList.contains('fa-backward')) {
            currentSong = (currentSong - 1 + playlist.length) % playlist.length;
            updateSong();
        }
        if (e.target.classList.contains('fa-forward')) {
            currentSong = (currentSong + 1) % playlist.length;
            updateSong();
        }
    }
    document.querySelectorAll('.music-controls i').forEach(btn => {
        btn.addEventListener('click', musicControlHandler);
        btn.addEventListener('touchend', musicControlHandler, {passive: false});
    });

    // Connection animation
    function createConnectionAnimation(element) {
        const modules = document.querySelectorAll('.module');
        const currentRect = element.getBoundingClientRect();
        const controlCenterRect = document.querySelector('.control-center').getBoundingClientRect();
        modules.forEach(otherModule => {
            if (otherModule !== element && otherModule.classList.contains('active')) {
                const otherRect = otherModule.getBoundingClientRect();
                const x1 = currentRect.left - controlCenterRect.left + currentRect.width/2;
                const y1 = currentRect.top - controlCenterRect.top + currentRect.height/2;
                const x2 = otherRect.left - controlCenterRect.left + otherRect.width/2;
                const y2 = otherRect.top - controlCenterRect.top + otherRect.height/2;
                const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                const line = document.createElement('div');
                line.classList.add('connection-line');
                line.style.width = `${distance}px`;
                line.style.height = `2px`;
                line.style.left = `${x1}px`;
                line.style.top = `${y1}px`;
                line.style.transform = `rotate(${angle}deg)`;
                line.style.opacity = `0`;
                line.style.transition = `all 0.3s ease`;
                document.querySelector('.control-center').appendChild(line);
                setTimeout(() => { line.style.opacity = `0.3`; }, 10);
                setTimeout(() => { line.style.opacity = `0`; }, 500);
                setTimeout(() => { line.remove(); }, 800);
            }
        });
    }

    // Music long press popup for albums
    let musicLongPressTimer;
    let musicTouchMoved = false;
    if (musicPlayer) {
        // Mouse long press
        musicPlayer.addEventListener('mousedown', function(e) {
            if (e.target.closest('.music-controls i')) return;
            musicPlayer.style.transition = 'transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s';
            musicPlayer.style.transform = 'scale(0.97)';
            musicPlayer.style.boxShadow = '0 2px 16px rgba(10,132,255,0.18)';
            musicLongPressTimer = setTimeout(() => {
                showAlbumsPopup();
            }, 600);
        });
        musicPlayer.addEventListener('mouseup', function(e) {
            clearTimeout(musicLongPressTimer);
            musicPlayer.style.transform = '';
            musicPlayer.style.boxShadow = '';
        });
        musicPlayer.addEventListener('mouseleave', function(e) {
            clearTimeout(musicLongPressTimer);
            musicPlayer.style.transform = '';
            musicPlayer.style.boxShadow = '';
        });
        // Touch long press
        musicPlayer.addEventListener('touchstart', function(e) {
            if (e.target.closest('.music-controls i')) return;
            musicTouchMoved = false;
            musicPlayer.style.transition = 'transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s';
            musicPlayer.style.transform = 'scale(0.97)';
            musicPlayer.style.boxShadow = '0 2px 16px rgba(10,132,255,0.18)';
            musicLongPressTimer = setTimeout(() => {
                showAlbumsPopup();
            }, 600);
        }, {passive: false});
        musicPlayer.addEventListener('touchend', function(e) {
            clearTimeout(musicLongPressTimer);
            musicPlayer.style.transform = '';
            musicPlayer.style.boxShadow = '';
        });
        musicPlayer.addEventListener('touchmove', function(e) {
            musicTouchMoved = true;
            clearTimeout(musicLongPressTimer);
        });
        musicPlayer.addEventListener('touchcancel', function(e) {
            clearTimeout(musicLongPressTimer);
            musicPlayer.style.transform = '';
            musicPlayer.style.boxShadow = '';
        });
    }

    function showAlbumsPopup() {
        let popup = document.getElementById('albums-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'albums-popup';
            popup.innerHTML = `
                <div class=\"albums-popup-content\" style=\"display:flex;flex-direction:column;align-items:center;\">
                    <div style=\"font-size:18px;font-weight:700;margin-bottom:10px;letter-spacing:0.5px;\">Available Albums</div>
                    <div class=\"albums-list\" style=\"width:220px;background:rgba(255,255,255,0.06);border-radius:14px;box-shadow:0 2px 12px rgba(10,132,255,0.10);padding:16px 0;display:flex;flex-direction:column;gap:10px;\">
                        ${playlist.map(album => `
                        <div class=\"album-item\" style=\"display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:0 18px;\">
                            <span style=\"font-weight:500;\">${album.title}</span>
                            <span style=\"font-size:12px;color:#aaa;\">${album.artist}</span>
                        </div>
                        `).join('')}
                    </div>
                    <button id=\"close-albums-popup\" style=\"margin-top:18px;padding:8px 24px;border-radius:10px;border:none;background:#0a84ff;color:#fff;cursor:pointer;font-weight:600;box-shadow:0 2px 8px rgba(10,132,255,0.10);\">Close</button>
                </div>
            `;
            document.body.appendChild(popup);
            document.getElementById('close-albums-popup').onclick = function() {
                popup.remove();
            };
            // Fade in animation
            popup.style.opacity = '0';
            popup.style.transition = 'opacity 0.25s cubic-bezier(0.22,1,0.36,1)';
            setTimeout(() => {
                popup.style.opacity = '1';
            }, 10);
        }
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'rgba(40,40,60,0.98)';
        popup.style.borderRadius = '22px';
        popup.style.boxShadow = '0 12px 40px rgba(10,132,255,0.22)';
        popup.style.padding = '32px 0';
        popup.style.zIndex = '9999';
        popup.style.color = '#fff';
        popup.style.textAlign = 'center';
        popup.style.minWidth = '320px';
        popup.style.maxWidth = '90vw';
    }

    // Universal long press handler for mouse and touch
    function addLongPressListener(element, callback) {
        let timer;
        let isLongPress = false;
        // Mouse events
        element.addEventListener('mousedown', function(e) {
            timer = setTimeout(() => {
                isLongPress = true;
                callback(e);
            }, 600);
        });
        element.addEventListener('mouseup', function(e) {
            clearTimeout(timer);
            isLongPress = false;
        });
        element.addEventListener('mouseleave', function(e) {
            clearTimeout(timer);
            isLongPress = false;
        });
        // Touch events for mobile
        element.addEventListener('touchstart', function(e) {
            timer = setTimeout(() => {
                isLongPress = true;
                callback(e);
            }, 600);
            // Prevent scrolling while holding
            e.preventDefault();
        }, {passive: false});
        element.addEventListener('touchend', function(e) {
            clearTimeout(timer);
            isLongPress = false;
        });
        element.addEventListener('touchcancel', function(e) {
            clearTimeout(timer);
            isLongPress = false;
        });
    }

    // Apply to modules
    modules.forEach(module => {
        addLongPressListener(module, function(e) {
            module.classList.add('hide');
            if (module.getAttribute('data-module') === 'wifi') {
                showWifiSettings(module);
            }
            if (module.getAttribute('data-module') === 'bluetooth') {
                showBluetoothSettings(module);
            }
            if (module.getAttribute('data-module') === 'cellular') {
                showCellularSettings(module);
            }
            module._longPressed = true;
        });
        // Restore on release (mouse and touch)
        ['mouseup','mouseleave','touchend','touchcancel'].forEach(evt => {
            module.addEventListener(evt, function(e) {
                if (module._longPressed) {
                    module.classList.remove('hide');
                    module._longPressed = false;
                }
            });
        });
    });

    // Music section long press (ignore controls)
    if (musicPlayer) {
        addLongPressListener(musicPlayer, function(e) {
            if (e.target.closest('.music-controls i')) return;
            musicPlayer.style.transition = 'transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s';
            musicPlayer.style.transform = 'scale(0.97)';
            musicPlayer.style.boxShadow = '0 2px 16px rgba(10,132,255,0.18)';
            musicLongPressTimer = setTimeout(() => {
                showAlbumsPopup();
            }, 600);
        });
        musicPlayer.addEventListener('mouseup', function(e) {
            clearTimeout(musicLongPressTimer);
            musicPlayer.style.transform = '';
            musicPlayer.style.boxShadow = '';
        });
        musicPlayer.addEventListener('mouseleave', function(e) {
            clearTimeout(musicLongPressTimer);
            musicPlayer.style.transform = '';
            musicPlayer.style.boxShadow = '';
        });
    }
});


