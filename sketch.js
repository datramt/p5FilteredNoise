let ctx;

function setup() {
    ctx = getAudioContext();
    createCanvas(400, 250);

    //create p5sound objects
    wNoise = new p5.Noise('white');
    gpFilter = new p5.Filter();
    noiseFFT = new p5.FFT();

    //create DOM
    selType = createSelect();
    ampSlider = createSlider(-120, 0, -120, 0);
    gainSlider = createSlider(0, 30, 0, 0);
    qSlider = createSlider(0, 10, 0, 0);
    freqSlider = createSlider(0, 136, 0, 0);
    ampText = createDiv('amp: ' + 0);
    gainText = createDiv('gain: ' + 0);
    resText = createDiv('res: ' + 0);
    freqText = createDiv('freq: ' + 0);
    ctxOn = createButton('turn on Audio').position(width/2, height/2);
    ctxOn.mousePressed(() => {
  	ctx.resume().then(() => {
  	  console.log('Playback resumed successfully');
      ctxOn.hide();
  	});
  });

    //style text
    textstyle = selectAll('div');

    for (let i = 0; i < textstyle.length; i++) {
        textstyle[i].style('color', 'white');
        textstyle[i].style('font-family', 'verdana');
        textstyle[i].style('font-size', '12px');
        textstyle[i].position(145, i * 15 + 36);
    }

    //init noise
    wNoise.amp(0);
    wNoise.disconnect();
    wNoise.connect(gpFilter);
    wNoise.start();

    //init filter
    gpFilter.setType('allpass');
    gpFilter.set(8, 0);
    gpFilter.amp(0);

    //init selectFilterType
    selType.position(10, 10);
    selType.option('allpass');
    selType.option('lowpass');
    selType.option('highpass');
    selType.option('bandpass');
    selType.option('lowshelf');
    selType.option('highshelf');
    selType.option('peaking');
    selType.option('notch');

    selType.changed(function changeFilterType() {
        let newType = selType.value();
        gpFilter.setType(newType);
        console.log("filter changed to " + newType);
    });

    // init Sliders
    ampSlider.position(10, 38);
    gainSlider.position(10, 53);
    qSlider.position(10, 68);
    freqSlider.position(10, 83);

    // init fft
    noiseFFT.setInput(gpFilter)

    // define event callbacks
    ampSlider.input(function ampChanged() {
        if (ampSlider.value() != 0) {
            wNoise.amp(1, 0.1); //init wNoiseamp here to avoid 'click' sound when running app
        }
        gpFilter.amp(pow(2, ampSlider.value() / 6), 0.1);
        ampText.html('amp: ' + (ampSlider.value()).toFixed(4));
    });
    gainSlider.input(function gainChanged() {
        gpFilter.gain(gainSlider.value(), 0.1);
        gainText.html('gain: ' + (gainSlider.value()).toFixed(4));
    });
    qSlider.input(function qChanged() {
        gpFilter.res(pow(qSlider.value(), 2), 0.1);
        resText.html('res: ' + (pow(qSlider.value(), 2)).toFixed(4));
    });
    freqSlider.input(function freqChanged() {
        gpFilter.freq(midiToFreq(freqSlider.value()), 0.1);
        freqText.html('freq: ' + (midiToFreq(freqSlider.value()).toFixed(4)));
    });

    //style animation
    fill(0, 255, 200);
    noStroke();
}

function draw() {
    background(80);
    let noiseSpectrum = noiseFFT.analyze();

    beginShape();
    vertex(0, height);
    for (let i = 0; i < noiseSpectrum.length; i++) {
        let xSpacing = map(i, 0, noiseSpectrum.length, 0, width);
        let spectrumPeaks = map(noiseSpectrum[i], 0, height, height, 0);
        vertex(xSpacing, spectrumPeaks);
    }
    vertex(width, height);
    endShape();
}
