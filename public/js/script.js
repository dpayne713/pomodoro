const settings = {
    open: document.querySelector('#SETTINGS-OPEN'),
    close: document.querySelector('#SETTINGS-CLOSE'), 
    box: document.querySelector('#SETTINGS-BOX'), 
    background : document.querySelector('#SETTINGS-BACKGROUND'),
    apply : document.querySelector('#SETTINGS-APPLY'),
    dropdowns : document.querySelector('#SETTINGS-DROPDOWNS'),

    pomadoroTime : document.querySelector('#POMADORO-TIME'), 
    shortBreakTime : document.querySelector('#SHORT-BREAK-TIME'), 
    longBreakTime : document.querySelector('#LONG-BREAK-TIME'), 

    font : document.getElementsByName('font'), 
    color : document.getElementsByName('color')
}

const display = {

    pomadoroTime : document.querySelector('#POMADORO-LABEL'),
    shortBreakTime : document.querySelector('#SHORT-BREAK-LABEL'),
    longBreakTime : document.querySelector('#LONG-BREAK-LABEL'),
    current : document.getElementsByName('current'), 
    countdownRing : document.querySelector('#COUNTDOWN-RING'),
    readoutTime : document.querySelector('#READOUT-TIME'),
    pause : document.querySelector('#PAUSE'),
    pauseLabel : document.querySelector('#PAUSE-LABEL')
    
}

let state = {
    current: 0,
    seconds : [1500, 300, 900],
    names : ['pomodoro', 'short break', 'long break'], 
    pomadoroCount : 0, 
    pause : false
}
const origional = {
    pomadoro: 1500, 
    shortBreak: 300, 
    longBreak: 900
}

const audio = {
    pomodoro : new Howl({src : ['/public/assets/audio/pomodoro.mp3']}), 
    start : new Howl({src : ['/public/assets/audio/start.mp3']}),
    shortBreak : new Howl({src : ['/public/assets/audio/short-break.mp3']}),
    longBreak : new Howl({src : ['/public/assets/audio/long-break.mp3']}),
}

// General Functionality Listners // 

    // TESTING MODE TOGGLE // 
    document.addEventListener('keydown', (e)=> {
        if (e.key === 'q') {
            state.seconds = [15,3,9]; 
            origional.pomadoro = 15; 
            origional.shortBreak = 3; 
            origional.longBreak = 9; 
        }
    })
    // SETTINGS TOGGLES //
    settings.open.addEventListener('click', toggleSettings); 
    settings.close.addEventListener('click', toggleSettings); 

    // PAUSE BUTTON //
    display.pause.addEventListener('change', ()=> {
        // console.log(state.pause)
        if (display.pause.checked) {
            state.pause = true; 
            display.pauseLabel.textContent = 'resume'
        } else {
            state.pause = false;
            display.pauseLabel.textContent = 'pause'
        }
        
    });

    // DISABLE RADIO BUTTON FUNCTIONALITY ON MAIN PAGE DISPLAY //
    display.current.forEach(el=> {
        el.addEventListener('click', (e)=> {
            e.preventDefault()
        }); 
    });
    // UP AND DOWN BUTTONS IN SETTINGS // 
    settings.dropdowns.addEventListener('click', (e)=> {
        // ** THIS CODE SUCKS - BUT IT SELECTS THE VALUE OF THE INPUT ELEMENT ASSOCIATED WITH THE ARROW BUTTON AND INCRIMENTS //
        if (e.target.dataset.arrow === 'up') {
            e.target.parentNode.parentNode.firstChild.nextSibling.nextSibling.nextSibling.value ++
        } else if (e.target.dataset.arrow === 'down') {
            e.target.parentNode.parentNode.firstChild.nextSibling.nextSibling.nextSibling.value --
        }
    });

// ******** apply custom settings and re-start  ******** //

settings.apply.addEventListener('click', ()=> {
    // get times // get fonts // get color // 
    const settings = getSettings(); 
    // change times // change fonts // change color // 
    changeSettings(settings);
    // Update display settings // 
    updateDisplay(state); 
    // close settings dialogue //
    toggleSettings();
    audio.start.play(); 
});

/// global functions for listeners /// 

function toggleSettings() {
    settings.box.classList.toggle('hideBELOW'); 
    settings.background.classList.toggle('displayOFF'); 
}

function getSettings() {
    let font, color;
    for(let i=0; i<settings.font.length; i++) {
        if(settings.font[i].checked) font = settings.font[i].dataset.font; 
        if(settings.color[i].checked) color = settings.color[i].dataset.hexcolor;
    }
    return {
        seconds : [settings.pomadoroTime.value * 60, settings.shortBreakTime.value * 60, settings.longBreakTime.value * 60],
        font, 
        color, 
    }
}

function changeSettings(choices) {
    for (const property in choices) {
        if (property in state) {
            state[property] = choices[property]; 
        }
    };
    origional.pomadoro = choices.seconds[0]; 
    origional.shortBreak = choices.seconds[1]; 
    origional.longBreak = choices.seconds[2]; 
    document.documentElement.style.setProperty('--selected-color', choices.color); 
    document.documentElement.style.setProperty('--font-family', choices.font); 
};

function secondsToString(time) {
    let minutes = Math.floor(time / 60); 
    let seconds = (time - (minutes * 60)).toFixed(0);
    if (seconds < 10) seconds = `0${seconds}` ;
    return `${minutes}:${seconds}`
};

function updateDisplay(state) {
    // current state 
    for (let i=0; i<3; i++) {
        display.current[i].checked = false; 
    }
    display.current[state.current].checked = true; 

    // current time //
    display.readoutTime.textContent = secondsToString(state.seconds[state.current]);
    
    //update Ring // 
    const og = Object.values(origional)[state.current];
    const cur = state.seconds[state.current]; 
    display.countdownRing.style.strokeDashoffset = 250 - ((cur/og)*250); 
    
    document.title = `${state.names[state.current]} : ${secondsToString(state.seconds[state.current])}`
}

// COUNTDOWN FUNCTIONALITY 

setInterval(() => {
    const og = Object.values(origional);
    updateDisplay(state);

    if (!state.pause) {
        switch (true) {
            case state.seconds[state.current] > 0 : 
                state.seconds[state.current] -- ;
                break; 
            case state.seconds[state.current] === 0 && state.current === 0 && state.pomadoroCount < 4 :
                state.pomadoroCount ++;
                state.current = 1; 
                state.seconds = og;
                audio.shortBreak.play(); 
                break;
            case state.seconds[state.current] === 0 && state.current === 1 : 
                state.current = 0; 
                state.seconds = og;
                audio.pomodoro.play(); 
                
                break; 
            case state.seconds[state.current] === 0 && state.current === 0 && state.pomadoroCount === 4 : 
                state.current = 2; 
                state.seconds = og;
                audio.longBreak.play();  
                
                break; 
            case state.seconds[state.current] === 0 && state.current === 2 :
                state.pomadoroCount = 0;
                state.seconds = og; 
                state.current = 0; 
                audio.pomodoro.play(); 
                
                break;    
        }

    }


}, 1000);

audio.start.play(); 





