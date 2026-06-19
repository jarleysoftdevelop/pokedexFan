"use strict";
/*
 Copyright (C) 2012-2015 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceTimer(IOCore) {
    //Build references:
    this.IOCore = IOCore;
}
GameBoyAdvanceTimer.prototype.prescalarLookup = [
    0,
    0x6,
    0x8,
    0xA
];
GameBoyAdvanceTimer.prototype.initialize = function () {
    this.timer0Counter = 0;
    this.timer0Reload = 0;
    this.timer0Control = 0;
    this.timer0Enabled = false;
    this.timer0IRQ = false;
    this.timer0Precounter = 0;
    this.timer0Prescalar = 1;
    this.timer0PrescalarShifted = 0;
    this.timer1Counter = 0;
    this.timer1Reload = 0;
    this.timer1Control = 0;
    this.timer1Enabled = false;
    this.timer1IRQ = false;
    this.timer1Precounter = 0;
    this.timer1Prescalar = 1;
    this.timer1PrescalarShifted = 0;
    this.timer1CountUp = false;
    this.timer2Counter = 0;
    this.timer2Reload = 0;
    this.timer2Control = 0;
    this.timer2Enabled = false;
    this.timer2IRQ = false;
    this.timer2Precounter = 0;
    this.timer2Prescalar = 1;
    this.timer2PrescalarShifted = 0;
    this.timer2CountUp = false;
    this.timer3Counter = 0;
    this.timer3Reload = 0;
    this.timer3Control = 0;
    this.timer3Enabled = false;
    this.timer3IRQ = false;
    this.timer3Precounter = 0;
    this.timer3Prescalar = 1;
    this.timer3PrescalarShifted = 0;
    this.timer3CountUp = false;
    this.timer1UseMainClocks = false;
    this.timer1UseChainedClocks = false;
    this.timer2UseMainClocks = false;
    this.timer2UseChainedClocks = false;
    this.timer3UseMainClocks = false;
    this.timer3UseChainedClocks = false;
}
GameBoyAdvanceTimer.prototype.addClocks = function (clocks) {
    clocks = clocks | 0;
    //See if timer channels 0 and 1 are enabled:
    this.clockSoundTimers(clocks | 0);
    //See if timer channel 2 is enabled:
    this.clockTimer2(clocks | 0);
    //See if timer channel 3 is enabled:
    this.clockTimer3(clocks | 0);
}
GameBoyAdvanceTimer.prototype.clockSoundTimers = function (audioClocks) {
    audioClocks = audioClocks | 0;
    for (var predictedClocks = 0, overflowClocks = 0; (audioClocks | 0) > 0; audioClocks = ((audioClocks | 0) - (predictedClocks | 0)) | 0) {
        overflowClocks = this.nextAudioTimerOverflow() | 0;
        predictedClocks = Math.min(audioClocks | 0, overflowClocks | 0) | 0;
        //See if timer channel 0 is enabled:
        this.clockTimer0(predictedClocks | 0);
        //See if timer channel 1 is enabled:
        this.clockTimer1(predictedClocks | 0);
        //Clock audio system up to latest timer:
        this.IOCore.sound.addClocks(predictedClocks | 0);
        //Only jit if overflow was seen:
        if ((overflowClocks | 0) == (predictedClocks | 0)) {
            this.IOCore.sound.audioJIT();
        }
    }
}
GameBoyAdvanceTimer.prototype.clockTimer0 = function (clocks) {
    clocks = clocks | 0;
    if (this.timer0Enabled) {
        this.timer0Precounter = ((this.timer0Precounter | 0) + (clocks | 0)) | 0;
        while ((this.timer0Precounter | 0) >= (this.timer0Prescalar | 0)) {
            var iterations = Math.min(this.timer0Precounter >> (this.timer0PrescalarShifted | 0), (0x10000 - (this.timer0Counter | 0)) | 0) | 0;
            this.timer0Precounter = ((this.timer0Precounter | 0) - ((iterations | 0) << (this.timer0PrescalarShifted | 0))) | 0;
            this.timer0Counter = ((this.timer0Counter | 0) + (iterations | 0)) | 0;
            if ((this.timer0Counter | 0) > 0xFFFF) {
                this.timer0Counter = this.timer0Reload | 0;
                this.timer0ExternalTriggerCheck();
                this.timer1ClockUpTickCheck();
            }
        }
    }
}
GameBoyAdvanceTimer.prototype.clockTimer1 = function (clocks) {
    clocks = clocks | 0;
    if (this.timer1UseMainClocks) {
        this.timer1Precounter = ((this.timer1Precounter | 0) + (clocks | 0)) | 0;
        while ((this.timer1Precounter | 0) >= (this.timer1Prescalar | 0)) {
            var iterations = Math.min(this.timer1Precounter >> (this.timer1PrescalarShifted | 0), (0x10000 - (this.timer1Counter | 0)) | 0) | 0;
            this.timer1Precounter = ((this.timer1Precounter | 0) - ((iterations | 0) << (this.timer1PrescalarShifted | 0))) | 0;
            this.timer1Counter = ((this.timer1Counter | 0) + (iterations | 0)) | 0;
            if ((this.timer1Counter | 0) > 0xFFFF) {
                this.timer1Counter = this.timer1Reload | 0;
                this.timer1ExternalTriggerCheck();
                this.timer2ClockUpTickCheck();
            }
        }
    }
}
GameBoyAdvanceTimer.prototype.clockTimer2 = function (clocks) {
    clocks = clocks | 0;
    if (this.timer2UseMainClocks) {
        this.timer2Precounter = ((this.timer2Precounter | 0) + (clocks | 0)) | 0;
        while ((this.timer2Precounter | 0) >= (this.timer2Prescalar | 0)) {
            var iterations = Math.min(this.timer2Precounter >> (this.timer2PrescalarShifted | 0), (0x10000 - (this.timer2Counter | 0)) | 0) | 0;
            this.timer2Precounter = ((this.timer2Precounter | 0) - ((iterations | 0) << (this.timer2PrescalarShifted | 0))) | 0;
            this.timer2Counter = ((this.timer2Counter | 0) + (iterations | 0)) | 0;
            if ((this.timer2Counter | 0) > 0xFFFF) {
                this.timer2Counter = this.timer2Reload | 0;
                this.timer2ExternalTriggerCheck();
                this.timer3ClockUpTickCheck();
            }
        }
    }
}
GameBoyAdvanceTimer.prototype.clockTimer3 = function (clocks) {
    clocks = clocks | 0;
    if (this.timer3UseMainClocks) {
        this.timer3Precounter = ((this.timer3Precounter | 0) + (clocks | 0)) | 0;
        while ((this.timer3Precounter | 0) >= (this.timer3Prescalar | 0)) {
            var iterations = Math.min(this.timer3Precounter >> (this.timer3PrescalarShifted | 0), (0x10000 - (this.timer3Counter | 0)) | 0) | 0;
            this.timer3Precounter = ((this.timer3Precounter | 0) - ((iterations | 0) << (this.timer3PrescalarShifted | 0))) | 0;
            this.timer3Counter = ((this.timer3Counter | 0) + (iterations | 0)) | 0;
            if ((this.timer3Counter | 0) > 0xFFFF) {
                this.timer3Counter = this.timer3Reload | 0;
                this.timer3ExternalTriggerCheck();
            }
        }
    }
}
GameBoyAdvanceTimer.prototype.timer1ClockUpTickCheck = function () {
    if (this.timer1UseChainedClocks) {
        this.timer1Counter = ((this.timer1Counter | 0) + 1) | 0;
        if ((this.timer1Counter | 0) > 0xFFFF) {
            this.timer1Counter = this.timer1Reload | 0;
            this.timer1ExternalTriggerCheck();
            this.timer2ClockUpTickCheck();
        }
    }
}
GameBoyAdvanceTimer.prototype.timer2ClockUpTickCheck = function () {
    if (this.timer2UseChainedClocks) {
        this.timer2Counter = ((this.timer2Counter | 0) + 1) | 0;
        if ((this.timer2Counter | 0) > 0xFFFF) {
            this.timer2Counter = this.timer2Reload | 0;
            this.timer2ExternalTriggerCheck();
            this.timer3ClockUpTickCheck();
        }
    }
}
GameBoyAdvanceTimer.prototype.timer3ClockUpTickCheck = function () {
    if (this.timer3UseChainedClocks) {
        this.timer3Counter = ((this.timer3Counter | 0) + 1) | 0;
        if ((this.timer3Counter | 0) > 0xFFFF) {
            this.timer3Counter = this.timer3Reload | 0;
            this.timer3ExternalTriggerCheck();
        }
    }
}
GameBoyAdvanceTimer.prototype.timer0ExternalTriggerCheck = function () {
    if (this.timer0IRQ) {
        this.IOCore.irq.requestIRQ(0x08);
    }
    this.IOCore.sound.AGBDirectSoundTimer0ClockTick();
}
GameBoyAdvanceTimer.prototype.timer1ExternalTriggerCheck = function () {
    if (this.timer1IRQ) {
        this.IOCore.irq.requestIRQ(0x10);
    }
    this.IOCore.sound.AGBDirectSoundTimer1ClockTick();
}
GameBoyAdvanceTimer.prototype.timer2ExternalTriggerCheck = function () {
    if (this.timer2IRQ) {
        this.IOCore.irq.requestIRQ(0x20);
    }
}
GameBoyAdvanceTimer.prototype.timer3ExternalTriggerCheck = function () {
    if (this.timer3IRQ) {
        this.IOCore.irq.requestIRQ(0x40);
    }
}
GameBoyAdvanceTimer.prototype.writeTM0CNT8_0 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer0Reload = this.timer0Reload & 0xFF00;
    data = data & 0xFF;
    this.timer0Reload = this.timer0Reload | data;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM0CNT8_1 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer0Reload = this.timer0Reload & 0xFF;
    data = data & 0xFF;
    this.timer0Reload = this.timer0Reload | (data << 8);
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM0CNT8_2 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer0Control = data & 0xFF;
    if ((data & 0x80) != 0) {
        if (!this.timer0Enabled) {
            this.timer0Counter = this.timer0Reload | 0;
            this.timer0Enabled = true;
            this.timer0Precounter = 0;
        }
    }
    else {
        this.timer0Enabled = false;
    }
    this.timer0IRQ = ((data & 0x40) != 0);
    this.timer0PrescalarShifted = this.prescalarLookup[data & 0x03] | 0;
    this.timer0Prescalar = 1 << (this.timer0PrescalarShifted | 0);
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM0CNT16 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer0Reload = data & 0xFFFF;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM0CNT32 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer0Reload = data & 0xFFFF;
    this.timer0Control = data >> 16;
    if ((data & 0x800000) != 0) {
        if (!this.timer0Enabled) {
            this.timer0Counter = this.timer0Reload | 0;
            this.timer0Enabled = true;
            this.timer0Precounter = 0;
        }
    }
    else {
        this.timer0Enabled = false;
    }
    this.timer0IRQ = ((data & 0x400000) != 0);
    this.timer0PrescalarShifted = this.prescalarLookup[(data >> 16) & 0x03] | 0;
    this.timer0Prescalar = 1 << (this.timer0PrescalarShifted | 0);
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.readTM0CNT8_0 = function () {
    this.IOCore.updateTimerClocking();
    return this.timer0Counter & 0xFF;
}
GameBoyAdvanceTimer.prototype.readTM0CNT8_1 = function () {
    this.IOCore.updateTimerClocking();
    return (this.timer0Counter & 0xFF00) >> 8;
}
GameBoyAdvanceTimer.prototype.readTM0CNT8_2 = function () {
    return this.timer0Control & 0xFF;
}
GameBoyAdvanceTimer.prototype.readTM0CNT16 = function () {
    this.IOCore.updateTimerClocking();
    return this.timer0Counter | 0;
}
GameBoyAdvanceTimer.prototype.readTM0CNT32 = function () {
    this.IOCore.updateTimerClocking();
    var data = (this.timer0Control & 0xFF) << 16;
    data = data | this.timer0Counter;
    return data | 0;
}
GameBoyAdvanceTimer.prototype.writeTM1CNT8_0 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer1Reload = this.timer1Reload & 0xFF00;
    data = data & 0xFF;
    this.timer1Reload = this.timer1Reload | data;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM1CNT8_1 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer1Reload = this.timer1Reload & 0xFF;
    data = data & 0xFF;
    this.timer1Reload = this.timer1Reload | (data << 8);
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM1CNT8_2 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer1Control = data & 0xFF;
    if ((data & 0x80) != 0) {
        if (!this.timer1Enabled) {
            this.timer1Counter = this.timer1Reload | 0;
            this.timer1Enabled = true;
            this.timer1Precounter = 0;
        }
    }
    else {
        this.timer1Enabled = false;
    }
    this.timer1IRQ = ((data & 0x40) != 0);
    this.timer1CountUp = ((data & 0x4) != 0);
    this.timer1PrescalarShifted = this.prescalarLookup[data & 0x03] | 0;
    this.timer1Prescalar = 1 << (this.timer1PrescalarShifted | 0);
    this.preprocessTimer1();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM1CNT16 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer1Reload = data & 0xFFFF;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM1CNT32 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.IOCore.sound.audioJIT();
    this.timer1Reload = data & 0xFFFF;
    this.timer1Control = data >> 16;
    if ((data & 0x800000) != 0) {
        if (!this.timer1Enabled) {
            this.timer1Counter = this.timer1Reload | 0;
            this.timer1Enabled = true;
            this.timer1Precounter = 0;
        }
    }
    else {
        this.timer1Enabled = false;
    }
    this.timer1IRQ = ((data & 0x400000) != 0);
    this.timer1CountUp = ((data & 0x40000) != 0);
    this.timer1PrescalarShifted = this.prescalarLookup[(data >> 16) & 0x03] | 0;
    this.timer1Prescalar = 1 << (this.timer1PrescalarShifted | 0);
    this.preprocessTimer1();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.readTM1CNT8_0 = function () {
    this.IOCore.updateTimerClocking();
    return this.timer1Counter & 0xFF;
}
GameBoyAdvanceTimer.prototype.readTM1CNT8_1 = function () {
    this.IOCore.updateTimerClocking();
    return (this.timer1Counter & 0xFF00) >> 8;
}
GameBoyAdvanceTimer.prototype.readTM1CNT8_2 = function () {
    return this.timer1Control & 0xFF;
}
GameBoyAdvanceTimer.prototype.readTM1CNT16 = function () {
    this.IOCore.updateTimerClocking();
    return this.timer1Counter | 0;
}
GameBoyAdvanceTimer.prototype.readTM1CNT32 = function () {
    this.IOCore.updateTimerClocking();
    var data = (this.timer1Control & 0xFF) << 16;
    data = data | this.timer1Counter;
    return data | 0;
}
GameBoyAdvanceTimer.prototype.writeTM2CNT8_0 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer2Reload = this.timer2Reload & 0xFF00;
    data = data & 0xFF;
    this.timer2Reload = this.timer2Reload | data;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM2CNT8_1 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer2Reload = this.timer2Reload & 0xFF;
    data = data & 0xFF;
    this.timer2Reload = this.timer2Reload | (data << 8);
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM2CNT8_2 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer2Control = data & 0xFF;
    if ((data & 0x80) != 0) {
        if (!this.timer2Enabled) {
            this.timer2Counter = this.timer2Reload | 0;
            this.timer2Enabled = true;
            this.timer2Precounter = 0;
        }
    }
    else {
        this.timer2Enabled = false;
    }
    this.timer2IRQ = ((data & 0x40) != 0);
    this.timer2CountUp = ((data & 0x4) != 0);
    this.timer2PrescalarShifted = this.prescalarLookup[data & 0x03] | 0;
    this.timer2Prescalar = 1 << (this.timer2PrescalarShifted | 0);
    this.preprocessTimer2();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM2CNT16 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer2Reload = data & 0xFFFF;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM2CNT32 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer2Reload = data & 0xFFFF;
    this.timer2Control = data >> 16;
    if ((data & 0x800000) != 0) {
        if (!this.timer2Enabled) {
            this.timer2Counter = this.timer2Reload | 0;
            this.timer2Enabled = true;
            this.timer2Precounter = 0;
        }
    }
    else {
        this.timer2Enabled = false;
    }
    this.timer2IRQ = ((data & 0x400000) != 0);
    this.timer2CountUp = ((data & 0x40000) != 0);
    this.timer2PrescalarShifted = this.prescalarLookup[(data >> 16) & 0x03] | 0;
    this.timer2Prescalar = 1 << (this.timer2PrescalarShifted | 0);
    this.preprocessTimer2();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.readTM2CNT8_0 = function () {
    this.IOCore.updateTimerClocking();
    return this.timer2Counter & 0xFF;
}
GameBoyAdvanceTimer.prototype.readTM2CNT8_1 = function () {
    this.IOCore.updateTimerClocking();
    return (this.timer2Counter & 0xFF00) >> 8;
}
GameBoyAdvanceTimer.prototype.readTM2CNT8_2 = function () {
    return this.timer2Control & 0xFF;
}
GameBoyAdvanceTimer.prototype.readTM2CNT16 = function () {
    this.IOCore.updateTimerClocking();
    return this.timer2Counter | 0;
}
GameBoyAdvanceTimer.prototype.readTM2CNT32 = function () {
    this.IOCore.updateTimerClocking();
    var data = (this.timer2Control & 0xFF) << 16;
    data = data | this.timer2Counter;
    return data | 0;
}
GameBoyAdvanceTimer.prototype.writeTM3CNT8_0 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer3Reload = this.timer3Reload & 0xFF00;
    data = data & 0xFF;
    this.timer3Reload = this.timer3Reload | data;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM3CNT8_1 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer3Reload = this.timer3Reload & 0xFF;
    data = data & 0xFF;
    this.timer3Reload = this.timer3Reload | (data << 8);
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM3CNT8_2 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer3Control = data & 0xFF;
    if ((data & 0x80) != 0) {
        if (!this.timer3Enabled) {
            this.timer3Counter = this.timer3Reload | 0;
            this.timer3Enabled = true;
            this.timer3Precounter = 0;
        }
    }
    else {
        this.timer3Enabled = false;
    }
    this.timer3IRQ = ((data & 0x40) != 0);
    this.timer3CountUp = ((data & 0x4) != 0);
    this.timer3PrescalarShifted = this.prescalarLookup[data & 0x03] | 0;
    this.timer3Prescalar = 1 << (this.timer3PrescalarShifted | 0);
    this.preprocessTimer3();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM3CNT16 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer3Reload = data & 0xFFFF;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.writeTM3CNT32 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.timer3Reload = data & 0xFFFF;
    this.timer3Control = data >> 16;
    if ((data & 0x800000) != 0) {
        if (!this.timer3Enabled) {
            this.timer3Counter = this.timer3Reload | 0;
            this.timer3Enabled = true;
            this.timer3Precounter = 0;
        }
    }
    else {
        this.timer3Enabled = false;
    }
    this.timer3IRQ = ((data & 0x400000) != 0);
    this.timer3CountUp = ((data & 0x40000) != 0);
    this.timer3PrescalarShifted = this.prescalarLookup[(data >> 16) & 0x03] | 0;
    this.timer3Prescalar = 1 << (this.timer3PrescalarShifted | 0);
    this.preprocessTimer3();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceTimer.prototype.readTM3CNT8_0 = function () {
    this.IOCore.updateTimerClocking();
    return this.timer3Counter & 0xFF;
}
GameBoyAdvanceTimer.prototype.readTM3CNT8_1 = function () {
    this.IOCore.updateTimerClocking();
    return (this.timer3Counter & 0xFF00) >> 8;
}
GameBoyAdvanceTimer.prototype.readTM3CNT8_2 = function () {
    return this.timer3Control & 0xFF;
}
GameBoyAdvanceTimer.prototype.readTM3CNT16 = function () {
    this.IOCore.updateTimerClocking();
    return this.timer3Counter | 0;
}
GameBoyAdvanceTimer.prototype.readTM3CNT32 = function () {
    this.IOCore.updateTimerClocking();
    var data = (this.timer3Control & 0xFF) << 16;
    data = data | this.timer3Counter;
    return data | 0;
}
GameBoyAdvanceTimer.prototype.preprocessTimer1 = function () {
    this.timer1UseMainClocks = (this.timer1Enabled && !this.timer1CountUp);
    this.timer1UseChainedClocks = (this.timer1Enabled && this.timer1CountUp);
}
GameBoyAdvanceTimer.prototype.preprocessTimer2 = function () {
    this.timer2UseMainClocks = (this.timer2Enabled && !this.timer2CountUp);
    this.timer2UseChainedClocks = (this.timer2Enabled && this.timer2CountUp);
}
GameBoyAdvanceTimer.prototype.preprocessTimer3 = function () {
    this.timer3UseMainClocks = (this.timer3Enabled && !this.timer3CountUp);
    this.timer3UseChainedClocks = (this.timer3Enabled && this.timer3CountUp);
}
if (typeof Math.imul == "function") {
    //Math.imul found, insert the optimized path in:
    GameBoyAdvanceTimer.prototype.nextTimer0OverflowBase = function () {
        var countUntilReload = (0x10000 - (this.timer0Counter | 0)) | 0;
        countUntilReload = Math.imul(countUntilReload | 0, this.timer0Prescalar | 0) | 0;
        countUntilReload = ((countUntilReload | 0) - (this.timer0Precounter | 0)) | 0;
        return countUntilReload | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer0OverflowSingle = function () {
        var eventTime = 0x7FFFFFFF;
        if (this.timer0Enabled) {
            eventTime = this.nextTimer0OverflowBase() | 0;
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer0Overflow = function (numOverflows) {
        numOverflows = numOverflows | 0;
        var eventTime = 0x7FFFFFFF;
        if (this.timer0Enabled) {
            numOverflows = ((numOverflows | 0) - 1) | 0;
            var countUntilReload = this.nextTimer0OverflowBase() | 0;
            var reloadClocks = (0x10000 - (this.timer0Reload | 0)) | 0;
            reloadClocks = Math.imul(reloadClocks | 0, this.timer0Prescalar | 0) | 0;
            reloadClocks = (reloadClocks | 0) * (numOverflows | 0);
            eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer1OverflowBase = function () {
        var countUntilReload = (0x10000 - (this.timer1Counter | 0)) | 0;
        countUntilReload = Math.imul(countUntilReload | 0, this.timer1Prescalar | 0) | 0;
        countUntilReload = ((countUntilReload | 0) - (this.timer1Precounter | 0)) | 0;
        return countUntilReload | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer1Overflow = function (numOverflows) {
        numOverflows = numOverflows | 0;
        var eventTime = 0x7FFFFFFF;
        if (this.timer1Enabled) {
            var reloadClocks = (0x10000 - (this.timer1Reload | 0)) | 0;
            if (this.timer1CountUp) {
                var countUntilReload = (0x10000 - (this.timer1Counter | 0)) | 0;
                reloadClocks = (reloadClocks | 0) * (numOverflows | 0);
                eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
                eventTime = this.nextTimer0Overflow(eventTime | 0) | 0;
            }
            else {
                numOverflows = ((numOverflows | 0) - 1) | 0;
                var countUntilReload = this.nextTimer1OverflowBase() | 0;
                reloadClocks = Math.imul(reloadClocks | 0, this.timer1Prescalar | 0) | 0;
                reloadClocks = reloadClocks * numOverflows;
                eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
            }
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer1OverflowSingle = function () {
        var eventTime = 0x7FFFFFFF;
        if (this.timer1Enabled) {
            if (this.timer1CountUp) {
                var countUntilReload = (0x10000 - (this.timer1Counter | 0)) | 0;
                eventTime = this.nextTimer0Overflow(countUntilReload | 0) | 0;
            }
            else {
                eventTime = this.nextTimer1OverflowBase() | 0;
            }
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer2OverflowBase = function () {
        var countUntilReload = (0x10000 - (this.timer2Counter | 0)) | 0;
        countUntilReload = Math.imul(countUntilReload | 0, this.timer2Prescalar | 0) | 0;
        countUntilReload = ((countUntilReload | 0) - (this.timer2Precounter | 0)) | 0;
        return countUntilReload | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer2Overflow = function (numOverflows) {
        numOverflows = numOverflows | 0;
        var eventTime = 0x7FFFFFFF;
        if (this.timer2Enabled) {
            var reloadClocks = (0x10000 - (this.timer2Reload | 0)) | 0;
            if (this.timer2CountUp) {
                var countUntilReload = (0x10000 - (this.timer2Counter | 0)) | 0;
                reloadClocks = (reloadClocks | 0) * (numOverflows | 0);
                eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
                eventTime = this.nextTimer1Overflow(eventTime | 0) | 0;
            }
            else {
                numOverflows = ((numOverflows | 0) - 1) | 0;
                var countUntilReload = this.nextTimer2OverflowBase() | 0;
                reloadClocks = Math.imul(reloadClocks | 0, this.timer2Prescalar | 0) | 0;
                reloadClocks = reloadClocks * numOverflows;
                eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
            }
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer2OverflowSingle = function () {
        var eventTime = 0x7FFFFFFF;
        if (this.timer2Enabled) {
            if (this.timer2CountUp) {
                var countUntilReload = (0x10000 - (this.timer2Counter | 0)) | 0;
                eventTime = this.nextTimer1Overflow(countUntilReload | 0) | 0;
            }
            else {
                eventTime = this.nextTimer2OverflowBase() | 0;
            }
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer3OverflowSingle = function () {
        var eventTime = 0x7FFFFFFF;
        if (this.timer3Enabled) {
            if (this.timer3CountUp) {
                var countUntilReload = (0x10000 - (this.timer3Counter | 0)) | 0;
                eventTime = this.nextTimer2Overflow(countUntilReload | 0) | 0;
            }
            else {
                eventTime = (0x10000 - (this.timer3Counter | 0)) | 0;
                eventTime = Math.imul(eventTime | 0, this.timer3Prescalar | 0) | 0;
                eventTime = ((eventTime | 0) - (this.timer3Precounter | 0)) | 0;
            }
        }
        return eventTime | 0;
    }
}
else {
    //Math.imul not found, use the compatibility method:
    GameBoyAdvanceTimer.prototype.nextTimer0OverflowBase = function () {
        var countUntilReload = (0x10000 - (this.timer0Counter | 0)) | 0;
        countUntilReload = ((countUntilReload | 0) * (this.timer0Prescalar | 0)) | 0;
        countUntilReload = ((countUntilReload | 0) - (this.timer0Precounter | 0)) | 0;
        return countUntilReload | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer0OverflowSingle = function () {
        var eventTime = 0x7FFFFFFF;
        if (this.timer0Enabled) {
            eventTime = this.nextTimer0OverflowBase() | 0;
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer0Overflow = function (numOverflows) {
        numOverflows = numOverflows | 0;
        var eventTime = 0x7FFFFFFF;
        if (this.timer0Enabled) {
            numOverflows = ((numOverflows | 0) - 1) | 0;
            var countUntilReload = this.nextTimer0OverflowBase() | 0;
            var reloadClocks = (0x10000 - (this.timer0Reload | 0)) | 0;
            reloadClocks = ((reloadClocks | 0) * (this.timer0Prescalar | 0)) | 0;
            reloadClocks = (reloadClocks | 0) * (numOverflows | 0);
            eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer1OverflowBase = function () {
        var countUntilReload = (0x10000 - (this.timer1Counter | 0)) | 0;
        countUntilReload = ((countUntilReload | 0) * (this.timer1Prescalar | 0)) | 0;
        countUntilReload = ((countUntilReload | 0) - (this.timer1Precounter | 0)) | 0;
        return countUntilReload | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer1Overflow = function (numOverflows) {
        numOverflows = numOverflows | 0;
        var eventTime = 0x7FFFFFFF;
        if (this.timer1Enabled) {
            var reloadClocks = (0x10000 - (this.timer1Reload | 0)) | 0;
            if (this.timer1CountUp) {
                var countUntilReload = (0x10000 - (this.timer1Counter | 0)) | 0;
                reloadClocks = (reloadClocks | 0) * (numOverflows | 0);
                eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
                eventTime = this.nextTimer0Overflow(eventTime | 0) | 0;
            }
            else {
                numOverflows = ((numOverflows | 0) - 1) | 0;
                var countUntilReload = this.nextTimer1OverflowBase() | 0;
                reloadClocks = ((reloadClocks | 0) * (this.timer1Prescalar | 0)) | 0;
                reloadClocks = reloadClocks * numOverflows;
                eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
            }
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer1OverflowSingle = function () {
        var eventTime = 0x7FFFFFFF;
        if (this.timer1Enabled) {
            if (this.timer1CountUp) {
                var countUntilReload = (0x10000 - (this.timer1Counter | 0)) | 0;
                eventTime = this.nextTimer0Overflow(countUntilReload | 0) | 0;
            }
            else {
                eventTime = this.nextTimer1OverflowBase() | 0;
            }
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer2OverflowBase = function () {
        var countUntilReload = (0x10000 - (this.timer2Counter | 0)) | 0;
        countUntilReload = ((countUntilReload | 0) * (this.timer2Prescalar | 0)) | 0;
        countUntilReload = ((countUntilReload | 0) - (this.timer2Precounter | 0)) | 0;
        return countUntilReload | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer2Overflow = function (numOverflows) {
        numOverflows = numOverflows | 0;
        var eventTime = 0x7FFFFFFF;
        if (this.timer2Enabled) {
            var reloadClocks = (0x10000 - (this.timer2Reload | 0)) | 0;
            if (this.timer2CountUp) {
                var countUntilReload = (0x10000 - (this.timer2Counter | 0)) | 0;
                reloadClocks = (reloadClocks | 0) * (numOverflows | 0);
                eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
                eventTime = this.nextTimer1Overflow(eventTime | 0) | 0;
            }
            else {
                numOverflows = ((numOverflows | 0) - 1) | 0;
                var countUntilReload = this.nextTimer2OverflowBase() | 0;
                reloadClocks = ((reloadClocks | 0) * (this.timer2Prescalar | 0)) | 0;
                reloadClocks = reloadClocks * numOverflows;
                eventTime = Math.min((countUntilReload | 0) + reloadClocks, 0x7FFFFFFF) | 0;
            }
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer2OverflowSingle = function () {
        var eventTime = 0x7FFFFFFF;
        if (this.timer2Enabled) {
            if (this.timer2CountUp) {
                var countUntilReload = (0x10000 - (this.timer2Counter | 0)) | 0;
                eventTime = this.nextTimer1Overflow(countUntilReload | 0) | 0;
            }
            else {
                eventTime = this.nextTimer2OverflowBase() | 0;
            }
        }
        return eventTime | 0;
    }
    GameBoyAdvanceTimer.prototype.nextTimer3OverflowSingle = function () {
        var eventTime = 0x7FFFFFFF;
        if (this.timer3Enabled) {
            if (this.timer3CountUp) {
                var countUntilReload = (0x10000 - (this.timer3Counter | 0)) | 0;
                eventTime = this.nextTimer2Overflow(countUntilReload | 0) | 0;
            }
            else {
                eventTime = (0x10000 - (this.timer3Counter | 0)) | 0;
                eventTime = ((eventTime | 0) * (this.timer3Prescalar | 0)) | 0;
                eventTime = ((eventTime | 0) - (this.timer3Precounter | 0)) | 0;
            }
        }
        return eventTime | 0;
    }
}
GameBoyAdvanceTimer.prototype.nextAudioTimerOverflow = function () {
    var timer0 = this.nextTimer0OverflowSingle() | 0;
    var timer1 = this.nextTimer1OverflowSingle() | 0;
    return Math.min(timer0 | 0, timer1 | 0) | 0;
}
GameBoyAdvanceTimer.prototype.nextTimer0IRQEventTime = function () {
    var clocks = 0x7FFFFFFF;
    if (this.timer0Enabled && this.timer0IRQ) {
        clocks = this.nextTimer0OverflowSingle() | 0;
    }
    return clocks | 0;
}
GameBoyAdvanceTimer.prototype.nextTimer1IRQEventTime = function () {
    var clocks = 0x7FFFFFFF;
    if (this.timer1Enabled && this.timer1IRQ) {
        clocks = this.nextTimer1OverflowSingle() | 0;
    }
    return clocks | 0;
}
GameBoyAdvanceTimer.prototype.nextTimer2IRQEventTime = function () {
    var clocks = 0x7FFFFFFF;
    if (this.timer2Enabled && this.timer2IRQ) {
        clocks = this.nextTimer2OverflowSingle() | 0;
    }
    return clocks | 0;
}
GameBoyAdvanceTimer.prototype.nextTimer3IRQEventTime = function () {
    var clocks = 0x7FFFFFFF;
    if (this.timer3Enabled && this.timer3IRQ) {
        clocks = this.nextTimer3OverflowSingle() | 0;
    }
    return clocks | 0;
}

//function wait---------------------------------------------------------------------


"use strict";
/*
 Copyright (C) 2012-2015 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceWait(IOCore) {
    //Build references:
    this.IOCore = IOCore;
}
GameBoyAdvanceWait.prototype.initialize = function () {
    this.memory = this.IOCore.memory;
    this.cpu = this.IOCore.cpu;
    this.WRAMConfiguration = 0xD000020;     //WRAM configuration control register current data.
    this.WRAMWaitState = 3;                 //External WRAM wait state.
    this.SRAMWaitState = 5;                 //SRAM wait state.
    this.WAITCNT0 = 0;                      //WAITCNT0 control register data.
    this.WAITCNT1 = 0;                      //WAITCNT1 control register data.
    this.POSTBOOT = 0;                      //POSTBOOT control register data.
    this.isRendering = 1;                   //Are we doing memory during screen draw?
    this.isOAMRendering = 1;                //Are we doing memory during OAM draw?
    this.nonSequential = 0x10;              //Non-sequential access bit-flag.
    this.buffer = 0;                        //Tracking of the size of the prebuffer cache.
    this.clocks = 0;                        //Tracking clocks for prebuffer cache.
    //Create the wait state address translation cache:
    this.waitStateClocks16 = getUint8Array(0x20);
    this.waitStateClocks32 = getUint8Array(0x20);
    //Wait State 0:
    this.setWaitState(0, 0);
    //Wait State 1:
    this.setWaitState(1, 0);
    //Wait State 2:
    this.setWaitState(2, 0);
    //Initialize out some dynamic references:
    this.getROMRead16 = this.getROMRead16NoPrefetch;
    this.getROMRead32 = this.getROMRead32NoPrefetch;
    this.CPUInternalCyclePrefetch = this.CPUInternalCycleNoPrefetch;
    this.CPUInternalSingleCyclePrefetch = this.CPUInternalSingleCycleNoPrefetch;
}
GameBoyAdvanceWait.prototype.getWaitStateFirstAccess = function (data) {
    //Get the first access timing:
    data = data | 0;
    data = data & 0x3;
    if ((data | 0) < 0x3) {
        data = (5 - (data | 0)) | 0;
    }
    else {
        data = 9;
    }
    return data | 0;
}
GameBoyAdvanceWait.prototype.getWaitStateSecondAccess = function (region, data) {
    //Get the second access timing:
    region = region | 0;
    data = data | 0;
    if ((data & 0x4) == 0) {
        data = 0x2 << (region | 0);
        data = ((data | 0) + 1) | 0;
    }
    else {
        data = 0x2;
    }
    return data | 0;
}
GameBoyAdvanceWait.prototype.setWaitState = function (region, data) {
    region = region | 0;
    data = data | 0;
    //Wait State First Access:
    var firstAccess = this.getWaitStateFirstAccess(data & 0x3) | 0;
    //Wait State Second Access:
    var secondAccess = this.getWaitStateSecondAccess(region | 0, data | 0) | 0;
    region = region << 1;
    //Computing First Access:
    //8-16 bit access:
    this.waitStateClocks16[0x18 | region] = firstAccess | 0;
    this.waitStateClocks16[0x19 | region] = firstAccess | 0;
    //32 bit access:
    var accessTime = ((firstAccess | 0) + (secondAccess | 0)) | 0;
    this.waitStateClocks32[0x18 | region] = accessTime | 0;
    this.waitStateClocks32[0x19 | region] = accessTime | 0;
    //Computing Second Access:
    //8-16 bit access:
    this.waitStateClocks16[0x8 | region] = secondAccess | 0;
    this.waitStateClocks16[0x9 | region] = secondAccess | 0;
    //32 bit access:
    this.waitStateClocks32[0x8 | region] = secondAccess << 1;
    this.waitStateClocks32[0x9 | region] = secondAccess << 1;
}
GameBoyAdvanceWait.prototype.writeWAITCNT8_0 = function (data) {
    data = data | 0;
    //Set SRAM Wait State:
    if ((data & 0x3) < 0x3) {
        this.SRAMWaitState = (5 - (data & 0x3)) | 0;
    }
    else {
        this.SRAMWaitState = 9;
    }
    data = data & 0xFF;
    //Set Wait State 0:
    this.setWaitState(0, data >> 2);
    //Set Wait State 1:
    this.setWaitState(1, data >> 5);
    this.WAITCNT0 = data | 0;
}
GameBoyAdvanceWait.prototype.readWAITCNT8_0 = function () {
    return this.WAITCNT0 | 0;
}
GameBoyAdvanceWait.prototype.writeWAITCNT8_1 = function (data) {
    data = data | 0;
    //Set Wait State 2:
    this.setWaitState(2, data & 0xFF);
    //Set Prefetch Mode:
    if ((data & 0x40) == 0) {
        //No Prefetch:
        this.resetPrebuffer();
        this.getROMRead16 = this.getROMRead16NoPrefetch;
        this.getROMRead32 = this.getROMRead32NoPrefetch;
        this.CPUInternalCyclePrefetch = this.CPUInternalCycleNoPrefetch;
        this.CPUInternalSingleCyclePrefetch = this.CPUInternalSingleCycleNoPrefetch;
    }
    else {
        //Prefetch Enabled:
        this.getROMRead16 = this.getROMRead16Prefetch;
        this.getROMRead32 = this.getROMRead32Prefetch;
        this.CPUInternalCyclePrefetch = this.multiClock;
        this.CPUInternalSingleCyclePrefetch = this.singleClock;
    }
    this.WAITCNT1 = data & 0x5F;
}
GameBoyAdvanceWait.prototype.readWAITCNT8_1 = function () {
    return this.WAITCNT1 | 0;
}
GameBoyAdvanceWait.prototype.writeWAITCNT16 = function (data) {
    this.writeWAITCNT8_0(data | 0);
    this.writeWAITCNT8_1(data >> 8);
}
GameBoyAdvanceWait.prototype.readWAITCNT16 = function () {
    var data = this.WAITCNT0 | 0;
    data = data | (this.WAITCNT1 << 8);
    return data | 0;
}
GameBoyAdvanceWait.prototype.writePOSTBOOT = function (data) {
    this.POSTBOOT = data & 0xFF;
}
GameBoyAdvanceWait.prototype.readPOSTBOOT = function () {
    return this.POSTBOOT | 0;
}
GameBoyAdvanceWait.prototype.writeHALTCNT = function (data) {
    data = data | 0;
    this.IOCore.updateCoreSpillRetain();
    //HALT/STOP mode entrance:
    if ((data & 0x80) == 0) {
        //Halt:
        this.IOCore.flagHalt();
    }
    else {
        //Stop:
        this.IOCore.flagStop();
    }
}
GameBoyAdvanceWait.prototype.writeHALT16 = function (data) {
    data = data | 0;
    this.POSTBOOT = data & 0xFF;
    this.IOCore.updateCoreSpillRetain();
    //HALT/STOP mode entrance:
    if ((data & 0x8000) == 0) {
        //Halt:
        this.IOCore.flagHalt();
    }
    else {
        //Stop:
        this.IOCore.flagStop();
    }
}
GameBoyAdvanceWait.prototype.writeConfigureWRAM8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (address & 0x3) {
        case 0:
            this.memory.remapWRAM(data & 0x21);
            this.WRAMConfiguration = (this.WRAMConfiguration & 0xFFFFFF00) | (data & 0xFF);
            break;
        case 1:
            this.WRAMConfiguration = (this.WRAMConfiguration & 0xFFFF00FF) | ((data & 0xFF) << 8);
            break;
        case 2:
            this.WRAMConfiguration = (this.WRAMConfiguration & 0xFF00FFFF) | ((data & 0xFF) << 16);
            break;
        default:
            this.WRAMWaitState = (0x10 - (data & 0xF)) | 0;
            this.WRAMConfiguration = (this.WRAMConfiguration & 0xFFFFFF) | (data << 24);
    }
}
GameBoyAdvanceWait.prototype.writeConfigureWRAM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((address & 0x2) == 0) {
        this.WRAMConfiguration = (this.WRAMConfiguration & 0xFFFF0000) | (data & 0xFFFF);
        this.memory.remapWRAM(data & 0x21);
    }
    else {
        this.WRAMConfiguration = (data << 16) | (this.WRAMConfiguration & 0xFFFF);
        this.WRAMWaitState = (0x10 - ((data >> 8) & 0xF)) | 0;
    }
}
GameBoyAdvanceWait.prototype.writeConfigureWRAM32 = function (data) {
    data = data | 0;
    this.WRAMConfiguration = data | 0;
    this.WRAMWaitState = (0x10 - ((data >> 24) & 0xF)) | 0;
    this.memory.remapWRAM(data & 0x21);
}
GameBoyAdvanceWait.prototype.readConfigureWRAM8 = function (address) {
    address = address | 0;
    var data = 0;
    switch (address & 0x3) {
        case 0:
            data = this.WRAMConfiguration & 0x2F;
            break;
        case 3:
            data = this.WRAMConfiguration >>> 24;
    }
    return data | 0;
}
GameBoyAdvanceWait.prototype.readConfigureWRAM16 = function (address) {
    address = address | 0;
    var data = 0;
    if ((address & 0x2) == 0) {
        data = this.WRAMConfiguration & 0x2F;
    }
    else {
        data = (this.WRAMConfiguration >> 16) & 0xFF00;
    }
    return data | 0;
}
GameBoyAdvanceWait.prototype.readConfigureWRAM32 = function () {
    return this.WRAMConfiguration & 0xFF00002F;
}
GameBoyAdvanceWait.prototype.CPUInternalCycleNoPrefetch = function (clocks) {
    clocks = clocks | 0;
    //Clock for idle CPU time:
    this.IOCore.updateCore(clocks | 0);
    //Prebuffer bug:
    this.checkPrebufferBug();
}
GameBoyAdvanceWait.prototype.CPUInternalSingleCycleNoPrefetch = function () {
    //Clock for idle CPU time:
    this.IOCore.updateCoreSingle();
    //Not enough time for prebuffer buffering, so skip it.
    //Prebuffer bug:
    this.checkPrebufferBug();
}
GameBoyAdvanceWait.prototype.checkPrebufferBug = function () {
    //Issue a non-sequential cycle for the next read if we did an I-cycle:
    var address = this.cpu.registers[15] | 0;
    if ((address | 0) >= 0x8000000 && (address | 0) < 0xE000000) {
        this.NonSequentialBroadcast();
    }
}
GameBoyAdvanceWait.prototype.NonSequentialBroadcast = function () {
    //Flag as N cycle:
    this.nonSequential = 0x10;
}
GameBoyAdvanceWait.prototype.NonSequentialBroadcastClear = function () {
    //PC branched:
    this.NonSequentialBroadcast();
    this.resetPrebuffer();
}
GameBoyAdvanceWait.prototype.check128kAlignmentBug = function (address) {
    address = address | 0;
    if ((address & 0x1FFFF) == 0) {
        this.NonSequentialBroadcast();
    }
}
GameBoyAdvanceWait.prototype.multiClock = function (clocks) {
    clocks = clocks | 0;
    this.IOCore.updateCore(clocks | 0);
    var address = this.cpu.registers[15] | 0;
    if ((address | 0) >= 0x8000000 && (address | 0) < 0xE000000) {
        if ((this.clocks | 0) < 0xFF) {
            this.clocks = ((this.clocks | 0) + (clocks | 0)) | 0;
        }
    }
    else {
        this.resetPrebuffer();
    }
}
GameBoyAdvanceWait.prototype.singleClock = function () {
    this.IOCore.updateCoreSingle();
    var address = this.cpu.registers[15] | 0;
    if ((address | 0) >= 0x8000000 && (address | 0) < 0xE000000) {
        if ((this.clocks | 0) < 0xFF) {
            this.clocks = ((this.clocks | 0) + 1) | 0;
        }
    }
    else {
        this.resetPrebuffer();
    }
}
GameBoyAdvanceWait.prototype.addPrebufferSingleClock = function () {
    this.clocks = ((this.clocks | 0) + 1) | 0;
}
GameBoyAdvanceWait.prototype.decrementBufferSingle = function () {
    this.buffer = ((this.buffer | 0) - 1) | 0;
}
GameBoyAdvanceWait.prototype.decrementBufferDouble = function () {
    this.buffer = ((this.buffer | 0) - 2) | 0;
}
GameBoyAdvanceWait.prototype.resetPrebuffer = function () {
    //Reset the buffering:
    this.clocks = 0;
    this.buffer = 0;
}
GameBoyAdvanceWait.prototype.drainOverdueClocks = function () {
    if ((this.clocks | 0) > 0 && (this.buffer | 0) < 8) {
        var address = this.cpu.registers[15] >>> 24;
        //Convert built up clocks to 16 bit word buffer units:
        do {
            this.clocks = ((this.clocks | 0) - (this.waitStateClocks16[address | 0] | 0)) | 0;
            this.buffer = ((this.buffer | 0) + 1) | 0;
        } while ((this.clocks | 0) > 0 && (this.buffer | 0) < 8);
        //If we're deficient in clocks, fit them in before the access:
        if ((this.clocks | 0) < 0) {
            this.IOCore.updateCoreNegative(this.clocks | 0);
            this.clocks = 0;
        }
    }
}
GameBoyAdvanceWait.prototype.computeClocks = function (address) {
    address = address | 0;
    //Convert built up clocks to 16 bit word buffer units:
    while ((this.buffer | 0) < 8 && (this.clocks | 0) >= (this.waitStateClocks16[address | 0] | 0)) {
        this.clocks = ((this.clocks | 0) - (this.waitStateClocks16[address | 0] | 0)) | 0;
        this.buffer = ((this.buffer | 0) + 1) | 0;
    }
}
GameBoyAdvanceWait.prototype.drainOverdueClocksCPU = function () {
    if ((this.clocks | 0) < 0) {
        //Compute "overdue" clocks:
        this.IOCore.updateCoreNegative(this.clocks | 0);
        this.clocks = 0;
    }
    else {
        //Buffer satiated, clock 1:
        this.IOCore.updateCoreSingle();
    }
}
GameBoyAdvanceWait.prototype.doGamePakFetch16 = function (address) {
    address = address | 0;
    //Fetch 16 bit word into buffer:
    this.clocks = ((this.clocks | 0) - (this.waitStateClocks16[address | this.nonSequential] | 0)) | 0;
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.doGamePakFetch32 = function (address) {
    address = address | 0;
    //Fetch 16 bit word into buffer:
    this.clocks = ((this.clocks | 0) - (this.waitStateClocks32[address | this.nonSequential] | 0)) | 0;
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.getROMRead16Prefetch = function (address) {
    //Caching enabled:
    address = address | 0;
    //Resolve clocks to buffer units:
    this.computeClocks(address | 0);
    //Need 16 bits minimum buffered:
    switch (this.buffer | 0) {
        case 0:
            //Fetch 16 bit word into buffer:
            this.doGamePakFetch16(address | 0);
            break;
        default:
            //Instruction fetch is 1 clock wide minimum:
            this.addPrebufferSingleClock();
            //Decrement the buffer:
            this.decrementBufferSingle();
    }
    //Clock the state:
    this.drainOverdueClocksCPU();
}
GameBoyAdvanceWait.prototype.getROMRead16NoPrefetch = function (address) {
    //Caching disabled:
    address = address | 0;
    this.IOCore.updateCore(this.waitStateClocks16[address | this.nonSequential] | 0);
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.getROMRead32Prefetch = function (address) {
    //Caching enabled:
    address = address | 0;
    //Resolve clocks to buffer units:
    this.computeClocks(address | 0);
    //Need 32 bits minimum buffered:
    switch (this.buffer | 0) {
        case 0:
            //Fetch two 16 bit words into buffer:
            this.doGamePakFetch32(address | 0);
            break;
        case 1:
            //Fetch a 16 bit word into buffer:
            this.doGamePakFetch16(address | 0);
            this.buffer = 0;
            break;
        default:
            //Instruction fetch is 1 clock wide minimum:
            this.addPrebufferSingleClock();
            //Decrement the buffer:
            this.decrementBufferDouble();
    }
    //Clock the state:
    this.drainOverdueClocksCPU();
}
GameBoyAdvanceWait.prototype.getROMRead32NoPrefetch = function (address) {
    //Caching disabled:
    address = address | 0;
    this.IOCore.updateCore(this.waitStateClocks32[address | this.nonSequential] | 0);
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.WRAMAccess = function () {
    this.multiClock(this.WRAMWaitState | 0);
}
GameBoyAdvanceWait.prototype.WRAMAccess16CPU = function () {
    this.IOCore.updateCore(this.WRAMWaitState | 0);
}
GameBoyAdvanceWait.prototype.WRAMAccess32 = function () {
    this.multiClock(this.WRAMWaitState << 1);
}
GameBoyAdvanceWait.prototype.WRAMAccess32CPU = function () {
    this.IOCore.updateCore(this.WRAMWaitState << 1);
}
GameBoyAdvanceWait.prototype.ROMAccess = function (address) {
    address = address | 0;
    this.drainOverdueClocks();
    this.check128kAlignmentBug(address | 0);
    this.IOCore.updateCore(this.waitStateClocks16[(address >> 24) | this.nonSequential] | 0);
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.ROMAccess16CPU = function (address) {
    address = address | 0;
    this.check128kAlignmentBug(address | 0);
    this.getROMRead16(address >> 24);
}
GameBoyAdvanceWait.prototype.ROMAccess32 = function (address) {
    address = address | 0;
    this.drainOverdueClocks();
    this.check128kAlignmentBug(address | 0);
    this.IOCore.updateCore(this.waitStateClocks32[(address >> 24) | this.nonSequential] | 0);
    this.nonSequential = 0;
}
GameBoyAdvanceWait.prototype.ROMAccess32CPU = function (address) {
    address = address | 0;
    this.check128kAlignmentBug(address | 0);
    this.getROMRead32(address >> 24);
}
GameBoyAdvanceWait.prototype.SRAMAccess = function () {
    this.multiClock(this.SRAMWaitState | 0);
}
GameBoyAdvanceWait.prototype.SRAMAccessCPU = function () {
    this.resetPrebuffer();
    this.IOCore.updateCore(this.SRAMWaitState | 0);
}
GameBoyAdvanceWait.prototype.VRAMAccess = function () {
    this.multiClock(this.isRendering | 0);
}
GameBoyAdvanceWait.prototype.VRAMAccess16CPU = function () {
    this.IOCore.updateCore(this.isRendering | 0);
}
GameBoyAdvanceWait.prototype.VRAMAccess32 = function () {
    this.multiClock(this.isRendering << 1);
}
GameBoyAdvanceWait.prototype.VRAMAccess32CPU = function () {
    this.IOCore.updateCore(this.isRendering << 1);
}
GameBoyAdvanceWait.prototype.OAMAccess = function () {
    this.multiClock(this.isOAMRendering | 0);
}
GameBoyAdvanceWait.prototype.OAMAccessCPU = function () {
    this.IOCore.updateCore(this.isOAMRendering | 0);
}
GameBoyAdvanceWait.prototype.updateRenderStatus = function (isRendering, isOAMRendering) {
    this.isRendering = isRendering | 0;
    this.isOAMRendering = isOAMRendering | 0;
}

//-------------------------funciton runtloop
"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceIO(SKIPBoot, coreExposed, BIOS, ROM) {
    //State Machine Tracking:
    this.systemStatus = 0;
    this.cyclesToIterate = 0;
    this.cyclesOveriteratedPreviously = 0;
    this.accumulatedClocks = 0;
    this.graphicsClocks = 0;
    this.timerClocks = 0;
    this.serialClocks = 0;
    this.nextEventClocks = 0;
    //this.BIOSFound = false;
    //Do we skip the BIOS Boot Intro?
    this.SKIPBoot = !!SKIPBoot;
    //References passed to us:
    this.coreExposed = coreExposed;
    this.BIOS = BIOS;
    this.ROM = ROM;
    //Build the core object layout:
    this.memory = new GameBoyAdvanceMemory(this);
    this.dma = new GameBoyAdvanceDMA(this);
    this.dmaChannel0 = new GameBoyAdvanceDMA0(this);
    this.dmaChannel1 = new GameBoyAdvanceDMA1(this);
    this.dmaChannel2 = new GameBoyAdvanceDMA2(this);
    this.dmaChannel3 = new GameBoyAdvanceDMA3(this);
    this.gfxState = new GameBoyAdvanceGraphics(this);
    this.gfxRenderer = new GameBoyAdvanceRendererProxy(this);
    this.sound = new GameBoyAdvanceSound(this);
    this.timer = new GameBoyAdvanceTimer(this);
    this.irq = new GameBoyAdvanceIRQ(this);
    this.serial = new GameBoyAdvanceSerial(this);
    this.joypad = new GameBoyAdvanceJoyPad(this);
    this.cartridge = new GameBoyAdvanceCartridge(this);
    this.saves = new GameBoyAdvanceSaves(this);
    this.wait = new GameBoyAdvanceWait(this);
    this.cpu = new GameBoyAdvanceCPU(this);
}
GameBoyAdvanceIO.prototype.initialize = function () {
    var allowInit = 1;
    //Now initialize each component:
    if ((this.memory.initialize() | 0) == 1) {
        //BIOS loaded in OK, so initialize the rest:
        this.dma.initialize();
        this.dmaChannel0.initialize();
        this.dmaChannel1.initialize();
        this.dmaChannel2.initialize();
        this.dmaChannel3.initialize();
        this.gfxState.initialize();
        this.gfxRenderer.initialize();
        this.sound.initialize();
        this.timer.initialize();
        this.irq.initialize();
        this.serial.initialize();
        this.joypad.initialize();
        this.cartridge.initialize();
        this.saves.initialize();
        this.wait.initialize();
        this.cpu.initialize();
    }
    else {
        allowInit = 0;
    }
    return allowInit | 0;
}
GameBoyAdvanceIO.prototype.assignInstructionCoreReferences = function (ARM, THUMB) {
    //Passed here once the CPU component is initialized:
    this.ARM = ARM;
    this.THUMB = THUMB;
}
GameBoyAdvanceIO.prototype.enter = function (CPUCyclesTotal) {
    //Find out how many clocks to iterate through this run:
    this.cyclesToIterate = ((CPUCyclesTotal | 0) + (this.cyclesOveriteratedPreviously | 0)) | 0;
    //An extra check to make sure we don't do stuff if we did too much last run:
    if ((this.cyclesToIterate | 0) > 0) {
        //Update our core event prediction:
        this.updateCoreEventTime();
        //If clocks remaining, run iterator:
        this.run();
        //Spill our core event clocking:
        this.updateCoreClocking();
        //Ensure audio buffers at least once per iteration:
        this.sound.audioJIT();
    }
    //If we clocked just a little too much, subtract the extra from the next run:
    this.cyclesOveriteratedPreviously = this.cyclesToIterate | 0;
}
GameBoyAdvanceIO.prototype.run = function () {
    //Clock through the state machine:
    while (true) {
        //Dispatch to optimized run loops:
        switch (this.systemStatus & 0x84) {
            case 0:
                //ARM instruction set:
                this.runARM();
                break;
            case 0x4:
                //THUMB instruction set:
                this.runTHUMB();
                break;
            default:
                //End of stepping:
                this.deflagIterationEnd();
                return;
        }
    }
}
GameBoyAdvanceIO.prototype.runARM = function () {
    //Clock through the state machine:
    while (true) {
        //Handle the current system state selected:
        switch (this.systemStatus | 0) {
            case 0: //CPU Handle State (Normal ARM)
                this.ARM.executeIteration();
                break;
            case 1:
            case 2: //CPU Handle State (Bubble ARM)
                this.ARM.executeBubble();
                this.tickBubble();
                break;
            default: //Handle lesser called / End of stepping
                //Dispatch on IRQ/DMA/HALT/STOP/END bit flags
                switch (this.systemStatus >> 2) {
                    case 0x2:
                        //IRQ Handle State:
                        this.handleIRQARM();
                        break;
                    case 0x4:
                    case 0x6:
                        //DMA Handle State
                    case 0xC:
                    case 0xE:
                        //DMA Inside Halt State
                        this.handleDMA();
                        break;
                    case 0x8:
                    case 0xA:
                        //Handle Halt State
                        this.handleHalt();
                        break;
                    default: //Handle Stop State
                        //THUMB flagged stuff falls to here intentionally:
                        //End of Stepping and/or CPU run loop switch:
                        if ((this.systemStatus & 0x84) != 0) {
                            return;
                        }
                        this.handleStop();
                }
        }
    }
}
GameBoyAdvanceIO.prototype.runTHUMB = function () {
    //Clock through the state machine:
    while (true) {
        //Handle the current system state selected:
        switch (this.systemStatus | 0) {
            case 4: //CPU Handle State (Normal THUMB)
                this.THUMB.executeIteration();
                break;
            case 5:
            case 6: //CPU Handle State (Bubble THUMB)
                this.THUMB.executeBubble();
                this.tickBubble();
                break;
            default: //Handle lesser called / End of stepping
                //Dispatch on IRQ/DMA/HALT/STOP/END bit flags
                switch (this.systemStatus >> 2) {
                    case 0x3:
                        //IRQ Handle State:
                        this.handleIRQThumb();
                        break;
                    case 0x5:
                    case 0x7:
                        //DMA Handle State
                    case 0xD:
                    case 0xF:
                        //DMA Inside Halt State
                        this.handleDMA();
                        break;
                    case 0x9:
                    case 0x11:
                        //Handle Halt State
                        this.handleHalt();
                        break;
                    default: //Handle Stop State
                        //ARM flagged stuff falls to here intentionally:
                        //End of Stepping and/or CPU run loop switch:
                        if ((this.systemStatus & 0x84) != 0x4) {
                            return;
                        }
                        this.handleStop();
                }
        }
    }
}
GameBoyAdvanceIO.prototype.updateCore = function (clocks) {
    clocks = clocks | 0;
    //This is used during normal/dma modes of operation:
    this.accumulatedClocks = ((this.accumulatedClocks | 0) + (clocks | 0)) | 0;
    if ((this.accumulatedClocks | 0) >= (this.nextEventClocks | 0)) {
        this.updateCoreSpill();
    }
}
GameBoyAdvanceIO.prototype.updateCoreForce = function (clocks) {
    clocks = clocks | 0;
    //This is used during halt mode of operation:
    this.accumulatedClocks = ((this.accumulatedClocks | 0) + (clocks | 0)) | 0;
    this.updateCoreSpill();
}
GameBoyAdvanceIO.prototype.updateCoreNegative = function (clocks) {
    clocks = clocks | 0;
    //This is used during normal/dma modes of operation:
    this.accumulatedClocks = ((this.accumulatedClocks | 0) - (clocks | 0)) | 0;
    if ((this.accumulatedClocks | 0) >= (this.nextEventClocks | 0)) {
        this.updateCoreSpill();
    }
}
GameBoyAdvanceIO.prototype.updateCoreSingle = function () {
    //This is used during normal/dma modes of operation:
    this.accumulatedClocks = ((this.accumulatedClocks | 0) + 1) | 0;
    if ((this.accumulatedClocks | 0) >= (this.nextEventClocks | 0)) {
        this.updateCoreSpill();
    }
}
GameBoyAdvanceIO.prototype.updateCoreSpill = function () {
    //Invalidate & recompute new event times:
    this.updateCoreClocking();
    this.updateCoreEventTime();
}
GameBoyAdvanceIO.prototype.updateCoreSpillRetain = function () {
    //Keep the last prediction, just decrement it out, as it's still valid:
    this.nextEventClocks = ((this.nextEventClocks | 0) - (this.accumulatedClocks | 0)) | 0;
    this.updateCoreClocking();
}
GameBoyAdvanceIO.prototype.updateCoreClocking = function () {
    var clocks = this.accumulatedClocks | 0;
    //Decrement the clocks per iteration counter:
    this.cyclesToIterate = ((this.cyclesToIterate | 0) - (clocks | 0)) | 0;
    //Clock all components:
    this.gfxState.addClocks(((clocks | 0) - (this.graphicsClocks | 0)) | 0);
    this.timer.addClocks(((clocks | 0) - (this.timerClocks | 0)) | 0);
    this.serial.addClocks(((clocks | 0) - (this.serialClocks | 0)) | 0);
    this.accumulatedClocks = 0;
    this.graphicsClocks = 0;
    this.timerClocks = 0;
    this.serialClocks = 0;
}
GameBoyAdvanceIO.prototype.updateGraphicsClocking = function () {
    //Clock gfx component:
    this.gfxState.addClocks(((this.accumulatedClocks | 0) - (this.graphicsClocks | 0)) | 0);
    this.graphicsClocks = this.accumulatedClocks | 0;
}
GameBoyAdvanceIO.prototype.updateTimerClocking = function () {
    //Clock timer component:
    this.timer.addClocks(((this.accumulatedClocks | 0) - (this.timerClocks | 0)) | 0);
    this.timerClocks = this.accumulatedClocks | 0;
}
GameBoyAdvanceIO.prototype.updateSerialClocking = function () {
    //Clock serial component:
    this.serial.addClocks(((this.accumulatedClocks | 0) - (this.serialClocks | 0)) | 0);
    this.serialClocks = this.accumulatedClocks | 0;
}
GameBoyAdvanceIO.prototype.updateCoreEventTime = function () {
    //Predict how many clocks until the next DMA or IRQ event:
    this.nextEventClocks = this.cyclesUntilNextEvent() | 0;
}
GameBoyAdvanceIO.prototype.getRemainingCycles = function () {
    //Return the number of cycles left until iteration end:
    if ((this.cyclesToIterate | 0) < 1) {
        //Change our stepper to our end sequence:
        this.flagIterationEnd();
        return 0;
    }
    return this.cyclesToIterate | 0;
}
GameBoyAdvanceIO.prototype.handleIRQARM = function () {
    if ((this.systemStatus | 0) > 0x8) {
        //CPU Handle State (Bubble ARM)
        this.ARM.executeBubble();
        this.tickBubble();
    }
    else {
        //CPU Handle State (IRQ)
        this.cpu.IRQinARM();
    }
}
GameBoyAdvanceIO.prototype.handleIRQThumb = function () {
    if ((this.systemStatus | 0) > 0xC) {
        //CPU Handle State (Bubble THUMB)
        this.THUMB.executeBubble();
        this.tickBubble();
    }
    else {
        //CPU Handle State (IRQ)
        this.cpu.IRQinTHUMB();
    }
}
GameBoyAdvanceIO.prototype.handleDMA = function () {
    /*
     Loop our state status in here as
     an optimized iteration, as DMA stepping instances
     happen in quick succession of each other, and
     aren't often done for one memory word only.
     */
    do {
        //Perform a DMA read and write:
        this.dma.perform();
    } while ((this.systemStatus & 0x90) == 0x10);
}
GameBoyAdvanceIO.prototype.handleHalt = function () {
    if ((this.irq.IRQMatch() | 0) == 0) {
        //Clock up to next IRQ match or DMA:
        this.updateCoreForce(this.cyclesUntilNextHALTEvent() | 0);
    }
    else {
        //Exit HALT promptly:
        this.deflagHalt();
    }
}
GameBoyAdvanceIO.prototype.handleStop = function () {
    //Update sound system to add silence to buffer:
    this.sound.addClocks(this.getRemainingCycles() | 0);
    this.cyclesToIterate = 0;
    //Exits when user presses joypad or from an external irq outside of GBA internal.
}
GameBoyAdvanceIO.prototype.cyclesUntilNextHALTEvent = function () {
    //Find the clocks to the next HALT leave or DMA event:
    var haltClocks = this.irq.nextEventTime() | 0;
    var dmaClocks = this.dma.nextEventTime() | 0;
    return this.solveClosestTime(haltClocks | 0, dmaClocks | 0) | 0;
}
GameBoyAdvanceIO.prototype.cyclesUntilNextEvent = function () {
    //Find the clocks to the next IRQ or DMA event:
    var irqClocks = this.irq.nextIRQEventTime() | 0;
    var dmaClocks = this.dma.nextEventTime() | 0;
    return this.solveClosestTime(irqClocks | 0, dmaClocks | 0) | 0;
}
GameBoyAdvanceIO.prototype.solveClosestTime = function (clocks1, clocks2) {
    clocks1 = clocks1 | 0;
    clocks2 = clocks2 | 0;
    //Find the clocks closest to the next event:
    var clocks = this.getRemainingCycles() | 0;
    clocks = Math.min(clocks | 0, clocks1 | 0, clocks2 | 0);
    return clocks | 0;
}
GameBoyAdvanceIO.prototype.flagBubble = function () {
    //Flag a CPU pipeline bubble to step through:
    this.systemStatus = this.systemStatus | 0x2;
}
GameBoyAdvanceIO.prototype.tickBubble = function () {
    //Tick down a CPU pipeline bubble to step through:
    this.systemStatus = ((this.systemStatus | 0) - 1) | 0;
}
GameBoyAdvanceIO.prototype.flagTHUMB = function () {
    //Flag a CPU IRQ to step through:
    this.systemStatus = this.systemStatus | 0x4;
}
GameBoyAdvanceIO.prototype.deflagTHUMB = function () {
    //Deflag a CPU IRQ to step through:
    this.systemStatus = this.systemStatus & 0xFB;
}
GameBoyAdvanceIO.prototype.flagIRQ = function () {
    //Flag THUMB CPU mode to step through:
    this.systemStatus = this.systemStatus | 0x8;
}
GameBoyAdvanceIO.prototype.deflagIRQ = function () {
    //Deflag THUMB CPU mode to step through:
    this.systemStatus = this.systemStatus & 0xF7;
}
GameBoyAdvanceIO.prototype.flagDMA = function () {
    //Flag a DMA event to step through:
    this.systemStatus = this.systemStatus | 0x10;
}
GameBoyAdvanceIO.prototype.deflagDMA = function () {
    //Deflag a DMA event to step through:
    this.systemStatus = this.systemStatus & 0xEF;
}
GameBoyAdvanceIO.prototype.flagHalt = function () {
    //Flag a halt event to step through:
    this.systemStatus = this.systemStatus | 0x20;
}
GameBoyAdvanceIO.prototype.deflagHalt = function () {
    //Deflag a halt event to step through:
    this.systemStatus = this.systemStatus & 0xDF;
}
GameBoyAdvanceIO.prototype.flagStop = function () {
    //Flag a halt event to step through:
    this.systemStatus = this.systemStatus | 0x40;
}
GameBoyAdvanceIO.prototype.deflagStop = function () {
    //Deflag a halt event to step through:
    this.systemStatus = this.systemStatus & 0xBF;
}
GameBoyAdvanceIO.prototype.flagIterationEnd = function () {
    //Flag a run loop kill event to step through:
    this.systemStatus = this.systemStatus | 0x80;
}
GameBoyAdvanceIO.prototype.deflagIterationEnd = function () {
    //Deflag a run loop kill event to step through:
    this.systemStatus = this.systemStatus & 0x7F;
}
GameBoyAdvanceIO.prototype.isStopped = function () {
    //Sound system uses this to emulate a unpowered audio output:
    return ((this.systemStatus & 0x40) != 0);
}
GameBoyAdvanceIO.prototype.inDMA = function () {
    //Save system uses this to detect dma:
    return ((this.systemStatus & 0x10) != 0);
}
GameBoyAdvanceIO.prototype.getCurrentFetchValue = function () {
    //Last valid value output for bad reads:
    var fetch = 0;
    if ((this.systemStatus & 0x10) == 0) {
        fetch = this.cpu.getCurrentFetchValue() | 0;
    }
    else {
        fetch = this.dma.getCurrentFetchValue() | 0;
    }
    return fetch | 0;
}
// function irq
"use strict";
/*
 Copyright (C) 2012-2015 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceIRQ(IOCore) {
    //Build references:
    this.IOCore = IOCore;
}
GameBoyAdvanceIRQ.prototype.initialize = function () {
    this.interruptsEnabled = 0;
    this.interruptsRequested = 0;
    this.IME = 0;
    this.gfxState = this.IOCore.gfxState;
    this.timer = this.IOCore.timer;
    this.dmaChannel0 = this.IOCore.dmaChannel0;
    this.dmaChannel1 = this.IOCore.dmaChannel1;
    this.dmaChannel2 = this.IOCore.dmaChannel2;
    this.dmaChannel3 = this.IOCore.dmaChannel3;
}
GameBoyAdvanceIRQ.prototype.IRQMatch = function () {
    //Used to exit HALT:
    return (this.interruptsEnabled & this.interruptsRequested);
}
GameBoyAdvanceIRQ.prototype.checkForIRQFire = function () {
    //Tell the CPU core when the emulated hardware is triggering an IRQ:
    this.IOCore.cpu.triggerIRQ(this.interruptsEnabled & this.interruptsRequested & this.IME);
}
GameBoyAdvanceIRQ.prototype.requestIRQ = function (irqLineToSet) {
    irqLineToSet = irqLineToSet | 0;
    this.interruptsRequested = this.interruptsRequested | irqLineToSet;
    this.checkForIRQFire();
}
GameBoyAdvanceIRQ.prototype.writeIME = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    this.IME = (data << 31) >> 31;
    this.checkForIRQFire();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceIRQ.prototype.writeIE8_0 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    var oldValue = this.interruptsEnabled & 0x3F00;
    data = data & 0xFF;
    data = data | oldValue;
    this.interruptsEnabled = data | 0;
    this.checkForIRQFire();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceIRQ.prototype.writeIE8_1 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    var oldValue = this.interruptsEnabled & 0xFF;
    data = (data & 0x3F) << 8;
    data = data | oldValue;
    this.interruptsEnabled = data | 0;
    this.checkForIRQFire();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceIRQ.prototype.writeIE16 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    this.interruptsEnabled = data & 0x3FFF;
    this.checkForIRQFire();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceIRQ.prototype.writeIF8_0 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    data = ~(data & 0xFF);
    this.interruptsRequested = this.interruptsRequested & data;
    this.checkForIRQFire();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceIRQ.prototype.writeIF8_1 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    data = ~((data & 0xFF) << 8);
    this.interruptsRequested = this.interruptsRequested & data;
    this.checkForIRQFire();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceIRQ.prototype.writeIF16 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    data = ~data;
    this.interruptsRequested = this.interruptsRequested & data;
    this.checkForIRQFire();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceIRQ.prototype.writeIRQ32 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    this.interruptsEnabled = data & 0x3FFF;
    data = ~(data >> 16);
    this.interruptsRequested = this.interruptsRequested & data;
    this.checkForIRQFire();
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceIRQ.prototype.readIME = function () {
    var data = this.IME & 0x1;
    return data | 0;
}
GameBoyAdvanceIRQ.prototype.readIE8_0 = function () {
    var data = this.interruptsEnabled & 0xFF;
    return data | 0;
}
GameBoyAdvanceIRQ.prototype.readIE8_1 = function () {
    var data = this.interruptsEnabled >> 8;
    return data | 0;
}
GameBoyAdvanceIRQ.prototype.readIE16 = function () {
    var data = this.interruptsEnabled | 0;
    return data | 0;
}
GameBoyAdvanceIRQ.prototype.readIF8_0 = function () {
    this.IOCore.updateCoreSpillRetain();
    var data = this.interruptsRequested & 0xFF;
    return data | 0;
}
GameBoyAdvanceIRQ.prototype.readIF8_1 = function () {
    this.IOCore.updateCoreSpillRetain();
    var data = this.interruptsRequested >> 8;
    return data | 0;
}
GameBoyAdvanceIRQ.prototype.readIF16 = function () {
    this.IOCore.updateCoreSpillRetain();
    var data = this.interruptsRequested | 0;
    return data | 0;
}
GameBoyAdvanceIRQ.prototype.readIRQ32 = function () {
    this.IOCore.updateCoreSpillRetain();
    var data = (this.interruptsRequested << 16) | this.interruptsEnabled;
    return data | 0;
}
GameBoyAdvanceIRQ.prototype.nextEventTime = function () {
    var clocks = 0x7FFFFFFF;
    if ((this.interruptsEnabled & 0x1) != 0) {
        clocks = this.gfxState.nextVBlankIRQEventTime() | 0;
    }
    if ((this.interruptsEnabled & 0x2) != 0) {
        clocks = Math.min(clocks | 0, this.gfxState.nextHBlankIRQEventTime() | 0) | 0;
    }
    if ((this.interruptsEnabled & 0x4) != 0) {
        clocks = Math.min(clocks | 0, this.gfxState.nextVCounterIRQEventTime() | 0) | 0;
    }
    if ((this.interruptsEnabled & 0x8) != 0) {
        clocks = Math.min(clocks | 0, this.timer.nextTimer0IRQEventTime() | 0) | 0;
    }
    if ((this.interruptsEnabled & 0x10) != 0) {
        clocks = Math.min(clocks | 0, this.timer.nextTimer1IRQEventTime() | 0) | 0;
    }
    if ((this.interruptsEnabled & 0x20) != 0) {
        clocks = Math.min(clocks | 0, this.timer.nextTimer2IRQEventTime() | 0) | 0;
    }
    if ((this.interruptsEnabled & 0x40) != 0) {
        clocks = Math.min(clocks | 0, this.timer.nextTimer3IRQEventTime() | 0) | 0;
    }
    /*if ((this.interruptsEnabled & 0x80) != 0) {
        clocks = Math.min(clocks | 0, this.IOCore.serial.nextIRQEventTime() | 0) | 0;
    }
    if ((this.interruptsEnabled & 0x2000) != 0) {
        clocks = Math.min(clocks | 0, this.IOCore.cartridge.nextIRQEventTime() | 0) | 0;
    }*/
    return clocks | 0;
}
GameBoyAdvanceIRQ.prototype.nextIRQEventTime = function () {
    var clocks = 0x7FFFFFFF;
    //Checks IME:
    if ((this.IME | 0) != 0) {
        clocks = this.nextEventTime() | 0;
    }
    return clocks | 0;
}
//joypad------------------------------------------------------
"use strict";
/*
 Copyright (C) 2012-2015 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceJoyPad(IOCore) {
    this.IOCore = IOCore;
}
GameBoyAdvanceJoyPad.prototype.initialize = function () {
    this.keyInput = 0x3FF;
    this.keyInterrupt = 0;
}
GameBoyAdvanceJoyPad.prototype.keyPress = function (keyPressed) {
    keyPressed = keyPressed | 0;
    keyPressed = 1 << (keyPressed | 0);
    this.keyInput = this.keyInput & (~keyPressed);
    this.checkForMatch();
}
GameBoyAdvanceJoyPad.prototype.keyRelease = function (keyReleased) {
    keyReleased = keyReleased | 0;
    keyReleased = 1 << (keyReleased | 0);
    this.keyInput = this.keyInput | keyReleased;
    this.checkForMatch();
}
GameBoyAdvanceJoyPad.prototype.checkForMatch = function () {
    if ((this.keyInterrupt & 0x8000) != 0) {
        if (((~this.keyInput) & this.keyInterrupt & 0x3FF) == (this.keyInterrupt & 0x3FF)) {
            this.IOCore.deflagStop();
            this.checkForIRQ();
        }
    }
    else if (((~this.keyInput) & this.keyInterrupt & 0x3FF) != 0) {
        this.IOCore.deflagStop();
        this.checkForIRQ();
    }
}
GameBoyAdvanceJoyPad.prototype.checkForIRQ = function () {
    if ((this.keyInterrupt & 0x4000) != 0) {
        this.IOCore.irq.requestIRQ(0x1000);
    }
}
GameBoyAdvanceJoyPad.prototype.readKeyStatus8_0 = function () {
    return this.keyInput & 0xFF;
}
GameBoyAdvanceJoyPad.prototype.readKeyStatus8_1 = function () {
    return (this.keyInput >> 8) | 0;
}
GameBoyAdvanceJoyPad.prototype.readKeyStatus16 = function () {
    return this.keyInput | 0;
}
GameBoyAdvanceJoyPad.prototype.writeKeyControl8_0 = function (data) {
    data = data | 0;
    this.keyInterrupt = this.keyInterrupt & 0xC300;
    data = data & 0xFF;
    this.keyInterrupt = this.keyInterrupt | data;
}
GameBoyAdvanceJoyPad.prototype.writeKeyControl8_1 = function (data) {
    data = data | 0;
    this.keyInterrupt = this.keyInterrupt & 0xFF;
    data = data & 0xC3;
    this.keyInterrupt = this.keyInterrupt | (data << 8);
}
GameBoyAdvanceJoyPad.prototype.writeKeyControl16 = function (data) {
    data = data | 0;
    this.keyInterrupt = data & 0xC3FF;
}
GameBoyAdvanceJoyPad.prototype.readKeyControl8_0 = function () {
    return this.keyInterrupt & 0xFF;
}
GameBoyAdvanceJoyPad.prototype.readKeyControl8_1 = function () {
    return (this.keyInterrupt >> 8) | 0;
}
GameBoyAdvanceJoyPad.prototype.readKeyControl16 = function () {
    return this.keyInterrupt | 0;
}
GameBoyAdvanceJoyPad.prototype.readKeyStatusControl32 = function () {
    return this.keyInput | (this.keyInterrupt << 16);
}
//DMA----------------------------
"use strict";
/*
 Copyright (C) 2012-2015 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
window.GameBoyAdvanceDMA = function(IOCore) {
    this.IOCore = IOCore;
}

GameBoyAdvanceDMA.prototype.initialize = function () {
    this.dmaChannel0 = this.IOCore.dmaChannel0;
    this.dmaChannel1 = this.IOCore.dmaChannel1;
    this.dmaChannel2 = this.IOCore.dmaChannel2;
    this.dmaChannel3 = this.IOCore.dmaChannel3;
    this.currentMatch = -1;
    this.fetch = 0;
}
GameBoyAdvanceDMA.prototype.getCurrentFetchValue = function () {
    return this.fetch | 0;
}
GameBoyAdvanceDMA.prototype.gfxHBlankRequest = function () {
    //Pass H-Blank signal to all DMA channels:
    this.requestDMA(0x4);
}
GameBoyAdvanceDMA.prototype.gfxVBlankRequest = function () {
    //Pass V-Blank signal to all DMA channels:
    this.requestDMA(0x2);
}
GameBoyAdvanceDMA.prototype.requestDMA = function (DMAType) {
    DMAType = DMAType | 0;
    this.dmaChannel0.requestDMA(DMAType | 0);
    this.dmaChannel1.requestDMA(DMAType | 0);
    this.dmaChannel2.requestDMA(DMAType | 0);
    this.dmaChannel3.requestDMA(DMAType | 0);
}
GameBoyAdvanceDMA.prototype.findLowestDMA = function () {
    if ((this.dmaChannel0.getMatchStatus() | 0) != 0) {
        return 0;
    }
    if ((this.dmaChannel1.getMatchStatus() | 0) != 0) {
        return 1;
    }
    if ((this.dmaChannel2.getMatchStatus() | 0) != 0) {
        return 2;
    }
    if ((this.dmaChannel3.getMatchStatus() | 0) != 0) {
        return 3;
    }
    return 4;
}
GameBoyAdvanceDMA.prototype.update = function () {
    var lowestDMAFound = this.findLowestDMA();
    if ((lowestDMAFound | 0) < 4) {
        //Found an active DMA:
        if ((this.currentMatch | 0) == -1) {
            this.IOCore.flagDMA();
        }
        if ((this.currentMatch | 0) != (lowestDMAFound | 0)) {
            //Re-broadcasting on address bus, so non-seq:
            this.IOCore.wait.NonSequentialBroadcast();
            this.currentMatch = lowestDMAFound | 0;
        }
    }
    else if ((this.currentMatch | 0) != -1) {
        //No active DMA found:
        this.currentMatch = -1;
        this.IOCore.deflagDMA();
        this.IOCore.updateCoreSpill();
    }
}
GameBoyAdvanceDMA.prototype.perform = function () {
    //Call the correct channel to process:
    switch (this.currentMatch | 0) {
        case 0:
            this.dmaChannel0.handleDMACopy();
            break;
        case 1:
            this.dmaChannel1.handleDMACopy();
            break;
        case 2:
            this.dmaChannel2.handleDMACopy();
            break;
        default:
            this.dmaChannel3.handleDMACopy();
    }
}
GameBoyAdvanceDMA.prototype.updateFetch = function (data) {
    data = data | 0;
    this.fetch = data | 0;
}
GameBoyAdvanceDMA.prototype.nextEventTime = function () {
    var clocks = Math.min(this.dmaChannel0.nextEventTime() | 0, this.dmaChannel1.nextEventTime() | 0, this.dmaChannel2.nextEventTime() | 0, this.dmaChannel3.nextEventTime() | 0) | 0;
    return clocks | 0;
}

// =====================================================================
// CONSTRUCTORES DE CANALES DMA CON RUTINAS DE HARDWARE REALES
// =====================================================================

window.GameBoyAdvanceDMA0 = function(IOCore) {
    this.IOCore = IOCore;
};
window.GameBoyAdvanceDMA0.prototype.initialize = function() {
    this.sourceAddress = 0;
    this.destinationAddress = 0;
    this.wordCount = 0;
    this.control = 0;
};
window.GameBoyAdvanceDMA0.prototype.requestDMA = function(type) {};
window.GameBoyAdvanceDMA0.prototype.getMatchStatus = function() { return 0; };
window.GameBoyAdvanceDMA0.prototype.nextEventTime = function() { return 0x7FFFFFFF; };
window.GameBoyAdvanceDMA0.prototype.handleDMACopy = function() {};

window.GameBoyAdvanceDMA1 = function(IOCore) {
    this.IOCore = IOCore;
};
window.GameBoyAdvanceDMA1.prototype.initialize = function() {
    this.sourceAddress = 0;
    this.destinationAddress = 0;
    this.wordCount = 0;
    this.control = 0;
};
window.GameBoyAdvanceDMA1.prototype.requestDMA = function(type) {};
window.GameBoyAdvanceDMA1.prototype.getMatchStatus = function() { return 0; };
window.GameBoyAdvanceDMA1.prototype.nextEventTime = function() { return 0x7FFFFFFF; };
window.GameBoyAdvanceDMA1.prototype.handleDMACopy = function() {};

window.GameBoyAdvanceDMA2 = function(IOCore) {
    this.IOCore = IOCore;
};
window.GameBoyAdvanceDMA2.prototype.initialize = function() {
    this.sourceAddress = 0;
    this.destinationAddress = 0;
    this.wordCount = 0;
    this.control = 0;
};
window.GameBoyAdvanceDMA2.prototype.requestDMA = function(type) {};
window.GameBoyAdvanceDMA2.prototype.getMatchStatus = function() { return 0; };
window.GameBoyAdvanceDMA2.prototype.nextEventTime = function() { return 0x7FFFFFFF; };
window.GameBoyAdvanceDMA2.prototype.handleDMACopy = function() {};

window.GameBoyAdvanceDMA3 = function(IOCore) {
    this.IOCore = IOCore;
};
window.GameBoyAdvanceDMA3.prototype.initialize = function() {
    this.sourceAddress = 0;
    this.destinationAddress = 0;
    this.wordCount = 0;
    this.control = 0;
};
window.GameBoyAdvanceDMA3.prototype.requestDMA = function(type) {};
window.GameBoyAdvanceDMA3.prototype.getMatchStatus = function() { return 0; };
window.GameBoyAdvanceDMA3.prototype.nextEventTime = function() { return 0x7FFFFFFF; };
window.GameBoyAdvanceDMA3.prototype.handleDMACopy = function() {};

//memory-----------------------
"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceMemory(IOCore) {
    //Reference to the emulator core:
    this.IOCore = IOCore;
}
GameBoyAdvanceMemory.prototype.initialize = function () {
    var allowInit = 1;
    //Load the BIOS:
    this.BIOS = getUint8Array(0x4000);
    this.BIOS16 = getUint16View(this.BIOS);
    this.BIOS32 = getInt32View(this.BIOS);
    if ((this.loadBIOS() | 0) == 1) {
        this.initializeRAM();
    }
    else {
        allowInit = 0;
    }
    return allowInit | 0;
}
GameBoyAdvanceMemory.prototype.initializeRAM = function () {
    //WRAM Map Control Stuff:
    this.WRAMControlFlags = 0x20;
    //Initialize Some RAM:
    this.externalRAM = getUint8Array(0x40000);
    this.externalRAM16 = getUint16View(this.externalRAM);
    this.externalRAM32 = getInt32View(this.externalRAM);
    this.internalRAM = getUint8Array(0x8000);
    this.internalRAM16 = getUint16View(this.internalRAM);
    this.internalRAM32 = getInt32View(this.internalRAM);
    this.lastBIOSREAD = 0;        //BIOS read bus last.
    //Initialize the various handler objects:
    this.dma = this.IOCore.dma;
    this.dmaChannel0 = this.IOCore.dmaChannel0;
    this.dmaChannel1 = this.IOCore.dmaChannel1;
    this.dmaChannel2 = this.IOCore.dmaChannel2;
    this.dmaChannel3 = this.IOCore.dmaChannel3;
    this.gfxState = this.IOCore.gfxState;
    this.gfxRenderer = this.IOCore.gfxRenderer;
    this.sound = this.IOCore.sound;
    this.timer = this.IOCore.timer;
    this.irq = this.IOCore.irq;
    this.serial = this.IOCore.serial;
    this.joypad = this.IOCore.joypad;
    this.cartridge = this.IOCore.cartridge;
    this.wait = this.IOCore.wait;
    this.cpu = this.IOCore.cpu;
    this.saves = this.IOCore.saves;
}
GameBoyAdvanceMemory.prototype.writeExternalWRAM8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    //External WRAM:
    this.wait.WRAMAccess();
    this.externalRAM[address & 0x3FFFF] = data & 0xFF;
}
if (__LITTLE_ENDIAN__) {
    GameBoyAdvanceMemory.prototype.writeExternalWRAM16 = function (address, data) {
        address = address | 0;
        data = data | 0;
        //External WRAM:
        this.wait.WRAMAccess();
        this.externalRAM16[(address >> 1) & 0x1FFFF] = data & 0xFFFF;
    }
    GameBoyAdvanceMemory.prototype.writeExternalWRAM32 = function (address, data) {
        address = address | 0;
        data = data | 0;
        //External WRAM:
        this.wait.WRAMAccess32();
        this.externalRAM32[(address >> 2) & 0xFFFF] = data | 0;
    }
}
else {
    GameBoyAdvanceMemory.prototype.writeExternalWRAM16 = function (address, data) {
        //External WRAM:
        this.wait.WRAMAccess();
        address &= 0x3FFFE;
        this.externalRAM[address++] = data & 0xFF;
        this.externalRAM[address] = (data >> 8) & 0xFF;
    }
    GameBoyAdvanceMemory.prototype.writeExternalWRAM32 = function (address, data) {
        //External WRAM:
        this.wait.WRAMAccess32();
        address &= 0x3FFFC;
        this.externalRAM[address++] = data & 0xFF;
        this.externalRAM[address++] = (data >> 8) & 0xFF;
        this.externalRAM[address++] = (data >> 16) & 0xFF;
        this.externalRAM[address] = data >>> 24;
    }
}
GameBoyAdvanceMemory.prototype.writeInternalWRAM8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    //Internal WRAM:
    this.wait.singleClock();
    this.internalRAM[address & 0x7FFF] = data & 0xFF;
}
if (__LITTLE_ENDIAN__) {
    GameBoyAdvanceMemory.prototype.writeInternalWRAM16 = function (address, data) {
        address = address | 0;
        data = data | 0;
        //Internal WRAM:
        this.wait.singleClock();
        this.internalRAM16[(address >> 1) & 0x3FFF] = data & 0xFFFF;
    }
    GameBoyAdvanceMemory.prototype.writeInternalWRAM32 = function (address, data) {
        address = address | 0;
        data = data | 0;
        //Internal WRAM:
        this.wait.singleClock();
        this.internalRAM32[(address >> 2) & 0x1FFF] = data | 0;
    }
}
else {
    GameBoyAdvanceMemory.prototype.writeInternalWRAM16 = function (address, data) {
        //Internal WRAM:
        this.wait.singleClock();
        address &= 0x7FFE;
        this.internalRAM[address++] = data & 0xFF;
        this.internalRAM[address] = (data >> 8) & 0xFF;
    }
    GameBoyAdvanceMemory.prototype.writeInternalWRAM32 = function (address, data) {
        //Internal WRAM:
        this.wait.singleClock();
        address &= 0x7FFC;
        this.internalRAM[address++] = data & 0xFF;
        this.internalRAM[address++] = (data >> 8) & 0xFF;
        this.internalRAM[address++] = (data >> 16) & 0xFF;
        this.internalRAM[address] = data >>> 24;
    }
}
GameBoyAdvanceMemory.prototype.writeIODispatch8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.singleClock();
    switch (address | 0) {
        //4000000h - DISPCNT - LCD Control (Read/Write)
        case 0x4000000:
            this.gfxRenderer.writeDISPCNT8_0(data | 0);
            break;
        //4000001h - DISPCNT - LCD Control (Read/Write)
        case 0x4000001:
            this.gfxRenderer.writeDISPCNT8_1(data | 0);
            break;
        //4000002h - Undocumented - Green Swap (R/W)
        case 0x4000002:
            this.gfxRenderer.writeDISPCNT8_2(data | 0);
            break;
        //4000003h - Undocumented - Green Swap (R/W)
        //4000004h - DISPSTAT - General LCD Status (Read/Write)
        case 0x4000004:
            this.gfxState.writeDISPSTAT8_0(data | 0);
            break;
        //4000005h - DISPSTAT - General LCD Status (Read/Write)
        case 0x4000005:
            this.gfxState.writeDISPSTAT8_1(data | 0);
            break;
        //4000006h - VCOUNT - Vertical Counter (Read only)
        //4000007h - VCOUNT - Vertical Counter (Read only)
        //4000008h - BG0CNT - BG0 Control (R/W) (BG Modes 0,1 only)
        case 0x4000008:
            this.gfxRenderer.writeBG0CNT8_0(data | 0);
            break;
        //4000009h - BG0CNT - BG0 Control (R/W) (BG Modes 0,1 only)
        case 0x4000009:
            this.gfxRenderer.writeBG0CNT8_1(data | 0);
            break;
        //400000Ah - BG1CNT - BG1 Control (R/W) (BG Modes 0,1 only)
        case 0x400000A:
            this.gfxRenderer.writeBG1CNT8_0(data | 0);
            break;
        //400000Bh - BG1CNT - BG1 Control (R/W) (BG Modes 0,1 only)
        case 0x400000B:
            this.gfxRenderer.writeBG1CNT8_1(data | 0);
            break;
        //400000Ch - BG2CNT - BG2 Control (R/W) (BG Modes 0,1,2 only)
        case 0x400000C:
            this.gfxRenderer.writeBG2CNT8_0(data | 0);
            break;
        //400000Dh - BG2CNT - BG2 Control (R/W) (BG Modes 0,1,2 only)
        case 0x400000D:
            this.gfxRenderer.writeBG2CNT8_1(data | 0);
            break;
        //400000Eh - BG3CNT - BG3 Control (R/W) (BG Modes 0,2 only)
        case 0x400000E:
            this.gfxRenderer.writeBG3CNT8_0(data | 0);
            break;
        //400000Fh - BG3CNT - BG3 Control (R/W) (BG Modes 0,2 only)
        case 0x400000F:
            this.gfxRenderer.writeBG3CNT8_1(data | 0);
            break;
        //4000010h - BG0HOFS - BG0 X-Offset (W)
        case 0x4000010:
            this.gfxRenderer.writeBG0HOFS8_0(data | 0);
            break;
        //4000011h - BG0HOFS - BG0 X-Offset (W)
        case 0x4000011:
            this.gfxRenderer.writeBG0HOFS8_1(data | 0);
            break;
        //4000012h - BG0VOFS - BG0 Y-Offset (W)
        case 0x4000012:
            this.gfxRenderer.writeBG0VOFS8_0(data | 0);
            break;
        //4000013h - BG0VOFS - BG0 Y-Offset (W)
        case 0x4000013:
            this.gfxRenderer.writeBG0VOFS8_1(data | 0);
            break;
        //4000014h - BG1HOFS - BG1 X-Offset (W)
        case 0x4000014:
            this.gfxRenderer.writeBG1HOFS8_0(data | 0);
            break;
        //4000015h - BG1HOFS - BG1 X-Offset (W)
        case 0x4000015:
            this.gfxRenderer.writeBG1HOFS8_1(data | 0);
            break;
        //4000016h - BG1VOFS - BG1 Y-Offset (W)
        case 0x4000016:
            this.gfxRenderer.writeBG1VOFS8_0(data | 0);
            break;
        //4000017h - BG1VOFS - BG1 Y-Offset (W)
        case 0x4000017:
            this.gfxRenderer.writeBG1VOFS8_1(data | 0);
            break;
        //4000018h - BG2HOFS - BG2 X-Offset (W)
        case 0x4000018:
            this.gfxRenderer.writeBG2HOFS8_0(data | 0);
            break;
        //4000019h - BG2HOFS - BG2 X-Offset (W)
        case 0x4000019:
            this.gfxRenderer.writeBG2HOFS8_1(data | 0);
            break;
        //400001Ah - BG2VOFS - BG2 Y-Offset (W)
        case 0x400001A:
            this.gfxRenderer.writeBG2VOFS8_0(data | 0);
            break;
        //400001Bh - BG2VOFS - BG2 Y-Offset (W)
        case 0x400001B:
            this.gfxRenderer.writeBG2VOFS8_1(data | 0);
            break;
        //400001Ch - BG3HOFS - BG3 X-Offset (W)
        case 0x400001C:
            this.gfxRenderer.writeBG3HOFS8_0(data | 0);
            break;
        //400001Dh - BG3HOFS - BG3 X-Offset (W)
        case 0x400001D:
            this.gfxRenderer.writeBG3HOFS8_1(data | 0);
            break;
        //400001Eh - BG3VOFS - BG3 Y-Offset (W)
        case 0x400001E:
            this.gfxRenderer.writeBG3VOFS8_0(data | 0);
            break;
        //400001Fh - BG3VOFS - BG3 Y-Offset (W)
        case 0x400001F:
            this.gfxRenderer.writeBG3VOFS8_1(data | 0);
            break;
        //4000020h - BG2PA - BG2 Rotation/Scaling Parameter A (alias dx) (W)
        case 0x4000020:
            this.gfxRenderer.writeBG2PA8_0(data | 0);
            break;
        //4000021h - BG2PA - BG2 Rotation/Scaling Parameter A (alias dx) (W)
        case 0x4000021:
            this.gfxRenderer.writeBG2PA8_1(data | 0);
            break;
        //4000022h - BG2PB - BG2 Rotation/Scaling Parameter B (alias dmx) (W)
        case 0x4000022:
            this.gfxRenderer.writeBG2PB8_0(data | 0);
            break;
        //4000023h - BG2PB - BG2 Rotation/Scaling Parameter B (alias dmx) (W)
        case 0x4000023:
            this.gfxRenderer.writeBG2PB8_1(data | 0);
            break;
        //4000024h - BG2PC - BG2 Rotation/Scaling Parameter C (alias dy) (W)
        case 0x4000024:
            this.gfxRenderer.writeBG2PC8_0(data | 0);
            break;
        //4000025h - BG2PC - BG2 Rotation/Scaling Parameter C (alias dy) (W)
        case 0x4000025:
            this.gfxRenderer.writeBG2PC8_1(data | 0);
            break;
        //4000026h - BG2PD - BG2 Rotation/Scaling Parameter D (alias dmy) (W)
        case 0x4000026:
            this.gfxRenderer.writeBG2PD8_0(data | 0);
            break;
        //4000027h - BG2PD - BG2 Rotation/Scaling Parameter D (alias dmy) (W)
        case 0x4000027:
            this.gfxRenderer.writeBG2PD8_1(data | 0);
            break;
        //4000028h - BG2X_L - BG2 Reference Point X-Coordinate, lower 16 bit (W)
        case 0x4000028:
            this.gfxRenderer.writeBG2X8_0(data | 0);
            break;
        //4000029h - BG2X_L - BG2 Reference Point X-Coordinate, lower 16 bit (W)
        case 0x4000029:
            this.gfxRenderer.writeBG2X8_1(data | 0);
            break;
        //400002Ah - BG2X_H - BG2 Reference Point X-Coordinate, upper 12 bit (W)
        case 0x400002A:
            this.gfxRenderer.writeBG2X8_2(data | 0);
            break;
        //400002Bh - BG2X_H - BG2 Reference Point X-Coordinate, upper 12 bit (W)
        case 0x400002B:
            this.gfxRenderer.writeBG2X8_3(data | 0);
            break;
        //400002Ch - BG2Y_L - BG2 Reference Point Y-Coordinate, lower 16 bit (W)
        case 0x400002C:
            this.gfxRenderer.writeBG2Y8_0(data | 0);
            break;
        //400002Dh - BG2Y_L - BG2 Reference Point Y-Coordinate, lower 16 bit (W)
        case 0x400002D:
            this.gfxRenderer.writeBG2Y8_1(data | 0);
            break;
        //400002Eh - BG2Y_H - BG2 Reference Point Y-Coordinate, upper 12 bit (W)
        case 0x400002E:
            this.gfxRenderer.writeBG2Y8_2(data | 0);
            break;
        //400002Fh - BG2Y_H - BG2 Reference Point Y-Coordinate, upper 12 bit (W)
        case 0x400002F:
            this.gfxRenderer.writeBG2Y8_3(data | 0);
            break;
        //4000030h - BG3PA - BG3 Rotation/Scaling Parameter A (alias dx) (W)
        case 0x4000030:
            this.gfxRenderer.writeBG3PA8_0(data | 0);
            break;
        //4000031h - BG3PA - BG3 Rotation/Scaling Parameter A (alias dx) (W)
        case 0x4000031:
            this.gfxRenderer.writeBG3PA8_1(data | 0);
            break;
        //4000032h - BG3PB - BG3 Rotation/Scaling Parameter B (alias dmx) (W)
        case 0x4000032:
            this.gfxRenderer.writeBG3PB8_0(data | 0);
            break;
        //4000033h - BG3PB - BG3 Rotation/Scaling Parameter B (alias dmx) (W)
        case 0x4000033:
            this.gfxRenderer.writeBG3PB8_1(data | 0);
            break;
        //4000034h - BG3PC - BG3 Rotation/Scaling Parameter C (alias dy) (W)
        case 0x4000034:
            this.gfxRenderer.writeBG3PC8_0(data | 0);
            break;
        //4000035h - BG3PC - BG3 Rotation/Scaling Parameter C (alias dy) (W)
        case 0x4000035:
            this.gfxRenderer.writeBG3PC8_1(data | 0);
            break;
        //4000036h - BG3PD - BG3 Rotation/Scaling Parameter D (alias dmy) (W)
        case 0x4000036:
            this.gfxRenderer.writeBG3PD8_0(data | 0);
            break;
        //4000037h - BG3PD - BG3 Rotation/Scaling Parameter D (alias dmy) (W)
        case 0x4000037:
            this.gfxRenderer.writeBG3PD8_1(data | 0);
            break;
        //4000038h - BG3X_L - BG3 Reference Point X-Coordinate, lower 16 bit (W)
        case 0x4000038:
            this.gfxRenderer.writeBG3X8_0(data | 0);
            break;
        //4000039h - BG3X_L - BG3 Reference Point X-Coordinate, lower 16 bit (W)
        case 0x4000039:
            this.gfxRenderer.writeBG3X8_1(data | 0);
            break;
        //400003Ah - BG3X_H - BG3 Reference Point X-Coordinate, upper 12 bit (W)
        case 0x400003A:
            this.gfxRenderer.writeBG3X8_2(data | 0);
            break;
        //400003Bh - BG3X_H - BG3 Reference Point X-Coordinate, upper 12 bit (W)
        case 0x400003B:
            this.gfxRenderer.writeBG3X8_3(data | 0);
            break;
        //400003Ch - BG3Y_L - BG3 Reference Point Y-Coordinate, lower 16 bit (W)
        case 0x400003C:
            this.gfxRenderer.writeBG3Y8_0(data | 0);
            break;
        //400003Dh - BGY_L - BG3 Reference Point Y-Coordinate, lower 16 bit (W)
        case 0x400003D:
            this.gfxRenderer.writeBG3Y8_1(data | 0);
            break;
        //400003Eh - BG3Y_H - BG3 Reference Point Y-Coordinate, upper 12 bit (W)
        case 0x400003E:
            this.gfxRenderer.writeBG3Y8_2(data | 0);
            break;
        //400003Fh - BG3Y_H - BG3 Reference Point Y-Coordinate, upper 12 bit (W)
        case 0x400003F:
            this.gfxRenderer.writeBG3Y8_3(data | 0);
            break;
        //4000040h - WIN0H - Window 0 Horizontal Dimensions (W)
        case 0x4000040:
            this.gfxRenderer.writeWIN0XCOORDRight8(data | 0);
            break;
        //4000041h - WIN0H - Window 0 Horizontal Dimensions (W)
        case 0x4000041:
            this.gfxRenderer.writeWIN0XCOORDLeft8(data | 0);
            break;
        //4000042h - WIN1H - Window 1 Horizontal Dimensions (W)
        case 0x4000042:
            this.gfxRenderer.writeWIN1XCOORDRight8(data | 0);
            break;
        //4000043h - WIN1H - Window 1 Horizontal Dimensions (W)
        case 0x4000043:
            this.gfxRenderer.writeWIN1XCOORDLeft8(data | 0);
            break;
        //4000044h - WIN0V - Window 0 Vertical Dimensions (W)
        case 0x4000044:
            this.gfxRenderer.writeWIN0YCOORDBottom8(data | 0);
            break;
        //4000045h - WIN0V - Window 0 Vertical Dimensions (W)
        case 0x4000045:
            this.gfxRenderer.writeWIN0YCOORDTop8(data | 0);
            break;
        //4000046h - WIN1V - Window 1 Vertical Dimensions (W)
        case 0x4000046:
            this.gfxRenderer.writeWIN1YCOORDBottom8(data | 0);
            break;
        //4000047h - WIN1V - Window 1 Vertical Dimensions (W)
        case 0x4000047:
            this.gfxRenderer.writeWIN1YCOORDTop8(data | 0);
            break;
        //4000048h - WININ - Control of Inside of Window(s) (R/W)
        case 0x4000048:
            this.gfxRenderer.writeWIN0IN8(data | 0);
            break;
        //4000049h - WININ - Control of Inside of Window(s) (R/W)
        case 0x4000049:
            this.gfxRenderer.writeWIN1IN8(data | 0);
            break;
        //400004Ah- WINOUT - Control of Outside of Windows (R/W)
        case 0x400004A:
            this.gfxRenderer.writeWINOUT8(data | 0);
            break;
        //400004AB- WINOUT - Inside of OBJ Window (R/W)
        case 0x400004B:
            this.gfxRenderer.writeWINOBJIN8(data | 0);
            break;
        //400004Ch - MOSAIC - Mosaic Size (W)
        case 0x400004C:
            this.gfxRenderer.writeMOSAIC8_0(data | 0);
            break;
        //400004Dh - MOSAIC - Mosaic Size (W)
        case 0x400004D:
            this.gfxRenderer.writeMOSAIC8_1(data | 0);
            break;
        //400004Eh - NOT USED - ZERO
        //400004Fh - NOT USED - ZERO
        //4000050h - BLDCNT - Color Special Effects Selection (R/W)
        case 0x4000050:
            this.gfxRenderer.writeBLDCNT8_0(data | 0);
            break;
        //4000051h - BLDCNT - Color Special Effects Selection (R/W)
        case 0x4000051:
            this.gfxRenderer.writeBLDCNT8_1(data | 0);
            break;
        //4000052h - BLDALPHA - Alpha Blending Coefficients (R/W)
        case 0x4000052:
            this.gfxRenderer.writeBLDALPHA8_0(data | 0);
            break;
        //4000053h - BLDALPHA - Alpha Blending Coefficients (R/W)
        case 0x4000053:
            this.gfxRenderer.writeBLDALPHA8_1(data | 0);
            break;
        //4000054h - BLDY - Brightness (Fade-In/Out) Coefficient (W)
        case 0x4000054:
            this.gfxRenderer.writeBLDY8(data | 0);
            break;
        //4000055h through 400005Fh - NOT USED - ZERO/GLITCHED
        //4000060h - SOUND1CNT_L (NR10) - Channel 1 Sweep register (R/W)
        case 0x4000060:
            //NR10:
            this.sound.writeSOUND1CNT8_0(data | 0);
            break;
        //4000061h - NOT USED - ZERO
        //4000062h - SOUND1CNT_H (NR11, NR12) - Channel 1 Duty/Len/Envelope (R/W)
        case 0x4000062:
            //NR11:
            this.sound.writeSOUND1CNT8_2(data | 0);
            break;
        //4000063h - SOUND1CNT_H (NR11, NR12) - Channel 1 Duty/Len/Envelope (R/W)
        case 0x4000063:
            //NR12:
            this.sound.writeSOUND1CNT8_3(data | 0);
            break;
        //4000064h - SOUND1CNT_X (NR13, NR14) - Channel 1 Frequency/Control (R/W)
        case 0x4000064:
            //NR13:
            this.sound.writeSOUND1CNTX8_0(data | 0);
            break;
        //4000065h - SOUND1CNT_X (NR13, NR14) - Channel 1 Frequency/Control (R/W)
        case 0x4000065:
            //NR14:
            this.sound.writeSOUND1CNTX8_1(data | 0);
            break;
        //4000066h - NOT USED - ZERO
        //4000067h - NOT USED - ZERO
        //4000068h - SOUND2CNT_L (NR21, NR22) - Channel 2 Duty/Length/Envelope (R/W)
        case 0x4000068:
            //NR21:
            this.sound.writeSOUND2CNTL8_0(data | 0);
            break;
        //4000069h - SOUND2CNT_L (NR21, NR22) - Channel 2 Duty/Length/Envelope (R/W)
        case 0x4000069:
            //NR22:
            this.sound.writeSOUND2CNTL8_1(data | 0);
            break;
        //400006Ah - NOT USED - ZERO
        //400006Bh - NOT USED - ZERO
        //400006Ch - SOUND2CNT_H (NR23, NR24) - Channel 2 Frequency/Control (R/W)
        case 0x400006C:
            //NR23:
            this.sound.writeSOUND2CNTH8_0(data | 0);
            break;
        //400006Dh - SOUND2CNT_H (NR23, NR24) - Channel 2 Frequency/Control (R/W)
        case 0x400006D:
            //NR24:
            this.sound.writeSOUND2CNTH8_1(data | 0);
            break;
        //400006Eh - NOT USED - ZERO
        //400006Fh - NOT USED - ZERO
        //4000070h - SOUND3CNT_L (NR30) - Channel 3 Stop/Wave RAM select (R/W)
        case 0x4000070:
            //NR30:
            this.sound.writeSOUND3CNT8_0(data | 0);
            break;
        //4000071h - SOUND3CNT_L (NR30) - Channel 3 Stop/Wave RAM select (R/W)
        //4000072h - SOUND3CNT_H (NR31, NR32) - Channel 3 Length/Volume (R/W)
        case 0x4000072:
            //NR31:
            this.sound.writeSOUND3CNT8_2(data | 0);
            break;
        //4000073h - SOUND3CNT_H (NR31, NR32) - Channel 3 Length/Volume (R/W)
        case 0x4000073:
            //NR32:
            this.sound.writeSOUND3CNT8_3(data | 0);
            break;
        //4000074h - SOUND3CNT_X (NR33, NR34) - Channel 3 Frequency/Control (R/W)
        case 0x4000074:
            //NR33:
            this.sound.writeSOUND3CNTX8_0(data | 0);
            break;
        //4000075h - SOUND3CNT_X (NR33, NR34) - Channel 3 Frequency/Control (R/W)
        case 0x4000075:
            //NR34:
            this.sound.writeSOUND3CNTX8_1(data | 0);
            break;
        //4000076h - NOT USED - ZERO
        //4000077h - NOT USED - ZERO
        //4000078h - SOUND4CNT_L (NR41, NR42) - Channel 4 Length/Envelope (R/W)
        case 0x4000078:
            //NR41:
            this.sound.writeSOUND4CNTL8_0(data | 0);
            break;
        //4000079h - SOUND4CNT_L (NR41, NR42) - Channel 4 Length/Envelope (R/W)
        case 0x4000079:
            //NR42:
            this.sound.writeSOUND4CNTL8_1(data | 0);
            break;
        //400007Ah - NOT USED - ZERO
        //400007Bh - NOT USED - ZERO
        //400007Ch - SOUND4CNT_H (NR43, NR44) - Channel 4 Frequency/Control (R/W)
        case 0x400007C:
            //NR43:
            this.sound.writeSOUND4CNTH8_0(data | 0);
            break;
        //400007Dh - SOUND4CNT_H (NR43, NR44) - Channel 4 Frequency/Control (R/W)
        case 0x400007D:
            //NR44:
            this.sound.writeSOUND4CNTH8_1(data | 0);
            break;
        //400007Eh - NOT USED - ZERO
        //400007Fh - NOT USED - ZERO
        //4000080h - SOUNDCNT_L (NR50, NR51) - Channel L/R Volume/Enable (R/W)
        case 0x4000080:
            //NR50:
            this.sound.writeSOUNDCNTL8_0(data | 0);
            break;
        //4000081h - SOUNDCNT_L (NR50, NR51) - Channel L/R Volume/Enable (R/W)
        case 0x4000081:
            //NR51:
            this.sound.writeSOUNDCNTL8_1(data | 0);
            break;
        //4000082h - SOUNDCNT_H (GBA only) - DMA Sound Control/Mixing (R/W)
        case 0x4000082:
            this.sound.writeSOUNDCNTH8_0(data | 0);
            break;
        //4000083h - SOUNDCNT_H (GBA only) - DMA Sound Control/Mixing (R/W)
        case 0x4000083:
            this.sound.writeSOUNDCNTH8_1(data | 0);
            break;
        //4000084h - SOUNDCNT_X (NR52) - Sound on/off (R/W)
        case 0x4000084:
            this.sound.writeSOUNDCNTX8(data | 0);
            break;
        //4000085h - NOT USED - ZERO
        //4000086h - NOT USED - ZERO
        //4000087h - NOT USED - ZERO
        //4000088h - SOUNDBIAS - Sound PWM Control (R/W)
        case 0x4000088:
            this.sound.writeSOUNDBIAS8_0(data | 0);
            break;
        //4000089h - SOUNDBIAS - Sound PWM Control (R/W)
        case 0x4000089:
            this.sound.writeSOUNDBIAS8_1(data | 0);
            break;
        //400008Ah through 400008Fh - NOT USED - ZERO/GLITCHED
        //4000090h - WAVE_RAM0_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000090:
        //4000091h - WAVE_RAM0_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000091:
        //4000092h - WAVE_RAM0_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000092:
        //4000093h - WAVE_RAM0_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000093:
        //4000094h - WAVE_RAM1_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000094:
        //4000095h - WAVE_RAM1_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000095:
        //4000096h - WAVE_RAM1_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000096:
        //4000097h - WAVE_RAM1_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000097:
        //4000098h - WAVE_RAM2_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000098:
        //4000099h - WAVE_RAM2_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000099:
        //400009Ah - WAVE_RAM2_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009A:
        //400009Bh - WAVE_RAM2_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009B:
        //400009Ch - WAVE_RAM3_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009C:
        //400009Dh - WAVE_RAM3_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009D:
        //400009Eh - WAVE_RAM3_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009E:
        //400009Fh - WAVE_RAM3_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009F:
            this.sound.writeWAVE8(address & 0xF, data | 0);
            break;
        //40000A0h - FIFO_A_L - FIFO Channel A First Word (W)
        case 0x40000A0:
        //40000A1h - FIFO_A_L - FIFO Channel A First Word (W)
        case 0x40000A1:
        //40000A2h - FIFO_A_H - FIFO Channel A Second Word (W)
        case 0x40000A2:
        //40000A3h - FIFO_A_H - FIFO Channel A Second Word (W)
        case 0x40000A3:
            this.sound.writeFIFOA8(data | 0);
            break;
        //40000A4h - FIFO_B_L - FIFO Channel B First Word (W)
        case 0x40000A4:
        //40000A5h - FIFO_B_L - FIFO Channel B First Word (W)
        case 0x40000A5:
        //40000A6h - FIFO_B_H - FIFO Channel B Second Word (W)
        case 0x40000A6:
        //40000A7h - FIFO_B_H - FIFO Channel B Second Word (W)
        case 0x40000A7:
            this.sound.writeFIFOB8(data | 0);
            break;
        //40000A8h through 40000AFh - NOT USED - GLITCHED
        //40000B0h - DMA0SAD - DMA 0 Source Address (W) (internal memory)
        case 0x40000B0:
            this.dmaChannel0.writeDMASource8_0(data | 0);
            break;
        //40000B1h - DMA0SAD - DMA 0 Source Address (W) (internal memory)
        case 0x40000B1:
            this.dmaChannel0.writeDMASource8_1(data | 0);
            break;
        //40000B2h - DMA0SAH - DMA 0 Source Address (W) (internal memory)
        case 0x40000B2:
            this.dmaChannel0.writeDMASource8_2(data | 0);
            break;
        //40000B3h - DMA0SAH - DMA 0 Source Address (W) (internal memory)
        case 0x40000B3:
            this.dmaChannel0.writeDMASource8_3(data | 0);
            break;
        //40000B4h - DMA0DAD - DMA 0 Destination Address (W) (internal memory)
        case 0x40000B4:
            this.dmaChannel0.writeDMADestination8_0(data | 0);
            break;
        //40000B5h - DMA0DAD - DMA 0 Destination Address (W) (internal memory)
        case 0x40000B5:
            this.dmaChannel0.writeDMADestination8_1(data | 0);
            break;
        //40000B6h - DMA0DAH - DMA 0 Destination Address (W) (internal memory)
        case 0x40000B6:
            this.dmaChannel0.writeDMADestination8_2(data | 0);
            break;
        //40000B7h - DMA0DAH - DMA 0 Destination Address (W) (internal memory)
        case 0x40000B7:
            this.dmaChannel0.writeDMADestination8_3(data | 0);
            break;
        //40000B8h - DMA0CNT_L - DMA 0 Word Count (W) (14 bit, 1..4000h)
        case 0x40000B8:
            this.dmaChannel0.writeDMAWordCount8_0(data | 0);
            break;
        //40000B9h - DMA0CNT_L - DMA 0 Word Count (W) (14 bit, 1..4000h)
        case 0x40000B9:
            this.dmaChannel0.writeDMAWordCount8_1(data | 0);
            break;
        //40000BAh - DMA0CNT_H - DMA 0 Control (R/W)
        case 0x40000BA:
            this.dmaChannel0.writeDMAControl8_0(data | 0);
            break;
        //40000BBh - DMA0CNT_H - DMA 0 Control (R/W)
        case 0x40000BB:
            this.dmaChannel0.writeDMAControl8_1(data | 0);
            break;
        //40000BCh - DMA1SAD - DMA 1 Source Address (W) (internal memory)
        case 0x40000BC:
            this.dmaChannel1.writeDMASource8_0(data | 0);
            break;
        //40000BDh - DMA1SAD - DMA 1 Source Address (W) (internal memory)
        case 0x40000BD:
            this.dmaChannel1.writeDMASource8_1(data | 0);
            break;
        //40000BEh - DMA1SAH - DMA 1 Source Address (W) (internal memory)
        case 0x40000BE:
            this.dmaChannel1.writeDMASource8_2(data | 0);
            break;
        //40000BFh - DMA1SAH - DMA 1 Source Address (W) (internal memory)
        case 0x40000BF:
            this.dmaChannel1.writeDMASource8_3(data | 0);
            break;
        //40000C0h - DMA1DAD - DMA 1 Destination Address (W) (internal memory)
        case 0x40000C0:
            this.dmaChannel1.writeDMADestination8_0(data | 0);
            break;
        //40000C1h - DMA1DAD - DMA 1 Destination Address (W) (internal memory)
        case 0x40000C1:
            this.dmaChannel1.writeDMADestination8_1(data | 0);
            break;
        //40000C2h - DMA1DAH - DMA 1 Destination Address (W) (internal memory)
        case 0x40000C2:
            this.dmaChannel1.writeDMADestination8_2(data | 0);
            break;
        //40000C3h - DMA1DAH - DMA 1 Destination Address (W) (internal memory)
        case 0x40000C3:
            this.dmaChannel1.writeDMADestination8_3(data | 0);
            break;
        //40000C4h - DMA1CNT_L - DMA 1 Word Count (W) (14 bit, 1..4000h)
        case 0x40000C4:
            this.dmaChannel1.writeDMAWordCount8_0(data | 0);
            break;
        //40000C5h - DMA1CNT_L - DMA 1 Word Count (W) (14 bit, 1..4000h)
        case 0x40000C5:
            this.dmaChannel1.writeDMAWordCount8_1(data | 0);
            break;
        //40000C6h - DMA1CNT_H - DMA 1 Control (R/W)
        case 0x40000C6:
            this.dmaChannel1.writeDMAControl8_0(data | 0);
            break;
        //40000C7h - DMA1CNT_H - DMA 1 Control (R/W)
        case 0x40000C7:
            this.dmaChannel1.writeDMAControl8_1(data | 0);
            break;
        //40000C8h - DMA2SAD - DMA 2 Source Address (W) (internal memory)
        case 0x40000C8:
            this.dmaChannel2.writeDMASource8_0(data | 0);
            break;
        //40000C9h - DMA2SAD - DMA 2 Source Address (W) (internal memory)
        case 0x40000C9:
            this.dmaChannel2.writeDMASource8_1(data | 0);
            break;
        //40000CAh - DMA2SAH - DMA 2 Source Address (W) (internal memory)
        case 0x40000CA:
            this.dmaChannel2.writeDMASource8_2(data | 0);
            break;
        //40000CBh - DMA2SAH - DMA 2 Source Address (W) (internal memory)
        case 0x40000CB:
            this.dmaChannel2.writeDMASource8_3(data | 0);
            break;
        //40000CCh - DMA2DAD - DMA 2 Destination Address (W) (internal memory)
        case 0x40000CC:
            this.dmaChannel2.writeDMADestination8_0(data | 0);
            break;
        //40000CDh - DMA2DAD - DMA 2 Destination Address (W) (internal memory)
        case 0x40000CD:
            this.dmaChannel2.writeDMADestination8_1(data | 0);
            break;
        //40000CEh - DMA2DAH - DMA 2 Destination Address (W) (internal memory)
        case 0x40000CE:
            this.dmaChannel2.writeDMADestination8_2(data | 0);
            break;
        //40000CFh - DMA2DAH - DMA 2 Destination Address (W) (internal memory)
        case 0x40000CF:
            this.dmaChannel2.writeDMADestination8_3(data | 0);
            break;
        //40000D0h - DMA2CNT_L - DMA 2 Word Count (W) (14 bit, 1..4000h)
        case 0x40000D0:
            this.dmaChannel2.writeDMAWordCount8_0(data | 0);
            break;
        //40000D1h - DMA2CNT_L - DMA 2 Word Count (W) (14 bit, 1..4000h)
        case 0x40000D1:
            this.dmaChannel2.writeDMAWordCount8_1(data | 0);
            break;
        //40000D2h - DMA2CNT_H - DMA 2 Control (R/W)
        case 0x40000D2:
            this.dmaChannel2.writeDMAControl8_0(data | 0);
            break;
        //40000D3h - DMA2CNT_H - DMA 2 Control (R/W)
        case 0x40000D3:
            this.dmaChannel2.writeDMAControl8_1(data | 0);
            break;
        //40000D4h - DMA3SAD - DMA 3 Source Address (W) (internal memory)
        case 0x40000D4:
            this.dmaChannel3.writeDMASource8_0(data | 0);
            break;
        //40000D5h - DMA3SAD - DMA 3 Source Address (W) (internal memory)
        case 0x40000D5:
            this.dmaChannel3.writeDMASource8_1(data | 0);
            break;
        //40000D6h - DMA3SAH - DMA 3 Source Address (W) (internal memory)
        case 0x40000D6:
            this.dmaChannel3.writeDMASource8_2(data | 0);
            break;
        //40000D7h - DMA3SAH - DMA 3 Source Address (W) (internal memory)
        case 0x40000D7:
            this.dmaChannel3.writeDMASource8_3(data | 0);
            break;
        //40000D8h - DMA3DAD - DMA 3 Destination Address (W) (internal memory)
        case 0x40000D8:
            this.dmaChannel3.writeDMADestination8_0(data | 0);
            break;
        //40000D9h - DMA3DAD - DMA 3 Destination Address (W) (internal memory)
        case 0x40000D9:
            this.dmaChannel3.writeDMADestination8_1(data | 0);
            break;
        //40000DAh - DMA3DAH - DMA 3 Destination Address (W) (internal memory)
        case 0x40000DA:
            this.dmaChannel3.writeDMADestination8_2(data | 0);
            break;
        //40000DBh - DMA3DAH - DMA 3 Destination Address (W) (internal memory)
        case 0x40000DB:
            this.dmaChannel3.writeDMADestination8_3(data | 0);
            break;
        //40000DCh - DMA3CNT_L - DMA 3 Word Count (W) (16 bit, 1..10000h)
        case 0x40000DC:
            this.dmaChannel3.writeDMAWordCount8_0(data | 0);
            break;
        //40000DDh - DMA3CNT_L - DMA 3 Word Count (W) (16 bit, 1..10000h)
        case 0x40000DD:
            this.dmaChannel3.writeDMAWordCount8_1(data | 0);
            break;
        //40000DEh - DMA3CNT_H - DMA 3 Control (R/W)
        case 0x40000DE:
            this.dmaChannel3.writeDMAControl8_0(data | 0);
            break;
        //40000DFh - DMA3CNT_H - DMA 3 Control (R/W)
        case 0x40000DF:
            this.dmaChannel3.writeDMAControl8_1(data | 0);
            break;
        //40000E0h through 40000FFh - NOT USED - GLITCHED
        //4000100h - TM0CNT_L - Timer 0 Counter/Reload (R/W)
        case 0x4000100:
            this.timer.writeTM0CNT8_0(data | 0);
            break;
        //4000101h - TM0CNT_L - Timer 0 Counter/Reload (R/W)
        case 0x4000101:
            this.timer.writeTM0CNT8_1(data | 0);
            break;
        //4000102h - TM0CNT_H - Timer 0 Control (R/W)
        case 0x4000102:
            this.timer.writeTM0CNT8_2(data | 0);
            break;
        //4000103h - TM0CNT_H - Timer 0 Control (R/W)
        //4000104h - TM1CNT_L - Timer 1 Counter/Reload (R/W)
        case 0x4000104:
            this.timer.writeTM1CNT8_0(data | 0);
            break;
        //4000105h - TM1CNT_L - Timer 1 Counter/Reload (R/W)
        case 0x4000105:
            this.timer.writeTM1CNT8_1(data | 0);
            break;
        //4000106h - TM1CNT_H - Timer 1 Control (R/W)
        case 0x4000106:
            this.timer.writeTM1CNT8_2(data | 0);
            break;
        //4000107h - TM1CNT_H - Timer 1 Control (R/W)
        //4000108h - TM2CNT_L - Timer 2 Counter/Reload (R/W)
        case 0x4000108:
            this.timer.writeTM2CNT8_0(data | 0);
            break;
        //4000109h - TM2CNT_L - Timer 2 Counter/Reload (R/W)
        case 0x4000109:
            this.timer.writeTM2CNT8_1(data | 0);
            break;
        //400010Ah - TM2CNT_H - Timer 2 Control (R/W)
        case 0x400010A:
            this.timer.writeTM2CNT8_2(data | 0);
            break;
        //400010Bh - TM2CNT_H - Timer 2 Control (R/W)
        //400010Ch - TM3CNT_L - Timer 3 Counter/Reload (R/W)
        case 0x400010C:
            this.timer.writeTM3CNT8_0(data | 0);
            break;
        //400010Dh - TM3CNT_L - Timer 3 Counter/Reload (R/W)
        case 0x400010D:
            this.timer.writeTM3CNT8_1(data | 0);
            break;
        //400010Eh - TM3CNT_H - Timer 3 Control (R/W)
        case 0x400010E:
            this.timer.writeTM3CNT8_2(data | 0);
            break;
        //400010Fh - TM3CNT_H - Timer 3 Control (R/W)
        //4000110h through 400011Fh - NOT USED - GLITCHED
        //4000120h - Serial Data A (R/W)
        case 0x4000120:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_A0(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000121h - Serial Data A (R/W)
        case 0x4000121:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_A1(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000122h - Serial Data B (R/W)
        case 0x4000122:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_B0(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000123h - Serial Data B (R/W)
        case 0x4000123:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_B1(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000124h - Serial Data C (R/W)
        case 0x4000124:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_C0(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000125h - Serial Data C (R/W)
        case 0x4000125:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_C1(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000126h - Serial Data D (R/W)
        case 0x4000126:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_D0(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000127h - Serial Data D (R/W)
        case 0x4000127:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_D1(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000128h - SIOCNT - SIO Sub Mode Control (R/W)
        case 0x4000128:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIOCNT0(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000129h - SIOCNT - SIO Sub Mode Control (R/W)
        case 0x4000129:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIOCNT1(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //400012Ah - SIOMLT_SEND - Data Send Register (R/W)
        case 0x400012A:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA8_0(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //400012Bh - SIOMLT_SEND - Data Send Register (R/W)
        case 0x400012B:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA8_1(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //400012Ch through 400012Fh - NOT USED - GLITCHED
        //4000130h - KEYINPUT - Key Status (R)
        //4000131h - KEYINPUT - Key Status (R)
        //4000132h - KEYCNT - Key Interrupt Control (R/W)
        case 0x4000132:
            this.joypad.writeKeyControl8_0(data | 0);
            break;
        //4000133h - KEYCNT - Key Interrupt Control (R/W)
        case 0x4000133:
            this.joypad.writeKeyControl8_1(data | 0);
            break;
        //4000134h - RCNT (R/W) - Mode Selection
        case 0x4000134:
            this.IOCore.updateSerialClocking();
            this.serial.writeRCNT0(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000135h - RCNT (R/W) - Mode Selection
        case 0x4000135:
            this.IOCore.updateSerialClocking();
            this.serial.writeRCNT1(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000136h through 400013Fh - NOT USED - GLITCHED
        //4000140h - JOYCNT - JOY BUS Control Register (R/W)
        case 0x4000140:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYCNT(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000141h - JOYCNT - JOY BUS Control Register (R/W)
        //4000142h through 400014Fh - NOT USED - GLITCHED
        //4000150h - JoyBus Receive (R/W)
        case 0x4000150:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_RECV0(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000151h - JoyBus Receive (R/W)
        case 0x4000151:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_RECV1(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000152h - JoyBus Receive (R/W)
        case 0x4000152:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_RECV2(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000153h - JoyBus Receive (R/W)
        case 0x4000153:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_RECV3(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000154h - JoyBus Send (R/W)
        case 0x4000154:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_SEND0(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000155h - JoyBus Send (R/W)
        case 0x4000155:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_SEND1(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000156h - JoyBus Send (R/W)
        case 0x4000156:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_SEND2(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000157h - JoyBus Send (R/W)
        case 0x4000157:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_SEND3(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000158h - JoyBus Stat (R/W)
        case 0x4000158:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_STAT(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000159h through 40001FFh - NOT USED - GLITCHED
        //4000200h - IE - Interrupt Enable Register (R/W)
        case 0x4000200:
            this.irq.writeIE8_0(data | 0);
            break;
        //4000201h - IE - Interrupt Enable Register (R/W)
        case 0x4000201:
            this.irq.writeIE8_1(data | 0);
            break;
        //4000202h - IF - Interrupt Request Flags / IRQ Acknowledge
        case 0x4000202:
            this.irq.writeIF8_0(data | 0);
            break;
        //4000203h - IF - Interrupt Request Flags / IRQ Acknowledge
        case 0x4000203:
            this.irq.writeIF8_1(data | 0);
            break;
        //4000204h - WAITCNT - Waitstate Control (R/W)
        case 0x4000204:
            this.wait.writeWAITCNT8_0(data | 0);
            break;
        //4000205h - WAITCNT - Waitstate Control (R/W)
        case 0x4000205:
            this.wait.writeWAITCNT8_1(data | 0);
            break;
        //4000206h - WAITCNT - Waitstate Control (R/W)
        //4000207h - WAITCNT - Waitstate Control (R/W)
        //4000208h - IME - Interrupt Master Enable Register (R/W)
        case 0x4000208:
            this.irq.writeIME(data | 0);
            break;
        //4000209h through 40002FFh - NOT USED - GLITCHED
        //4000300h - POSTFLG - BYTE - Undocumented - Post Boot / Debug Control (R/W)
        case 0x4000300:
            this.wait.writePOSTBOOT(data | 0);
            break;
        //4000301h - HALTCNT - BYTE - Undocumented - Low Power Mode Control (W)
        case 0x4000301:
            this.wait.writeHALTCNT(data | 0);
            break;
        default:
            if ((address & 0xFFFC) == 0x800) {
                //WRAM wait state control:
                this.wait.writeConfigureWRAM8(address | 0, data | 0);
            }
    }
}
GameBoyAdvanceMemory.prototype.writeIODispatch16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.singleClock();
    switch (address & -2) {
        //4000000h - DISPCNT - LCD Control (Read/Write)
        case 0x4000000:
            this.gfxRenderer.writeDISPCNT16(data | 0);
            break;
        //4000002h - Undocumented - Green Swap (R/W)
        case 0x4000002:
            this.gfxRenderer.writeDISPCNT8_2(data | 0);
            break;
        //4000004h - DISPSTAT - General LCD Status (Read/Write)
        case 0x4000004:
            this.gfxState.writeDISPSTAT16(data | 0);
            break;
        //4000006h - VCOUNT - Vertical Counter (Read only)
        //4000008h - BG0CNT - BG0 Control (R/W) (BG Modes 0,1 only)
        case 0x4000008:
            this.gfxRenderer.writeBG0CNT16(data | 0);
            break;
        //400000Ah - BG1CNT - BG1 Control (R/W) (BG Modes 0,1 only)
        case 0x400000A:
            this.gfxRenderer.writeBG1CNT16(data | 0);
            break;
        //400000Ch - BG2CNT - BG2 Control (R/W) (BG Modes 0,1,2 only)
        case 0x400000C:
            this.gfxRenderer.writeBG2CNT16(data | 0);
            break;
        //400000Eh - BG3CNT - BG3 Control (R/W) (BG Modes 0,2 only)
        case 0x400000E:
            this.gfxRenderer.writeBG3CNT16(data | 0);
            break;
        //4000010h - BG0HOFS - BG0 X-Offset (W)
        case 0x4000010:
            this.gfxRenderer.writeBG0HOFS16(data | 0);
            break;
        //4000012h - BG0VOFS - BG0 Y-Offset (W)
        case 0x4000012:
            this.gfxRenderer.writeBG0VOFS16(data | 0);
            break;
        //4000014h - BG1HOFS - BG1 X-Offset (W)
        case 0x4000014:
            this.gfxRenderer.writeBG1HOFS16(data | 0);
            break;
        //4000016h - BG1VOFS - BG1 Y-Offset (W)
        case 0x4000016:
            this.gfxRenderer.writeBG1VOFS16(data | 0);
            break;
        //4000018h - BG2HOFS - BG2 X-Offset (W)
        case 0x4000018:
            this.gfxRenderer.writeBG2HOFS16(data | 0);
            break;
        //400001Ah - BG2VOFS - BG2 Y-Offset (W)
        case 0x400001A:
            this.gfxRenderer.writeBG2VOFS16(data | 0);
            break;
        //400001Ch - BG3HOFS - BG3 X-Offset (W)
        case 0x400001C:
            this.gfxRenderer.writeBG3HOFS16(data | 0);
            break;
        //400001Eh - BG3VOFS - BG3 Y-Offset (W)
        case 0x400001E:
            this.gfxRenderer.writeBG3VOFS16(data | 0);
            break;
        //4000020h - BG2PA - BG2 Rotation/Scaling Parameter A (alias dx) (W)
        case 0x4000020:
            this.gfxRenderer.writeBG2PA16(data | 0);
            break;
        //4000022h - BG2PB - BG2 Rotation/Scaling Parameter B (alias dmx) (W)
        case 0x4000022:
            this.gfxRenderer.writeBG2PB16(data | 0);
            break;
        //4000024h - BG2PC - BG2 Rotation/Scaling Parameter C (alias dy) (W)
        case 0x4000024:
            this.gfxRenderer.writeBG2PC16(data | 0);
            break;
        //4000026h - BG2PD - BG2 Rotation/Scaling Parameter D (alias dmy) (W)
        case 0x4000026:
            this.gfxRenderer.writeBG2PD16(data | 0);
            break;
        //4000028h - BG2X_L - BG2 Reference Point X-Coordinate, lower 16 bit (W)
        case 0x4000028:
            this.gfxRenderer.writeBG2X16_0(data | 0);
            break;
        //400002Ah - BG2X_H - BG2 Reference Point X-Coordinate, upper 12 bit (W)
        case 0x400002A:
            this.gfxRenderer.writeBG2X16_1(data | 0);
            break;
        //400002Ch - BG2Y_L - BG2 Reference Point Y-Coordinate, lower 16 bit (W)
        case 0x400002C:
            this.gfxRenderer.writeBG2Y16_0(data | 0);
            break;
        //400002Eh - BG2Y_H - BG2 Reference Point Y-Coordinate, upper 12 bit (W)
        case 0x400002E:
            this.gfxRenderer.writeBG2Y16_1(data | 0);
            break;
        //4000030h - BG3PA - BG3 Rotation/Scaling Parameter A (alias dx) (W)
        case 0x4000030:
            this.gfxRenderer.writeBG3PA16(data | 0);
            break;
        //4000032h - BG3PB - BG3 Rotation/Scaling Parameter B (alias dmx) (W)
        case 0x4000032:
            this.gfxRenderer.writeBG3PB16(data | 0);
            break;
        //4000034h - BG3PC - BG3 Rotation/Scaling Parameter C (alias dy) (W)
        case 0x4000034:
            this.gfxRenderer.writeBG3PC16(data | 0);
            break;
        //4000036h - BG3PD - BG3 Rotation/Scaling Parameter D (alias dmy) (W)
        case 0x4000036:
            this.gfxRenderer.writeBG3PD16(data | 0);
            break;
        //4000038h - BG3X_L - BG3 Reference Point X-Coordinate, lower 16 bit (W)
        case 0x4000038:
            this.gfxRenderer.writeBG3X16_0(data | 0);
            break;
        //400003Ah - BG3X_H - BG3 Reference Point X-Coordinate, upper 12 bit (W)
        case 0x400003A:
            this.gfxRenderer.writeBG3X16_1(data | 0);
            break;
        //400003Ch - BG3Y_L - BG3 Reference Point Y-Coordinate, lower 16 bit (W)
        case 0x400003C:
            this.gfxRenderer.writeBG3Y16_0(data | 0);
            break;
        //400003Eh - BG3Y_H - BG3 Reference Point Y-Coordinate, upper 12 bit (W)
        case 0x400003E:
            this.gfxRenderer.writeBG3Y16_1(data | 0);
            break;
        //4000040h - WIN0H - Window 0 Horizontal Dimensions (W)
        case 0x4000040:
            this.gfxRenderer.writeWIN0XCOORD16(data | 0);
            break;
        //4000042h - WIN1H - Window 1 Horizontal Dimensions (W)
        case 0x4000042:
            this.gfxRenderer.writeWIN1XCOORD16(data | 0);
            break;
        //4000044h - WIN0V - Window 0 Vertical Dimensions (W)
        case 0x4000044:
            this.gfxRenderer.writeWIN0YCOORD16(data | 0);
            break;
        //4000046h - WIN1V - Window 1 Vertical Dimensions (W)
        case 0x4000046:
            this.gfxRenderer.writeWIN1YCOORD16(data | 0);
            break;
        //4000048h - WININ - Control of Inside of Window(s) (R/W)
        case 0x4000048:
            this.gfxRenderer.writeWININ16(data | 0);
            break;
        //400004Ah- WINOUT - Control of Outside of Windows & Inside of OBJ Window (R/W)
        case 0x400004A:
            this.gfxRenderer.writeWINOUT16(data | 0);
            break;
        //400004Ch - MOSAIC - Mosaic Size (W)
        case 0x400004C:
            this.gfxRenderer.writeMOSAIC16(data | 0);
            break;
        //400004Eh - NOT USED - ZERO
        //4000050h - BLDCNT - Color Special Effects Selection (R/W)
        case 0x4000050:
            this.gfxRenderer.writeBLDCNT16(data | 0);
            break;
        //4000052h - BLDALPHA - Alpha Blending Coefficients (R/W)
        case 0x4000052:
            this.gfxRenderer.writeBLDALPHA16(data | 0);
            break;
        //4000054h - BLDY - Brightness (Fade-In/Out) Coefficient (W)
        case 0x4000054:
            this.gfxRenderer.writeBLDY8(data | 0);
            break;
        //4000055h through 400005Fh - NOT USED - ZERO/GLITCHED
        //4000060h - SOUND1CNT_L (NR10) - Channel 1 Sweep register (R/W)
        case 0x4000060:
            //NR10:
            this.sound.writeSOUND1CNT8_0(data | 0);
            break;
        //4000062h - SOUND1CNT_H (NR11, NR12) - Channel 1 Duty/Len/Envelope (R/W)
        case 0x4000062:
            this.sound.writeSOUND1CNT16(data | 0);
            break;
        //4000064h - SOUND1CNT_X (NR13, NR14) - Channel 1 Frequency/Control (R/W)
        case 0x4000064:
            //NR13:
            //NR14:
            this.sound.writeSOUND1CNTX16(data | 0);
            break;
        //4000066h - NOT USED - ZERO
        //4000068h - SOUND2CNT_L (NR21, NR22) - Channel 2 Duty/Length/Envelope (R/W)
        case 0x4000068:
            //NR21:
            //NR22:
            this.sound.writeSOUND2CNTL16(data | 0);
            break;
        //400006Ah - NOT USED - ZERO
        //400006Ch - SOUND2CNT_H (NR23, NR24) - Channel 2 Frequency/Control (R/W)
        case 0x400006C:
            //NR23:
            //NR24:
            this.sound.writeSOUND2CNTH16(data | 0);
            break;
        //400006Eh - NOT USED - ZERO
        //4000070h - SOUND3CNT_L (NR30) - Channel 3 Stop/Wave RAM select (R/W)
        case 0x4000070:
            //NR30:
            this.sound.writeSOUND3CNT8_0(data | 0);
            break;
        //4000072h - SOUND3CNT_H (NR31, NR32) - Channel 3 Length/Volume (R/W)
        case 0x4000072:
            //NR31:
            //NR32:
            this.sound.writeSOUND3CNT16(data | 0);
            break;
        //4000074h - SOUND3CNT_X (NR33, NR34) - Channel 3 Frequency/Control (R/W)
        case 0x4000074:
            //NR33:
            //NR34:
            this.sound.writeSOUND3CNTX16(data | 0);
            break;
        //4000076h - NOT USED - ZERO
        //4000078h - SOUND4CNT_L (NR41, NR42) - Channel 4 Length/Envelope (R/W)
        case 0x4000078:
            //NR41:
            //NR42:
            this.sound.writeSOUND4CNTL16(data | 0);
            break;
        //400007Ah - NOT USED - ZERO
        //400007Ch - SOUND4CNT_H (NR43, NR44) - Channel 4 Frequency/Control (R/W)
        case 0x400007C:
            //NR43:
            //NR44:
            this.sound.writeSOUND4CNTH16(data | 0);
            break;
        //400007Eh - NOT USED - ZERO
        //4000080h - SOUNDCNT_L (NR50, NR51) - Channel L/R Volume/Enable (R/W)
        case 0x4000080:
            //NR50:
            //NR51:
            this.sound.writeSOUNDCNTL16(data | 0);
            break;
        //4000082h - SOUNDCNT_H (GBA only) - DMA Sound Control/Mixing (R/W)
        case 0x4000082:
            this.sound.writeSOUNDCNTH16(data | 0);
            break;
        //4000084h - SOUNDCNT_X (NR52) - Sound on/off (R/W)
        case 0x4000084:
            this.sound.writeSOUNDCNTX8(data | 0);
            break;
        //4000086h - NOT USED - ZERO
        //4000088h - SOUNDBIAS - Sound PWM Control (R/W)
        case 0x4000088:
            this.sound.writeSOUNDBIAS16(data | 0);
            break;
        //400008Ah through 400008Fh - NOT USED - ZERO/GLITCHED
        //4000090h - WAVE_RAM0_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000090:
        //4000092h - WAVE_RAM0_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000092:
        //4000094h - WAVE_RAM1_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000094:
        //4000096h - WAVE_RAM1_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000096:
        //4000098h - WAVE_RAM2_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000098:
        //400009Ah - WAVE_RAM2_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009A:
        //400009Ch - WAVE_RAM3_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009C:
        //400009Eh - WAVE_RAM3_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009E:
            this.sound.writeWAVE16(address & 0xE, data | 0);
            break;
        //40000A0h - FIFO_A_L - FIFO Channel A First Word (W)
        case 0x40000A0:
        //40000A2h - FIFO_A_H - FIFO Channel A Second Word (W)
        case 0x40000A2:
            this.sound.writeFIFOA16(data | 0);
            break;
        //40000A4h - FIFO_B_L - FIFO Channel B First Word (W)
        case 0x40000A4:
        //40000A6h - FIFO_B_H - FIFO Channel B Second Word (W)
        case 0x40000A6:
            this.sound.writeFIFOB16(data | 0);
            break;
        //40000A8h through 40000AFh - NOT USED - GLITCHED
        //40000B0h - DMA0SAD - DMA 0 Source Address (W) (internal memory)
        case 0x40000B0:
            this.dmaChannel0.writeDMASource16_0(data | 0);
            break;
        //40000B2h - DMA0SAH - DMA 0 Source Address (W) (internal memory)
        case 0x40000B2:
            this.dmaChannel0.writeDMASource16_1(data | 0);
            break;
        //40000B4h - DMA0DAD - DMA 0 Destination Address (W) (internal memory)
        case 0x40000B4:
            this.dmaChannel0.writeDMADestination16_0(data | 0);
            break;
        //40000B6h - DMA0DAH - DMA 0 Destination Address (W) (internal memory)
        case 0x40000B6:
            this.dmaChannel0.writeDMADestination16_1(data | 0);
            break;
        //40000B8h - DMA0CNT_L - DMA 0 Word Count (W) (14 bit, 1..4000h)
        case 0x40000B8:
            this.dmaChannel0.writeDMAWordCount16(data | 0);
            break;
        //40000BAh - DMA0CNT_H - DMA 0 Control (R/W)
        case 0x40000BA:
            this.dmaChannel0.writeDMAControl16(data | 0);
            break;
        //40000BCh - DMA1SAD - DMA 1 Source Address (W) (internal memory)
        case 0x40000BC:
            this.dmaChannel1.writeDMASource16_0(data | 0);
            break;
        //40000BEh - DMA1SAH - DMA 1 Source Address (W) (internal memory)
        case 0x40000BE:
            this.dmaChannel1.writeDMASource16_1(data | 0);
            break;
        //40000C0h - DMA1DAD - DMA 1 Destination Address (W) (internal memory)
        case 0x40000C0:
            this.dmaChannel1.writeDMADestination16_0(data | 0);
            break;
        //40000C2h - DMA1DAH - DMA 1 Destination Address (W) (internal memory)
        case 0x40000C2:
            this.dmaChannel1.writeDMADestination16_1(data | 0);
            break;
        //40000C4h - DMA1CNT_L - DMA 1 Word Count (W) (14 bit, 1..4000h)
        case 0x40000C4:
            this.dmaChannel1.writeDMAWordCount16(data | 0);
            break;
        //40000C6h - DMA1CNT_H - DMA 1 Control (R/W)
        case 0x40000C6:
            this.dmaChannel1.writeDMAControl16(data | 0);
            break;
        //40000C8h - DMA2SAD - DMA 2 Source Address (W) (internal memory)
        case 0x40000C8:
            this.dmaChannel2.writeDMASource16_0(data | 0);
            break;
        //40000CAh - DMA2SAH - DMA 2 Source Address (W) (internal memory)
        case 0x40000CA:
            this.dmaChannel2.writeDMASource16_1(data | 0);
            break;
        //40000CCh - DMA2DAD - DMA 2 Destination Address (W) (internal memory)
        case 0x40000CC:
            this.dmaChannel2.writeDMADestination16_0(data | 0);
            break;
        //40000CEh - DMA2DAH - DMA 2 Destination Address (W) (internal memory)
        case 0x40000CE:
            this.dmaChannel2.writeDMADestination16_1(data | 0);
            break;
        //40000D0h - DMA2CNT_L - DMA 2 Word Count (W) (14 bit, 1..4000h)
        case 0x40000D0:
            this.dmaChannel2.writeDMAWordCount16(data | 0);
            break;
        //40000D2h - DMA2CNT_H - DMA 2 Control (R/W)
        case 0x40000D2:
            this.dmaChannel2.writeDMAControl16(data | 0);
            break;
        //40000D4h - DMA3SAD - DMA 3 Source Address (W) (internal memory)
        case 0x40000D4:
            this.dmaChannel3.writeDMASource16_0(data | 0);
            break;
        //40000D6h - DMA3SAH - DMA 3 Source Address (W) (internal memory)
        case 0x40000D6:
            this.dmaChannel3.writeDMASource16_1(data | 0);
            break;
        //40000D8h - DMA3DAD - DMA 3 Destination Address (W) (internal memory)
        case 0x40000D8:
            this.dmaChannel3.writeDMADestination16_0(data | 0);
            break;
        //40000DAh - DMA3DAH - DMA 3 Destination Address (W) (internal memory)
        case 0x40000DA:
            this.dmaChannel3.writeDMADestination16_1(data | 0);
            break;
        //40000DCh - DMA3CNT_L - DMA 3 Word Count (W) (16 bit, 1..10000h)
        case 0x40000DC:
            this.dmaChannel3.writeDMAWordCount16(data | 0);
            break;
        //40000DEh - DMA3CNT_H - DMA 3 Control (R/W)
        case 0x40000DE:
            this.dmaChannel3.writeDMAControl16(data | 0);
            break;
        //40000E0h through 40000FFh - NOT USED - GLITCHED
        //4000100h - TM0CNT_L - Timer 0 Counter/Reload (R/W)
        case 0x4000100:
            this.timer.writeTM0CNT16(data | 0);
            break;
        //4000102h - TM0CNT_H - Timer 0 Control (R/W)
        case 0x4000102:
            this.timer.writeTM0CNT8_2(data | 0);
            break;
        //4000104h - TM1CNT_L - Timer 1 Counter/Reload (R/W)
        case 0x4000104:
            this.timer.writeTM1CNT16(data | 0);
            break;
        //4000106h - TM1CNT_H - Timer 1 Control (R/W)
        case 0x4000106:
            this.timer.writeTM1CNT8_2(data | 0);
            break;
        //4000108h - TM2CNT_L - Timer 2 Counter/Reload (R/W)
        case 0x4000108:
            this.timer.writeTM2CNT16(data | 0);
            break;
        //400010Ah - TM2CNT_H - Timer 2 Control (R/W)
        case 0x400010A:
            this.timer.writeTM2CNT8_2(data | 0);
            break;
        //400010Ch - TM3CNT_L - Timer 3 Counter/Reload (R/W)
        case 0x400010C:
            this.timer.writeTM3CNT16(data | 0);
            break;
        //400010Eh - TM3CNT_H - Timer 3 Control (R/W)
        case 0x400010E:
            this.timer.writeTM3CNT8_2(data | 0);
            break;
        //4000110h through 400011Fh - NOT USED - GLITCHED
        //4000120h - Serial Data A (R/W)
        case 0x4000120:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_A0(data & 0xFF);
            this.serial.writeSIODATA_A1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000122h - Serial Data B (R/W)
        case 0x4000122:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_B0(data & 0xFF);
            this.serial.writeSIODATA_B1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000124h - Serial Data C (R/W)
        case 0x4000124:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_C0(data & 0xFF);
            this.serial.writeSIODATA_C1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000126h - Serial Data D (R/W)
        case 0x4000126:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_D0(data & 0xFF);
            this.serial.writeSIODATA_D1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000128h - SIOCNT - SIO Sub Mode Control (R/W)
        case 0x4000128:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIOCNT0(data & 0xFF);
            this.serial.writeSIOCNT1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //400012Ah - SIOMLT_SEND - Data Send Register (R/W)
        case 0x400012A:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA8_0(data & 0xFF);
            this.serial.writeSIODATA8_1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //400012Ch through 400012Fh - NOT USED - GLITCHED
        //4000130h - KEYINPUT - Key Status (R)
        //4000132h - KEYCNT - Key Interrupt Control (R/W)
        case 0x4000132:
            this.joypad.writeKeyControl16(data | 0);
            break;
        //4000134h - RCNT (R/W) - Mode Selection
        case 0x4000134:
            this.IOCore.updateSerialClocking();
            this.serial.writeRCNT0(data & 0xFF);
            this.serial.writeRCNT1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000136h through 400013Fh - NOT USED - GLITCHED
        //4000140h - JOYCNT - JOY BUS Control Register (R/W)
        case 0x4000140:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYCNT(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000142h through 400014Fh - NOT USED - GLITCHED
        //4000150h - JoyBus Receive (R/W)
        case 0x4000150:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_RECV0(data & 0xFF);
            this.serial.writeJOYBUS_RECV1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000152h - JoyBus Receive (R/W)
        case 0x4000152:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_RECV2(data & 0xFF);
            this.serial.writeJOYBUS_RECV3((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000154h - JoyBus Send (R/W)
        case 0x4000154:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_SEND0(data & 0xFF);
            this.serial.writeJOYBUS_SEND1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000156h - JoyBus Send (R/W)
        case 0x4000156:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_SEND2(data & 0xFF);
            this.serial.writeJOYBUS_SEND3((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000158h - JoyBus Stat (R/W)
        case 0x4000158:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_STAT(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000159h through 40001FFh - NOT USED - GLITCHED
        //4000200h - IE - Interrupt Enable Register (R/W)
        case 0x4000200:
            this.irq.writeIE16(data | 0);
            break;
        //4000202h - IF - Interrupt Request Flags / IRQ Acknowledge
        case 0x4000202:
            this.irq.writeIF16(data | 0);
            break;
        //4000204h - WAITCNT - Waitstate Control (R/W)
        case 0x4000204:
            this.wait.writeWAITCNT16(data | 0);
            break;
        //4000206h - WAITCNT - Waitstate Control (R/W)
        //4000208h - IME - Interrupt Master Enable Register (R/W)
        case 0x4000208:
            this.irq.writeIME(data | 0);
            break;
        //4000209h through 40002FFh - NOT USED - GLITCHED
        //4000300h - POSTFLG - BYTE - Undocumented - Post Boot / Debug Control (R/W)
        case 0x4000300:
            this.wait.writeHALT16(data | 0);
            break;
        default:
            if ((address & 0xFFFC) == 0x800) {
                //WRAM wait state control:
                this.wait.writeConfigureWRAM16(address | 0, data | 0);
            }
    }
}
GameBoyAdvanceMemory.prototype.writeIODispatch32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.singleClock();
    switch (address & -4) {
        //4000000h - DISPCNT - LCD Control (Read/Write)
        //4000002h - Undocumented - Green Swap (R/W)
        case 0x4000000:
            this.gfxRenderer.writeDISPCNT32(data | 0);
            break;
        //4000004h - DISPSTAT - General LCD Status (Read/Write)
        //4000006h - VCOUNT - Vertical Counter (Read only)
        case 0x4000004:
            this.gfxState.writeDISPSTAT16(data | 0);
            break;
        //4000008h - BG0CNT - BG0 Control (R/W) (BG Modes 0,1 only)
        //400000Ah - BG1CNT - BG1 Control (R/W) (BG Modes 0,1 only)
        case 0x4000008:
            this.gfxRenderer.writeBG0BG1CNT32(data | 0);
            break;
        //400000Ch - BG2CNT - BG2 Control (R/W) (BG Modes 0,1,2 only)
        //400000Eh - BG3CNT - BG3 Control (R/W) (BG Modes 0,2 only)
        case 0x400000C:
            this.gfxRenderer.writeBG2BG3CNT32(data | 0);
            break;
        //4000010h - BG0HOFS - BG0 X-Offset (W)
        //4000012h - BG0VOFS - BG0 Y-Offset (W)
        case 0x4000010:
            this.gfxRenderer.writeBG0OFS32(data | 0);
            break;
        //4000014h - BG1HOFS - BG1 X-Offset (W)
        //4000016h - BG1VOFS - BG1 Y-Offset (W)
        case 0x4000014:
            this.gfxRenderer.writeBG1OFS32(data | 0);
            break;
        //4000018h - BG2HOFS - BG2 X-Offset (W)
        //400001Ah - BG2VOFS - BG2 Y-Offset (W)
        case 0x4000018:
            this.gfxRenderer.writeBG2OFS32(data | 0);
            break;
        //400001Ch - BG3HOFS - BG3 X-Offset (W)
        //400001Eh - BG3VOFS - BG3 Y-Offset (W)
        case 0x400001C:
            this.gfxRenderer.writeBG3OFS32(data | 0);
            break;
        //4000020h - BG2PA - BG2 Rotation/Scaling Parameter A (alias dx) (W)
        //4000022h - BG2PB - BG2 Rotation/Scaling Parameter B (alias dmx) (W)
        case 0x4000020:
            this.gfxRenderer.writeBG2PAB32(data | 0);
            break;
        //4000024h - BG2PC - BG2 Rotation/Scaling Parameter C (alias dy) (W)
        //4000026h - BG2PD - BG2 Rotation/Scaling Parameter D (alias dmy) (W)
        case 0x4000024:
            this.gfxRenderer.writeBG2PCD32(data | 0);
            break;
        //4000028h - BG2X_L - BG2 Reference Point X-Coordinate, lower 16 bit (W)
        //400002Ah - BG2X_H - BG2 Reference Point X-Coordinate, upper 12 bit (W)
        case 0x4000028:
            this.gfxRenderer.writeBG2X32(data | 0);
            break;
        //400002Ch - BG2Y_L - BG2 Reference Point Y-Coordinate, lower 16 bit (W)
        //400002Eh - BG2Y_H - BG2 Reference Point Y-Coordinate, upper 12 bit (W)
        case 0x400002C:
            this.gfxRenderer.writeBG2Y32(data | 0);
            break;
        //4000030h - BG3PA - BG3 Rotation/Scaling Parameter A (alias dx) (W)
        //4000032h - BG3PB - BG3 Rotation/Scaling Parameter B (alias dmx) (W)
        case 0x4000030:
            this.gfxRenderer.writeBG3PAB32(data | 0);
            break;
        //4000034h - BG3PC - BG3 Rotation/Scaling Parameter C (alias dy) (W)
        //4000036h - BG3PD - BG3 Rotation/Scaling Parameter D (alias dmy) (W)
        case 0x4000034:
            this.gfxRenderer.writeBG3PCD32(data | 0);
            break;
        //4000038h - BG3X_L - BG3 Reference Point X-Coordinate, lower 16 bit (W)
        //400003Ah - BG3X_H - BG3 Reference Point X-Coordinate, upper 12 bit (W)
        case 0x4000038:
            this.gfxRenderer.writeBG3X32(data | 0);
            break;
        //400003Ch - BG3Y_L - BG3 Reference Point Y-Coordinate, lower 16 bit (W)
        //400003Eh - BG3Y_H - BG3 Reference Point Y-Coordinate, upper 12 bit (W)
        case 0x400003C:
            this.gfxRenderer.writeBG3Y32(data | 0);
            break;
        //4000040h - WIN0H - Window 0 Horizontal Dimensions (W)
        //4000042h - WIN1H - Window 1 Horizontal Dimensions (W)
        case 0x4000040:
            this.gfxRenderer.writeWINXCOORD32(data | 0);
            break;
        //4000044h - WIN0V - Window 0 Vertical Dimensions (W)
        //4000046h - WIN1V - Window 1 Vertical Dimensions (W)
        case 0x4000044:
            this.gfxRenderer.writeWINYCOORD32(data | 0);
            break;
        //4000048h - WININ - Control of Inside of Window(s) (R/W)
        //400004Ah- WINOUT - Control of Outside of Windows & Inside of OBJ Window (R/W)
        case 0x4000048:
            this.gfxRenderer.writeWINCONTROL32(data | 0);
            break;
        //400004Ch - MOSAIC - Mosaic Size (W)
        //400004Eh - NOT USED - ZERO
        case 0x400004C:
            this.gfxRenderer.writeMOSAIC16(data | 0);
            break;
        //4000050h - BLDCNT - Color Special Effects Selection (R/W)
        //4000052h - BLDALPHA - Alpha Blending Coefficients (R/W)
        case 0x4000050:
            this.gfxRenderer.writeBLDCNT32(data | 0);
            break;
        //4000054h - BLDY - Brightness (Fade-In/Out) Coefficient (W)
        case 0x4000054:
            this.gfxRenderer.writeBLDY8(data | 0);
            break;
        //4000055h through 400005Fh - NOT USED - ZERO/GLITCHED
        //4000060h - SOUND1CNT_L (NR10) - Channel 1 Sweep register (R/W)
        //4000062h - SOUND1CNT_H (NR11, NR12) - Channel 1 Duty/Len/Envelope (R/W)
        case 0x4000060:
            //NR10:
            this.sound.writeSOUND1CNT32(data | 0);
            break;
        //4000064h - SOUND1CNT_X (NR13, NR14) - Channel 1 Frequency/Control (R/W)
        //4000066h - NOT USED - ZERO
        case 0x4000064:
            //NR13:
            //NR14:
            this.sound.writeSOUND1CNTX16(data | 0);
            break;
        //4000068h - SOUND2CNT_L (NR21, NR22) - Channel 2 Duty/Length/Envelope (R/W)
        //400006Ah - NOT USED - ZERO
        case 0x4000068:
            //NR21:
            //NR22:
            this.sound.writeSOUND2CNTL16(data | 0);
            break;
        //400006Ch - SOUND2CNT_H (NR23, NR24) - Channel 2 Frequency/Control (R/W)
        //400006Eh - NOT USED - ZERO
        case 0x400006C:
            //NR23:
            //NR24:
            this.sound.writeSOUND2CNTH16(data | 0);
            break;
        //4000070h - SOUND3CNT_L (NR30) - Channel 3 Stop/Wave RAM select (R/W)
        //4000072h - SOUND3CNT_H (NR31, NR32) - Channel 3 Length/Volume (R/W)
        case 0x4000070:
            //NR30:
            //NR31:
            //NR32:
            this.sound.writeSOUND3CNT32(data | 0);
            break;
        //4000074h - SOUND3CNT_X (NR33, NR34) - Channel 3 Frequency/Control (R/W)
        //4000076h - NOT USED - ZERO
        case 0x4000074:
            //NR33:
            //NR34:
            this.sound.writeSOUND3CNTX16(data | 0);
            break;
        //4000078h - SOUND4CNT_L (NR41, NR42) - Channel 4 Length/Envelope (R/W)
        //400007Ah - NOT USED - ZERO
        case 0x4000078:
            //NR41:
            //NR42:
            this.sound.writeSOUND4CNTL16(data | 0);
            break;
        //400007Ch - SOUND4CNT_H (NR43, NR44) - Channel 4 Frequency/Control (R/W)
        //400007Eh - NOT USED - ZERO
        case 0x400007C:
            //NR43:
            //NR44:
            this.sound.writeSOUND4CNTH16(data | 0);
            break;
        //4000080h - SOUNDCNT_L (NR50, NR51) - Channel L/R Volume/Enable (R/W)
        //4000082h - SOUNDCNT_H (GBA only) - DMA Sound Control/Mixing (R/W)
        case 0x4000080:
            //NR50:
            //NR51:
            this.sound.writeSOUNDCNT32(data | 0);
            break;
        //4000084h - SOUNDCNT_X (NR52) - Sound on/off (R/W)
        //4000086h - NOT USED - ZERO
        case 0x4000084:
            this.sound.writeSOUNDCNTX8(data | 0);
            break;
        //4000088h - SOUNDBIAS - Sound PWM Control (R/W)
        case 0x4000088:
            this.sound.writeSOUNDBIAS16(data | 0);
            break;
        //400008Ah through 400008Fh - NOT USED - ZERO/GLITCHED
        //4000090h - WAVE_RAM0_L - Channel 3 Wave Pattern RAM (W/R)
        //4000092h - WAVE_RAM0_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000090:
        //4000094h - WAVE_RAM1_L - Channel 3 Wave Pattern RAM (W/R)
        //4000096h - WAVE_RAM1_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000094:
        //4000098h - WAVE_RAM2_L - Channel 3 Wave Pattern RAM (W/R)
        //400009Ah - WAVE_RAM2_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000098:
        //400009Ch - WAVE_RAM3_L - Channel 3 Wave Pattern RAM (W/R)
        //400009Eh - WAVE_RAM3_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009C:
            this.sound.writeWAVE32(address & 0xC, data | 0);
            break;
        //40000A0h - FIFO_A_L - FIFO Channel A First Word (W)
        //40000A2h - FIFO_A_H - FIFO Channel A Second Word (W)
        case 0x40000A0:
            this.sound.writeFIFOA32(data | 0);
            break;
        //40000A4h - FIFO_B_L - FIFO Channel B First Word (W)
        //40000A6h - FIFO_B_H - FIFO Channel B Second Word (W)
        case 0x40000A4:
            this.sound.writeFIFOB32(data | 0);
            break;
        //40000A8h through 40000AFh - NOT USED - GLITCHED
        //40000B0h - DMA0SAH - DMA 0 Source Address (W) (internal memory)
        //40000B2h - DMA0SAD - DMA 0 Source Address (W) (internal memory)
        case 0x40000B0:
            this.dmaChannel0.writeDMASource32(data | 0);
            break;
        //40000B4h - DMA0DAD - DMA 0 Destination Address (W) (internal memory)
        //40000B6h - DMA0DAH - DMA 0 Destination Address (W) (internal memory)
        case 0x40000B4:
            this.dmaChannel0.writeDMADestination32(data | 0);
            break;
        //40000B8h - DMA0CNT_L - DMA 0 Word Count (W) (14 bit, 1..4000h)
        //40000BAh - DMA0CNT_H - DMA 0 Control (R/W)
        case 0x40000B8:
            this.dmaChannel0.writeDMAControl32(data | 0);
            break;
        //40000BCh - DMA1SAD - DMA 1 Source Address (W) (internal memory)
        //40000BEh - DMA1SAH - DMA 1 Source Address (W) (internal memory)
        case 0x40000BC:
            this.dmaChannel1.writeDMASource32(data | 0);
            break;
        //40000C0h - DMA1DAD - DMA 1 Destination Address (W) (internal memory)
        //40000C2h - DMA1DAH - DMA 1 Destination Address (W) (internal memory)
        case 0x40000C0:
            this.dmaChannel1.writeDMADestination32(data | 0);
            break;
        //40000C4h - DMA1CNT_L - DMA 1 Word Count (W) (14 bit, 1..4000h)
        //40000C6h - DMA1CNT_H - DMA 1 Control (R/W)
        case 0x40000C4:
            this.dmaChannel1.writeDMAControl32(data | 0);
            break;
        //40000C8h - DMA2SAD - DMA 2 Source Address (W) (internal memory)
        //40000CAh - DMA2SAH - DMA 2 Source Address (W) (internal memory)
        case 0x40000C8:
            this.dmaChannel2.writeDMASource32(data | 0);
            break;
        //40000CCh - DMA2DAD - DMA 2 Destination Address (W) (internal memory)
        //40000CEh - DMA2DAH - DMA 2 Destination Address (W) (internal memory)
        case 0x40000CC:
            this.dmaChannel2.writeDMADestination32(data | 0);
            break;
        //40000D0h - DMA2CNT_L - DMA 2 Word Count (W) (14 bit, 1..4000h)
        //40000D2h - DMA2CNT_H - DMA 2 Control (R/W)
        case 0x40000D0:
            this.dmaChannel2.writeDMAControl32(data | 0);
            break;
        //40000D4h - DMA3SAD - DMA 3 Source Address (W) (internal memory)
        //40000D6h - DMA3SAH - DMA 3 Source Address (W) (internal memory)
        case 0x40000D4:
            this.dmaChannel3.writeDMASource32(data | 0);
            break;
        //40000D8h - DMA3DAD - DMA 3 Destination Address (W) (internal memory)
        //40000DAh - DMA3DAH - DMA 3 Destination Address (W) (internal memory)
        case 0x40000D8:
            this.dmaChannel3.writeDMADestination32(data | 0);
            break;
        //40000DCh - DMA3CNT_L - DMA 3 Word Count (W) (16 bit, 1..10000h)
        //40000DEh - DMA3CNT_H - DMA 3 Control (R/W)
        case 0x40000DC:
            this.dmaChannel3.writeDMAControl32(data | 0);
            break;
        //40000E0h through 40000FFh - NOT USED - GLITCHED
        //4000100h - TM0CNT_L - Timer 0 Counter/Reload (R/W)
        //4000102h - TM0CNT_H - Timer 0 Control (R/W)
        case 0x4000100:
            this.timer.writeTM0CNT32(data | 0);
            break;
        //4000104h - TM1CNT_L - Timer 1 Counter/Reload (R/W)
        //4000106h - TM1CNT_H - Timer 1 Control (R/W)
        case 0x4000104:
            this.timer.writeTM1CNT32(data | 0);
            break;
        //4000108h - TM2CNT_L - Timer 2 Counter/Reload (R/W)
        //400010Ah - TM2CNT_H - Timer 2 Control (R/W)
        case 0x4000108:
            this.timer.writeTM2CNT32(data | 0);
            break;
        //400010Ch - TM3CNT_L - Timer 3 Counter/Reload (R/W)
        //400010Eh - TM3CNT_H - Timer 3 Control (R/W)
        case 0x400010C:
            this.timer.writeTM3CNT32(data | 0);
            break;
        //4000110h through 400011Fh - NOT USED - GLITCHED
        //4000120h - Serial Data A (R/W)
        //4000122h - Serial Data B (R/W)
        case 0x4000120:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_A0(data & 0xFF);
            this.serial.writeSIODATA_A1((data >> 8) & 0xFF);
            this.serial.writeSIODATA_B0((data >> 16) & 0xFF);
            this.serial.writeSIODATA_B1(data >>> 24);
            this.IOCore.updateCoreEventTime();
            break;
        //4000124h - Serial Data C (R/W)
        //4000126h - Serial Data D (R/W)
        case 0x4000124:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIODATA_C0(data & 0xFF);
            this.serial.writeSIODATA_C1((data >> 8) & 0xFF);
            this.serial.writeSIODATA_D0((data >> 16) & 0xFF);
            this.serial.writeSIODATA_D1(data >>> 24);
            this.IOCore.updateCoreEventTime();
            break;
        //4000128h - SIOCNT - SIO Sub Mode Control (R/W)
        //400012Ah - SIOMLT_SEND - Data Send Register (R/W)
        case 0x4000128:
            this.IOCore.updateSerialClocking();
            this.serial.writeSIOCNT0(data & 0xFF);
            this.serial.writeSIOCNT1((data >> 8) & 0xFF);
            this.serial.writeSIODATA8_0((data >> 16) & 0xFF);
            this.serial.writeSIODATA8_1(data >>> 24);
            this.IOCore.updateCoreEventTime();
            break;
        //400012Ch through 400012Fh - NOT USED - GLITCHED
        //4000130h - KEYINPUT - Key Status (R)
        //4000132h - KEYCNT - Key Interrupt Control (R/W)
        case 0x4000130:
            this.joypad.writeKeyControl16(data >> 16);
            break;
        //4000134h - RCNT (R/W) - Mode Selection
        case 0x4000134:
            this.IOCore.updateSerialClocking();
            this.serial.writeRCNT0(data & 0xFF);
            this.serial.writeRCNT1((data >> 8) & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000136h through 400013Fh - NOT USED - GLITCHED
        //4000140h - JOYCNT - JOY BUS Control Register (R/W)
        case 0x4000140:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYCNT(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000142h through 400014Fh - NOT USED - GLITCHED
        //4000150h - JoyBus Receive (R/W)
        //4000152h - JoyBus Receive (R/W)
        case 0x4000150:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_RECV0(data & 0xFF);
            this.serial.writeJOYBUS_RECV1((data >> 8) & 0xFF);
            this.serial.writeJOYBUS_RECV2((data >> 16) & 0xFF);
            this.serial.writeJOYBUS_RECV3(data >>> 24);
            this.IOCore.updateCoreEventTime();
            break;
        //4000154h - JoyBus Send (R/W)
        //4000156h - JoyBus Send (R/W)
        case 0x4000154:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_SEND0(data & 0xFF);
            this.serial.writeJOYBUS_SEND1((data >> 8) & 0xFF);
            this.serial.writeJOYBUS_SEND2((data >> 16) & 0xFF);
            this.serial.writeJOYBUS_SEND3(data >>> 24);
            this.IOCore.updateCoreEventTime();
            break;
        //4000158h - JoyBus Stat (R/W)
        case 0x4000158:
            this.IOCore.updateSerialClocking();
            this.serial.writeJOYBUS_STAT(data & 0xFF);
            this.IOCore.updateCoreEventTime();
            break;
        //4000159h through 40001FFh - NOT USED - GLITCHED
        //4000200h - IE - Interrupt Enable Register (R/W)
        //4000202h - IF - Interrupt Request Flags / IRQ Acknowledge
        case 0x4000200:
            this.irq.writeIRQ32(data | 0);
            break;
        //4000204h - WAITCNT - Waitstate Control (R/W)
        //4000206h - WAITCNT - Waitstate Control (R/W)
        case 0x4000204:
            this.wait.writeWAITCNT16(data | 0);
            break;
        //4000208h - IME - Interrupt Master Enable Register (R/W)
        case 0x4000208:
            this.irq.writeIME(data | 0);
            break;
        //4000209h through 40002FFh - NOT USED - GLITCHED
        //4000300h - POSTFLG - BYTE - Undocumented - Post Boot / Debug Control (R/W)
        //4000302h - NOT USED - ZERO
        case 0x4000300:
            this.wait.writeHALT16(data | 0);
            break;
        default:
            if ((address & 0xFFFC) == 0x800) {
                //WRAM wait state control:
                this.wait.writeConfigureWRAM32(data | 0);
            }
    }
}
if (typeof Math.imul == "function") {
    //Math.imul found, insert the optimized path in:
    GameBoyAdvanceMemory.prototype.writeVRAM8Preliminary = function (address, data) {
        address = address | 0;
        data = data | 0;
        this.IOCore.updateGraphicsClocking();
        switch (address >> 24) {
            case 0x5:
                this.wait.VRAMAccess();
                this.gfxRenderer.writePalette16(address & 0x3FE, Math.imul(data & 0xFF, 0x101) | 0);
                break;
            case 0x6:
                this.wait.VRAMAccess();
                this.gfxRenderer.writeVRAM8(address | 0, data | 0);
                break;
            default:
                this.wait.OAMAccess();
        }
    }
}
else {
    //Math.imul not found, use the compatibility method:
    GameBoyAdvanceMemory.prototype.writeVRAM8Preliminary = function (address, data) {
        this.IOCore.updateGraphicsClocking();
        switch (address >> 24) {
            case 0x5:
                this.wait.VRAMAccess();
                this.gfxRenderer.writePalette16(address & 0x3FE, (data & 0xFF) * 0x101);
                break;
            case 0x6:
                this.wait.VRAMAccess();
                this.gfxRenderer.writeVRAM8(address, data);
                break;
            default:
                this.wait.OAMAccess();
        }
    }
}
GameBoyAdvanceMemory.prototype.writePalette16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.IOCore.updateGraphicsClocking();
    this.wait.VRAMAccess();
    this.gfxRenderer.writePalette16(address & 0x3FE, data & 0xFFFF);
}
GameBoyAdvanceMemory.prototype.writeVRAM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.IOCore.updateGraphicsClocking();
    this.wait.VRAMAccess();
    this.gfxRenderer.writeVRAM16(address | 0, data | 0);
}
GameBoyAdvanceMemory.prototype.writeOBJ16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.IOCore.updateGraphicsClocking();
    this.wait.OAMAccess();
    this.gfxRenderer.writeOAM16(address | 0, data | 0);
}
GameBoyAdvanceMemory.prototype.writePalette32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.IOCore.updateGraphicsClocking();
    this.wait.VRAMAccess32();
    this.gfxRenderer.writePalette32(address & 0x3FC, data | 0);
}
GameBoyAdvanceMemory.prototype.writeVRAM32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.IOCore.updateGraphicsClocking();
    this.wait.VRAMAccess32();
    this.gfxRenderer.writeVRAM32(address | 0, data | 0);
}
GameBoyAdvanceMemory.prototype.writeOBJ32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.IOCore.updateGraphicsClocking();
    this.wait.OAMAccess();
    this.gfxRenderer.writeOAM32(address | 0, data | 0);
}
GameBoyAdvanceMemory.prototype.writeROM8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.ROMAccess(address | 0);
    this.cartridge.writeROM8(address & 0x1FFFFFF, data & 0xFF);
}
GameBoyAdvanceMemory.prototype.writeROM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.ROMAccess(address | 0);
    this.cartridge.writeROM16(address & 0x1FFFFFE, data & 0xFFFF);
}
GameBoyAdvanceMemory.prototype.writeROM16DMA = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.ROMAccess(address | 0);
    this.cartridge.writeROM16DMA(address & 0x1FFFFFE, data & 0xFFFF);
}
GameBoyAdvanceMemory.prototype.writeROM32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.ROMAccess32(address | 0);
    this.cartridge.writeROM32(address & 0x1FFFFFC, data | 0);
}
GameBoyAdvanceMemory.prototype.writeSRAM8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.SRAMAccess();
    this.saves.writeSRAM(address & 0xFFFF, data & 0xFF);
}
GameBoyAdvanceMemory.prototype.writeSRAM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.SRAMAccess();
    this.saves.writeSRAM(address & 0xFFFE, (data >> ((address & 0x2) << 3)) & 0xFF);
}
GameBoyAdvanceMemory.prototype.writeSRAM32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.wait.SRAMAccess();
    this.saves.writeSRAM(address & 0xFFFC, data & 0xFF);
}
GameBoyAdvanceMemory.prototype.writeUnused = function () {
    //Ignore the data write...
    this.wait.singleClock();
}
GameBoyAdvanceMemory.prototype.remapWRAM = function (data) {
    data = data & 0x21;
    if ((data | 0) != (this.WRAMControlFlags | 0)) {
        switch (data | 0) {
            case 0:
                //Mirror Internal RAM to External:
                this.memoryRead8 = this.memoryRead8Generated[0];
                this.memoryWrite8 = this.memoryWrite8Generated[0];
                this.memoryRead16 = this.memoryRead16Generated[0];
                this.memoryReadDMA16 = this.memoryReadDMA16Generated[0];
                this.memoryReadDMAFull16 = this.memoryReadDMA16FullGenerated[0];
                this.memoryReadCPU16 = this.memoryReadCPU16Generated[0];
                this.memoryWrite16 = this.memoryWrite16Generated[0];
                this.memoryWriteDMA16 = this.memoryWriteDMA16Generated[0];
                this.memoryWriteDMAFull16 = this.memoryWriteDMA16FullGenerated[0];
                this.memoryRead32 = this.memoryRead32Generated[0];
                this.memoryReadDMA32 = this.memoryReadDMA32Generated[0];
                this.memoryReadDMAFull32 = this.memoryReadDMA32FullGenerated[0];
                this.memoryReadCPU32 = this.memoryReadCPU32Generated[0];
                this.memoryWrite32 = this.memoryWrite32Generated[0];
                this.memoryWriteDMA32 = this.memoryWriteDMA32Generated[0];
                this.memoryWriteDMAFull32 = this.memoryWriteDMA32FullGenerated[0];
                break;
            case 0x20:
                //Use External RAM:
                this.memoryRead8 = this.memoryRead8Generated[1];
                this.memoryWrite8 = this.memoryWrite8Generated[1];
                this.memoryRead16 = this.memoryRead16Generated[1];
                this.memoryReadDMA16 = this.memoryReadDMA16Generated[1];
                this.memoryReadDMAFull16 = this.memoryReadDMA16FullGenerated[1];
                this.memoryReadCPU16 = this.memoryReadCPU16Generated[1];
                this.memoryWrite16 = this.memoryWrite16Generated[1];
                this.memoryWriteDMA16 = this.memoryWriteDMA16Generated[1];
                this.memoryWriteDMAFull16 = this.memoryWriteDMA16FullGenerated[1];
                this.memoryRead32 = this.memoryRead32Generated[1];
                this.memoryReadDMA32 = this.memoryReadDMA32Generated[1];
                this.memoryReadDMAFull32 = this.memoryReadDMA32FullGenerated[1];
                this.memoryReadCPU32 = this.memoryReadCPU32Generated[1];
                this.memoryWrite32 = this.memoryWrite32Generated[1];
                this.memoryWriteDMA32 = this.memoryWriteDMA32Generated[1];
                this.memoryWriteDMAFull32 = this.memoryWriteDMA32FullGenerated[1];
                break;
            default:
                //WRAM Disabled:
                this.memoryRead8 = this.memoryRead8Generated[2];
                this.memoryWrite8 = this.memoryWrite8Generated[2];
                this.memoryRead16 = this.memoryRead16Generated[2];
                this.memoryReadDMA16 = this.memoryReadDMA16Generated[2];
                this.memoryReadDMAFull16 = this.memoryReadDMA16FullGenerated[2];
                this.memoryReadCPU16 = this.memoryReadCPU16Generated[2];
                this.memoryWrite16 = this.memoryWrite16Generated[2];
                this.memoryWriteDMA16 = this.memoryWriteDMA16Generated[2];
                this.memoryWriteDMAFull16 = this.memoryWriteDMA16FullGenerated[2];
                this.memoryRead32 = this.memoryRead32Generated[2];
                this.memoryReadDMA32 = this.memoryReadDMA32Generated[2];
                this.memoryReadDMAFull32 = this.memoryReadDMA32FullGenerated[2];
                this.memoryReadCPU32 = this.memoryReadCPU32Generated[2];
                this.memoryWrite32 = this.memoryWrite32Generated[2];
                this.memoryWriteDMA32 = this.memoryWriteDMA32Generated[2];
                this.memoryWriteDMAFull32 = this.memoryWriteDMA32FullGenerated[2];
        }
        this.WRAMControlFlags = data | 0;
    }
}
GameBoyAdvanceMemory.prototype.readBIOS8 = function (address) {
    address = address | 0;
    var data = 0;
    this.wait.singleClock();
    if ((address | 0) < 0x4000) {
        if ((this.cpu.registers[15] | 0) < 0x4000) {
            //If reading from BIOS while executing it:
            data = this.BIOS[address & 0x3FFF] | 0;
        }
        else {
            //Not allowed to read from BIOS while executing outside of it:
            data = (this.lastBIOSREAD >> ((address & 0x3) << 3)) & 0xFF;
        }
    }
    else {
        data = this.readUnused8CPUBase(address | 0) | 0;
    }
    return data | 0;
}
if (__LITTLE_ENDIAN__) {
    GameBoyAdvanceMemory.prototype.readBIOS16 = function (address) {
        address = address | 0;
        var data = 0;
        this.wait.singleClock();
        if ((address | 0) < 0x4000) {
            address = address >> 1;
            if ((this.cpu.registers[15] | 0) < 0x4000) {
                //If reading from BIOS while executing it:
                data = this.BIOS16[address & 0x1FFF] | 0;
            }
            else {
                //Not allowed to read from BIOS while executing outside of it:
                data = (this.lastBIOSREAD >> ((address & 0x1) << 4)) & 0xFFFF;
            }
        }
        else {
            data = this.readUnused16CPUBase(address | 0) | 0;
        }
        return data | 0;
    }
    GameBoyAdvanceMemory.prototype.readBIOS16DMA = function (address) {
        address = address | 0;
        var data = 0;
        this.wait.singleClock();
        if ((address | 0) < 0x4000) {
            address = address >> 1;
            if ((this.cpu.registers[15] | 0) < 0x4000) {
                //If reading from BIOS while executing it:
                data = this.BIOS16[address & 0x1FFF] | 0;
            }
        }
        else {
            data = this.readUnused16DMABase(address | 0) | 0;
        }
        return data | 0;
    }
    GameBoyAdvanceMemory.prototype.readBIOS16CPU = function (address) {
        address = address | 0;
        var data = 0;
        this.IOCore.updateCoreSingle();
        if ((address | 0) < 0x4000) {
            address = address >> 1;
            //If reading from BIOS while executing it:
            data = this.BIOS16[address & 0x1FFF] | 0;
            this.lastBIOSREAD = data | 0;
        }
        else {
            data = this.readUnused16CPUBase(address | 0) | 0;
        }
        return data | 0;
    }
    GameBoyAdvanceMemory.prototype.readBIOS32 = function (address) {
        address = address | 0;
        var data = 0;
        this.wait.singleClock();
        if ((address | 0) < 0x4000) {
            address = address >> 2;
            if ((this.cpu.registers[15] | 0) < 0x4000) {
                //If reading from BIOS while executing it:
                data = this.BIOS32[address & 0xFFF] | 0;
            }
            else {
                //Not allowed to read from BIOS while executing outside of it:
                data = this.lastBIOSREAD | 0;
            }
        }
        else {
            data = this.cpu.getCurrentFetchValue() | 0;
        }
        return data | 0;
    }
    GameBoyAdvanceMemory.prototype.readBIOS32DMA = function (address) {
        address = address | 0;
        var data = 0;
        this.wait.singleClock();
        if ((address | 0) < 0x4000) {
            address = address >> 2;
            if ((this.cpu.registers[15] | 0) < 0x4000) {
                //If reading from BIOS while executing it:
                data = this.BIOS32[address & 0xFFF] | 0;
            }
        }
        else {
            data = this.dma.getCurrentFetchValue() | 0;
        }
        return data | 0;
    }
    GameBoyAdvanceMemory.prototype.readBIOS32CPU = function (address) {
        address = address | 0;
        var data = 0;
        this.IOCore.updateCoreSingle();
        if ((address | 0) < 0x4000) {
            address = address >> 2;
            //If reading from BIOS while executing it:
            data = this.BIOS32[address & 0xFFF] | 0;
            this.lastBIOSREAD = data | 0;
        }
        else {
            data = this.cpu.getCurrentFetchValue() | 0;
        }
        return data | 0;
    }
}
else {
    GameBoyAdvanceMemory.prototype.readBIOS16 = function (address) {
        this.wait.singleClock();
        if (address < 0x4000) {
            if (this.cpu.registers[15] < 0x4000) {
                //If reading from BIOS while executing it:
                return this.BIOS[address & -2] | (this.BIOS[address | 1] << 8);
            }
            else {
                //Not allowed to read from BIOS while executing outside of it:
                return (this.lastBIOSREAD >> ((address & 0x2) << 3)) & 0xFFFF;
            }
        }
        else {
            return this.readUnused16CPUBase(address);
        }
    }
    GameBoyAdvanceMemory.prototype.readBIOS16DMA = function (address) {
        this.wait.singleClock();
        if (address < 0x4000) {
            if (this.cpu.registers[15] < 0x4000) {
                //If reading from BIOS while executing it:
                return this.BIOS[address & -2] | (this.BIOS[address | 1] << 8);
            }
            else {
                //Not allowed to read from BIOS while executing outside of it:
                return 0;
            }
        }
        else {
            return this.readUnused16DMABase(address);
        }
    }
    GameBoyAdvanceMemory.prototype.readBIOS16CPU = function (address) {
        this.IOCore.updateCoreSingle();
        if (address < 0x4000) {
            //If reading from BIOS while executing it:
            var data = this.BIOS[address & -2] | (this.BIOS[address | 1] << 8);
            this.lastBIOSREAD = data;
            return data;
        }
        else {
            return this.readUnused16CPUBase(address);
        }
    }
    GameBoyAdvanceMemory.prototype.readBIOS32 = function (address) {
        this.wait.singleClock();
        if (address < 0x4000) {
            if (this.cpu.registers[15] < 0x4000) {
                //If reading from BIOS while executing it:
                address &= -4;
                return this.BIOS[address] | (this.BIOS[address + 1] << 8) | (this.BIOS[address + 2] << 16)  | (this.BIOS[address + 3] << 24);
            }
            else {
                //Not allowed to read from BIOS while executing outside of it:
                return this.lastBIOSREAD;
            }
        }
        else {
            return this.cpu.getCurrentFetchValue();
        }
    }
    GameBoyAdvanceMemory.prototype.readBIOS32DMA = function (address) {
        this.wait.singleClock();
        if (address < 0x4000) {
            if (this.cpu.registers[15] < 0x4000) {
                //If reading from BIOS while executing it:
                address &= -4;
                return this.BIOS[address] | (this.BIOS[address + 1] << 8) | (this.BIOS[address + 2] << 16)  | (this.BIOS[address + 3] << 24);
            }
            else {
                //Not allowed to read from BIOS while executing outside of it:
                return 0;
            }
        }
        else {
            return this.dma.getCurrentFetchValue();
        }
    }
    GameBoyAdvanceMemory.prototype.readBIOS32CPU = function (address) {
        this.IOCore.updateCoreSingle();
        if (address < 0x4000) {
            //If reading from BIOS while executing it:
            address &= -4;
            var data = this.BIOS[address] | (this.BIOS[address + 1] << 8) | (this.BIOS[address + 2] << 16)  | (this.BIOS[address + 3] << 24);
            this.lastBIOSREAD = data;
            return data;
        }
        else {
            return this.cpu.getCurrentFetchValue();
        }
    }
}
GameBoyAdvanceMemory.prototype.readExternalWRAM8 = function (address) {
    address = address | 0;
    //External WRAM:
    this.wait.WRAMAccess();
    return this.externalRAM[address & 0x3FFFF] | 0;
}
if (__LITTLE_ENDIAN__) {
    GameBoyAdvanceMemory.prototype.readExternalWRAM16 = function (address) {
        address = address | 0;
        //External WRAM:
        this.wait.WRAMAccess();
        return this.externalRAM16[(address >> 1) & 0x1FFFF] | 0;
    }
    GameBoyAdvanceMemory.prototype.readExternalWRAM16CPU = function (address) {
        address = address | 0;
        //External WRAM:
        this.wait.WRAMAccess16CPU();
        return this.externalRAM16[(address >> 1) & 0x1FFFF] | 0;
    }
    GameBoyAdvanceMemory.prototype.readExternalWRAM32 = function (address) {
        address = address | 0;
        //External WRAM:
        this.wait.WRAMAccess32();
        return this.externalRAM32[(address >> 2) & 0xFFFF] | 0;
    }
    GameBoyAdvanceMemory.prototype.readExternalWRAM32CPU = function (address) {
        address = address | 0;
        //External WRAM:
        this.wait.WRAMAccess32CPU();
        return this.externalRAM32[(address >> 2) & 0xFFFF] | 0;
    }
}
else {
    GameBoyAdvanceMemory.prototype.readExternalWRAM16 = function (address) {
        //External WRAM:
        this.wait.WRAMAccess();
        address &= 0x3FFFE;
        return this.externalRAM[address] | (this.externalRAM[address + 1] << 8);
    }
    GameBoyAdvanceMemory.prototype.readExternalWRAM16CPU = function (address) {
        //External WRAM:
        this.wait.WRAMAccess16CPU();
        address &= 0x3FFFE;
        return this.externalRAM[address] | (this.externalRAM[address + 1] << 8);
    }
    GameBoyAdvanceMemory.prototype.readExternalWRAM32 = function (address) {
        //External WRAM:
        this.wait.WRAMAccess32();
        address &= 0x3FFFC;
        return this.externalRAM[address] | (this.externalRAM[address + 1] << 8) | (this.externalRAM[address + 2] << 16) | (this.externalRAM[address + 3] << 24);
    }
    GameBoyAdvanceMemory.prototype.readExternalWRAM32CPU = function (address) {
        //External WRAM:
        this.wait.WRAMAccess32CPU();
        address &= 0x3FFFC;
        return this.externalRAM[address] | (this.externalRAM[address + 1] << 8) | (this.externalRAM[address + 2] << 16) | (this.externalRAM[address + 3] << 24);
    }
}
GameBoyAdvanceMemory.prototype.readInternalWRAM8 = function (address) {
    address = address | 0;
    //Internal WRAM:
    this.wait.singleClock();
    return this.internalRAM[address & 0x7FFF] | 0;
}
if (__LITTLE_ENDIAN__) {
    GameBoyAdvanceMemory.prototype.readInternalWRAM16 = function (address) {
        address = address | 0;
        //Internal WRAM:
        this.wait.singleClock();
        return this.internalRAM16[(address >> 1) & 0x3FFF] | 0;
    }
    GameBoyAdvanceMemory.prototype.readInternalWRAM16CPU = function (address) {
        address = address | 0;
        //Internal WRAM:
        this.IOCore.updateCoreSingle();
        return this.internalRAM16[(address >> 1) & 0x3FFF] | 0;
    }
    GameBoyAdvanceMemory.prototype.readInternalWRAM32 = function (address) {
        address = address | 0;
        //Internal WRAM:
        this.wait.singleClock();
        return this.internalRAM32[(address >> 2) & 0x1FFF] | 0;
    }
    GameBoyAdvanceMemory.prototype.readInternalWRAM32CPU = function (address) {
        address = address | 0;
        //Internal WRAM:
        this.IOCore.updateCoreSingle();
        return this.internalRAM32[(address >> 2) & 0x1FFF] | 0;
    }
}
else {
    GameBoyAdvanceMemory.prototype.readInternalWRAM16 = function (address) {
        //Internal WRAM:
        this.wait.singleClock();
        address &= 0x7FFE;
        return this.internalRAM[address] | (this.internalRAM[address + 1] << 8);
    }
    GameBoyAdvanceMemory.prototype.readInternalWRAM16CPU = function (address) {
        //Internal WRAM:
        this.IOCore.updateCoreSingle();
        address &= 0x7FFE;
        return this.internalRAM[address] | (this.internalRAM[address + 1] << 8);
    }
    GameBoyAdvanceMemory.prototype.readInternalWRAM32 = function (address) {
        //Internal WRAM:
        this.wait.singleClock();
        address &= 0x7FFC;
        return this.internalRAM[address] | (this.internalRAM[address + 1] << 8) | (this.internalRAM[address + 2] << 16) | (this.internalRAM[address + 3] << 24);
    }
    GameBoyAdvanceMemory.prototype.readInternalWRAM32CPU = function (address) {
        //Internal WRAM:
        this.IOCore.updateCoreSingle();
        address &= 0x7FFC;
        return this.internalRAM[address] | (this.internalRAM[address + 1] << 8) | (this.internalRAM[address + 2] << 16) | (this.internalRAM[address + 3] << 24);
    }
}
GameBoyAdvanceMemory.prototype.readIODispatch8 = function (address) {
    address = address | 0;
    this.wait.singleClock();
    var data = 0;
    switch (address | 0) {
        //4000000h - DISPCNT - LCD Control (Read/Write)
        case 0x4000000:
            data = this.gfxRenderer.readDISPCNT8_0() | 0;
            break;
        //4000001h - DISPCNT - LCD Control (Read/Write)
        case 0x4000001:
            data = this.gfxRenderer.readDISPCNT8_1() | 0;
            break;
        //4000002h - Undocumented - Green Swap (R/W)
        case 0x4000002:
            data = this.gfxRenderer.readDISPCNT8_2() | 0;
            break;
        //4000004h - DISPSTAT - General LCD Status (Read/Write)
        case 0x4000004:
            data = this.gfxState.readDISPSTAT8_0() | 0;
            break;
        //4000005h - DISPSTAT - General LCD Status (Read/Write)
        case 0x4000005:
            data = this.gfxState.readDISPSTAT8_1() | 0;
            break;
        //4000006h - VCOUNT - Vertical Counter (Read only)
        case 0x4000006:
            data = this.gfxState.readDISPSTAT8_2() | 0;
            break;
        //4000008h - BG0CNT - BG0 Control (R/W) (BG Modes 0,1 only)
        case 0x4000008:
            data = this.gfxRenderer.readBG0CNT8_0() | 0;
            break;
        //4000009h - BG0CNT - BG0 Control (R/W) (BG Modes 0,1 only)
        case 0x4000009:
            data = this.gfxRenderer.readBG0CNT8_1() | 0;
            break;
        //400000Ah - BG1CNT - BG1 Control (R/W) (BG Modes 0,1 only)
        case 0x400000A:
            data = this.gfxRenderer.readBG1CNT8_0() | 0;
            break;
        //400000Bh - BG1CNT - BG1 Control (R/W) (BG Modes 0,1 only)
        case 0x400000B:
            data = this.gfxRenderer.readBG1CNT8_1() | 0;
            break;
        //400000Ch - BG2CNT - BG2 Control (R/W) (BG Modes 0,1,2 only)
        case 0x400000C:
            data = this.gfxRenderer.readBG2CNT8_0() | 0;
            break;
        //400000Dh - BG2CNT - BG2 Control (R/W) (BG Modes 0,1,2 only)
        case 0x400000D:
            data = this.gfxRenderer.readBG2CNT8_1() | 0;
            break;
        //400000Eh - BG3CNT - BG3 Control (R/W) (BG Modes 0,2 only)
        case 0x400000E:
            data = this.gfxRenderer.readBG3CNT8_0() | 0;
            break;
        //400000Fh - BG3CNT - BG3 Control (R/W) (BG Modes 0,2 only)
        case 0x400000F:
            data = this.gfxRenderer.readBG3CNT8_1() | 0;
            break;
        //4000010h through 4000047h - WRITE ONLY
        //4000048h - WININ - Control of Inside of Window(s) (R/W)
        case 0x4000048:
            data = this.gfxRenderer.readWIN0IN8() | 0;
            break;
        //4000049h - WININ - Control of Inside of Window(s) (R/W)
        case 0x4000049:
            data = this.gfxRenderer.readWIN1IN8() | 0;
            break;
        //400004Ah- WINOUT - Control of Outside of Windows & Inside of OBJ Window (R/W)
        case 0x400004A:
            data = this.gfxRenderer.readWINOUT8() | 0;
            break;
        //400004AB- WINOUT - Control of Outside of Windows & Inside of OBJ Window (R/W)
        case 0x400004B:
            data = this.gfxRenderer.readWINOBJIN8() | 0;
            break;
        //4000050h - BLDCNT - Color Special Effects Selection (R/W)
        case 0x4000050:
            data = this.gfxRenderer.readBLDCNT8_0() | 0;
            break;
        //4000051h - BLDCNT - Color Special Effects Selection (R/W)
        case 0x4000051:
            data = this.gfxRenderer.readBLDCNT8_1() | 0;
            break;
        //4000052h - BLDALPHA - Alpha Blending Coefficients (R/W)
        case 0x4000052:
            data = this.gfxRenderer.readBLDALPHA8_0() | 0;
            break;
        //4000053h - BLDALPHA - Alpha Blending Coefficients (R/W)
        case 0x4000053:
            data = this.gfxRenderer.readBLDALPHA8_1() | 0;
            break;
        //4000054h through 400005Fh - NOT USED - GLITCHED
        //4000060h - SOUND1CNT_L (NR10) - Channel 1 Sweep register (R/W)
        case 0x4000060:
            //NR10:
            data = this.sound.readSOUND1CNT8_0() | 0;
            break;
        //4000062h - SOUND1CNT_H (NR11, NR12) - Channel 1 Duty/Len/Envelope (R/W)
        case 0x4000062:
            //NR11:
            data = this.sound.readSOUND1CNT8_2() | 0;
            break;
        //4000063h - SOUND1CNT_H (NR11, NR12) - Channel 1 Duty/Len/Envelope (R/W)
        case 0x4000063:
            //NR12:
            data = this.sound.readSOUND1CNT8_3() | 0;
            break;
        //4000065h - SOUND1CNT_X (NR13, NR14) - Channel 1 Frequency/Control (R/W)
        case 0x4000065:
            //NR14:
            data = this.sound.readSOUND1CNTX8() | 0;
            break;
        //4000068h - SOUND2CNT_L (NR21, NR22) - Channel 2 Duty/Length/Envelope (R/W)
        case 0x4000068:
            //NR21:
            data = this.sound.readSOUND2CNTL8_0() | 0;
            break;
        //4000069h - SOUND2CNT_L (NR21, NR22) - Channel 2 Duty/Length/Envelope (R/W)
        case 0x4000069:
            //NR22:
            data = this.sound.readSOUND2CNTL8_1() | 0;
            break;
        //400006Dh - SOUND2CNT_H (NR23, NR24) - Channel 2 Frequency/Control (R/W)
        case 0x400006D:
            //NR24:
            data = this.sound.readSOUND2CNTH8() | 0;
            break;
        //4000070h - SOUND3CNT_L (NR30) - Channel 3 Stop/Wave RAM select (R/W)
        case 0x4000070:
            //NR30:
            data = this.sound.readSOUND3CNT8_0() | 0;
            break;
        //4000073h - SOUND3CNT_H (NR31, NR32) - Channel 3 Length/Volume (R/W)
        case 0x4000073:
            //NR32:
            data = this.sound.readSOUND3CNT8_3() | 0;
            break;
        //4000075h - SOUND3CNT_X (NR33, NR34) - Channel 3 Frequency/Control (R/W)
        case 0x4000075:
            //NR34:
            data = this.sound.readSOUND3CNTX8() | 0;
            break;
        //4000079h - SOUND4CNT_L (NR41, NR42) - Channel 4 Length/Envelope (R/W)
        case 0x4000079:
            //NR42:
           data = this.sound.readSOUND4CNTL8() | 0;
            break;
        //400007Ch - SOUND4CNT_H (NR43, NR44) - Channel 4 Frequency/Control (R/W)
        case 0x400007C:
            //NR43:
            data = this.sound.readSOUND4CNTH8_0() | 0;
            break;
        //400007Dh - SOUND4CNT_H (NR43, NR44) - Channel 4 Frequency/Control (R/W)
        case 0x400007D:
            //NR44:
            data = this.sound.readSOUND4CNTH8_1() | 0;
            break;
        //4000080h - SOUNDCNT_L (NR50, NR51) - Channel L/R Volume/Enable (R/W)
        case 0x4000080:
            //NR50:
            data = this.sound.readSOUNDCNTL8_0() | 0;
            break;
        //4000081h - SOUNDCNT_L (NR50, NR51) - Channel L/R Volume/Enable (R/W)
        case 0x4000081:
            //NR51:
            data = this.sound.readSOUNDCNTL8_1() | 0;
            break;
        //4000082h - SOUNDCNT_H (GBA only) - DMA Sound Control/Mixing (R/W)
        case 0x4000082:
            data = this.sound.readSOUNDCNTH8_0() | 0;
            break;
        //4000083h - SOUNDCNT_H (GBA only) - DMA Sound Control/Mixing (R/W)
        case 0x4000083:
            data = this.sound.readSOUNDCNTH8_1() | 0;
            break;
        //4000084h - SOUNDCNT_X (NR52) - Sound on/off (R/W)
        case 0x4000084:
            data = this.sound.readSOUNDCNTX8() | 0;
            break;
        //4000088h - SOUNDBIAS - Sound PWM Control (R/W, see below)
        case 0x4000088:
            data = this.sound.readSOUNDBIAS8_0() | 0;
            break;
        //4000089h - SOUNDBIAS - Sound PWM Control (R/W, see below)
        case 0x4000089:
            data = this.sound.readSOUNDBIAS8_1() | 0;
            break;
        //400008Ch - NOT USED - GLITCHED
        //400008Dh - NOT USED - GLITCHED
        //400008Eh - NOT USED - GLITCHED
        //400008Fh - NOT USED - GLITCHED
        //4000090h - WAVE_RAM0_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000090:
        //4000091h - WAVE_RAM0_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000091:
        //4000092h - WAVE_RAM0_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000092:
        //4000093h - WAVE_RAM0_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000093:
        //4000094h - WAVE_RAM1_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000094:
        //4000095h - WAVE_RAM1_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000095:
        //4000096h - WAVE_RAM1_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000096:
        //4000097h - WAVE_RAM1_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000097:
        //4000098h - WAVE_RAM2_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000098:
        //4000099h - WAVE_RAM2_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000099:
        //400009Ah - WAVE_RAM2_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009A:
        //400009Bh - WAVE_RAM2_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009B:
        //400009Ch - WAVE_RAM3_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009C:
        //400009Dh - WAVE_RAM3_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009D:
        //400009Eh - WAVE_RAM3_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009E:
        //400009Fh - WAVE_RAM3_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009F:
            data = this.sound.readWAVE8(address & 0xF) | 0;
            break;
        //40000A0h through 40000B9h - WRITE ONLY
        //40000BAh - DMA0CNT_H - DMA 0 Control (R/W)
        case 0x40000BA:
            data = this.dmaChannel0.readDMAControl8_0() | 0;
            break;
        //40000BBh - DMA0CNT_H - DMA 0 Control (R/W)
        case 0x40000BB:
            data = this.dmaChannel0.readDMAControl8_1() | 0;
            break;
        //40000BCh through 40000C5h - WRITE ONLY
        //40000C6h - DMA1CNT_H - DMA 1 Control (R/W)
        case 0x40000C6:
            data = this.dmaChannel1.readDMAControl8_0() | 0;
            break;
        //40000C7h - DMA1CNT_H - DMA 1 Control (R/W)
        case 0x40000C7:
            data = this.dmaChannel1.readDMAControl8_1() | 0;
            break;
        //40000C8h through 40000D1h - WRITE ONLY
        //40000D2h - DMA2CNT_H - DMA 2 Control (R/W)
        case 0x40000D2:
            data = this.dmaChannel2.readDMAControl8_0() | 0;
            break;
        //40000D3h - DMA2CNT_H - DMA 2 Control (R/W)
        case 0x40000D3:
            data = this.dmaChannel2.readDMAControl8_1() | 0;
            break;
        //40000D4h through 40000DDh - WRITE ONLY
        //40000DEh - DMA3CNT_H - DMA 3 Control (R/W)
        case 0x40000DE:
            data = this.dmaChannel3.readDMAControl8_0() | 0;
            break;
        //40000DFh - DMA3CNT_H - DMA 3 Control (R/W)
        case 0x40000DF:
            data = this.dmaChannel3.readDMAControl8_1() | 0;
            break;
        //40000E0h through 40000FFh - NOT USED - GLITCHED
        //4000100h - TM0CNT_L - Timer 0 Counter/Reload (R/W)
        case 0x4000100:
            data = this.timer.readTM0CNT8_0() | 0;
            break;
        //4000101h - TM0CNT_L - Timer 0 Counter/Reload (R/W)
        case 0x4000101:
            data = this.timer.readTM0CNT8_1() | 0;
            break;
        //4000102h - TM0CNT_H - Timer 0 Control (R/W)
        case 0x4000102:
            data = this.timer.readTM0CNT8_2() | 0;
            break;
        //4000104h - TM1CNT_L - Timer 1 Counter/Reload (R/W)
        case 0x4000104:
            data = this.timer.readTM1CNT8_0() | 0;
            break;
        //4000105h - TM1CNT_L - Timer 1 Counter/Reload (R/W)
        case 0x4000105:
            data = this.timer.readTM1CNT8_1() | 0;
            break;
        //4000106h - TM1CNT_H - Timer 1 Control (R/W)
        case 0x4000106:
            data = this.timer.readTM1CNT8_2() | 0;
            break;
        //4000108h - TM2CNT_L - Timer 2 Counter/Reload (R/W)
        case 0x4000108:
            data = this.timer.readTM2CNT8_0() | 0;
            break;
        //4000109h - TM2CNT_L - Timer 2 Counter/Reload (R/W)
        case 0x4000109:
            data = this.timer.readTM2CNT8_1() | 0;
            break;
        //400010Ah - TM2CNT_H - Timer 2 Control (R/W)
        case 0x400010A:
            data = this.timer.readTM2CNT8_2() | 0;
            break;
        //400010Ch - TM3CNT_L - Timer 3 Counter/Reload (R/W)
        case 0x400010C:
            data = this.timer.readTM3CNT8_0() | 0;
            break;
        //400010Dh - TM3CNT_L - Timer 3 Counter/Reload (R/W)
        case 0x400010D:
            data = this.timer.readTM3CNT8_1() | 0;
            break;
        //400010Eh - TM3CNT_H - Timer 3 Control (R/W)
        case 0x400010E:
            data = this.timer.readTM3CNT8_2() | 0;
            break;
        //4000110h through 400011Fh - NOT USED - GLITCHED
        //4000120h - Serial Data A (R/W)
        case 0x4000120:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_A0() | 0;
            break;
        //4000121h - Serial Data A (R/W)
        case 0x4000121:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_A1() | 0;
            break;
        //4000122h - Serial Data B (R/W)
        case 0x4000122:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_B0() | 0;
            break;
        //4000123h - Serial Data B (R/W)
        case 0x4000123:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_B1() | 0;
            break;
        //4000124h - Serial Data C (R/W)
        case 0x4000124:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_C0() | 0;
            break;
        //4000125h - Serial Data C (R/W)
        case 0x4000125:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_C1() | 0;
            break;
        //4000126h - Serial Data D (R/W)
        case 0x4000126:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_D0() | 0;
            break;
        //4000127h - Serial Data D (R/W)
        case 0x4000127:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_D1() | 0;
            break;
        //4000128h - SIOCNT - SIO Sub Mode Control (R/W)
        case 0x4000128:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIOCNT0() | 0;
            break;
        //4000129h - SIOCNT - SIO Sub Mode Control (R/W)
        case 0x4000129:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIOCNT1() | 0;
            break;
        //400012Ah - SIOMLT_SEND - Data Send Register (R/W)
        case 0x400012A:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA8_0() | 0;
            break;
        //400012Bh - SIOMLT_SEND - Data Send Register (R/W)
        case 0x400012B:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA8_1() | 0;
            break;
        //400012Ch through 400012Fh - NOT USED - GLITCHED
        //4000130h - KEYINPUT - Key Status (R)
        case 0x4000130:
            data = this.joypad.readKeyStatus8_0() | 0;
            break;
        //4000131h - KEYINPUT - Key Status (R)
        case 0x4000131:
            data = this.joypad.readKeyStatus8_1() | 0;
            break;
        //4000132h - KEYCNT - Key Interrupt Control (R/W)
        case 0x4000132:
            data = this.joypad.readKeyControl8_0() | 0;
            break;
        //4000133h - KEYCNT - Key Interrupt Control (R/W)
        case 0x4000133:
            data = this.joypad.readKeyControl8_1() | 0;
            break;
        //4000134h - RCNT (R/W) - Mode Selection
        case 0x4000134:
            this.IOCore.updateSerialClocking();
            data = this.serial.readRCNT0() | 0;
            break;
        //4000135h - RCNT (R/W) - Mode Selection
        case 0x4000135:
            this.IOCore.updateSerialClocking();
            data = this.serial.readRCNT1() | 0;
            break;
        //4000138h through 400013Fh - NOT USED - GLITCHED
        //4000140h - JOYCNT - JOY BUS Control Register (R/W)
        case 0x4000140:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYCNT() | 0;
            break;
        //4000144h through 400014Fh - NOT USED - GLITCHED
        //4000150h - JoyBus Receive (R/W)
        case 0x4000150:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_RECV0() | 0;
            break;
        //4000151h - JoyBus Receive (R/W)
        case 0x4000151:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_RECV1() | 0;
            break;
        //4000152h - JoyBus Receive (R/W)
        case 0x4000152:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_RECV2() | 0;
            break;
        //4000153h - JoyBus Receive (R/W)
        case 0x4000153:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_RECV3() | 0;
            break;
        //4000154h - JoyBus Send (R/W)
        case 0x4000154:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_SEND0() | 0;
            break;
        //4000155h - JoyBus Send (R/W)
        case 0x4000155:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_SEND1() | 0;
            break;
        //4000156h - JoyBus Send (R/W)
        case 0x4000156:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_SEND2() | 0;
            break;
        //4000157h - JoyBus Send (R/W)
        case 0x4000157:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_SEND3() | 0;
            break;
        //4000158h - JoyBus Stat (R/W)
        case 0x4000158:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_STAT() | 0;
            break;
        //400015Ch through 40001FFh - NOT USED - GLITCHED
        //4000200h - IE - Interrupt Enable Register (R/W)
        case 0x4000200:
            data = this.irq.readIE8_0() | 0;
            break;
        //4000201h - IE - Interrupt Enable Register (R/W)
        case 0x4000201:
            data = this.irq.readIE8_1() | 0;
            break;
        //4000202h - IF - Interrupt Request Flags / IRQ Acknowledge
        case 0x4000202:
            data = this.irq.readIF8_0() | 0;
            break;
        //4000203h - IF - Interrupt Request Flags / IRQ Acknowledge
        case 0x4000203:
            data = this.irq.readIF8_1() | 0;
            break;
        //4000204h - WAITCNT - Waitstate Control (R/W)
        case 0x4000204:
            data = this.wait.readWAITCNT8_0() | 0;
            break;
        //4000205h - WAITCNT - Waitstate Control (R/W)
        case 0x4000205:
            data = this.wait.readWAITCNT8_1() | 0;
            break;
        //4000208h - IME - Interrupt Master Enable Register (R/W)
        case 0x4000208:
            data = this.irq.readIME() | 0;
            break;
        //400020Ch through 40002FFh - NOT USED - GLITCHED
        //4000300h - POSTFLG - BYTE - Undocumented - Post Boot / Debug Control (R/W)
        case 0x4000300:
            data = this.wait.readPOSTBOOT() | 0;
            break;
        default:
            data = this.readIO8LessCalled(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readIO8LessCalled = function (address) {
    address = address | 0;
    var data = 0;
    switch (address | 0) {
            //4000003h - Undocumented - Green Swap (R/W)
        case 0x4000003:
            //4000007h - VCOUNT - Vertical Counter (Read only)
        case 0x4000007:
            //400004Ch - MOSAIC - Mosaic Size (W)
        case 0x400004C:
            //400004Dh - MOSAIC - Mosaic Size (W)
        case 0x400004D:
            //400004Eh - NOT USED - ZERO
        case 0x400004E:
            //400004Fh - NOT USED - ZERO
        case 0x400004F:
            //4000061h - NOT USED - ZERO
        case 0x4000061:
            //4000064h - SOUND1CNT_X (NR13, NR14) - Channel 1 Frequency/Control (R/W)
        case 0x4000064:
            //4000066h - NOT USED - ZERO
        case 0x4000066:
            //4000067h - NOT USED - ZERO
        case 0x4000067:
            //400006Ah - NOT USED - ZERO
        case 0x400006A:
            //400006Bh - NOT USED - ZERO
        case 0x400006B:
            //400006Ch - SOUND2CNT_H (NR23, NR24) - Channel 2 Frequency/Control (R/W)
        case 0x400006C:
            //400006Eh - NOT USED - ZERO
        case 0x400006E:
            //400006Fh - NOT USED - ZERO
        case 0x400006F:
            //4000071h - SOUND3CNT_L (NR30) - Channel 3 Stop/Wave RAM select (R/W)
        case 0x4000071:
            //4000072h - SOUND3CNT_H (NR31, NR32) - Channel 3 Length/Volume (R/W)
        case 0x4000072:
            //4000074h - SOUND3CNT_X (NR33, NR34) - Channel 3 Frequency/Control (R/W)
        case 0x4000074:
            //4000076h - NOT USED - ZERO
        case 0x4000076:
            //4000077h - NOT USED - ZERO
        case 0x4000077:
            //4000078h - SOUND4CNT_L (NR41, NR42) - Channel 4 Length/Envelope (R/W)
        case 0x4000078:
            //400007Ah - NOT USED - ZERO
        case 0x400007A:
            //400007Bh - NOT USED - ZERO
        case 0x400007B:
            //400007Eh - NOT USED - ZERO
        case 0x400007E:
            //400007Fh - NOT USED - ZERO
        case 0x400007F:
            //4000085h - NOT USED - ZERO
        case 0x4000085:
            //4000086h - NOT USED - ZERO
        case 0x4000086:
            //4000087h - NOT USED - ZERO
        case 0x4000087:
            //400008Ah - NOT USED - ZERO
        case 0x400008A:
            //400008Bh - NOT USED - ZERO
        case 0x400008B:
            //4000103h - TM0CNT_H - Timer 0 Control (R/W)
        case 0x4000103:
            //4000107h - TM1CNT_H - Timer 1 Control (R/W)
        case 0x4000107:
            //400010Bh - TM2CNT_H - Timer 2 Control (R/W)
        case 0x400010B:
            //400010Fh - TM3CNT_H - Timer 3 Control (R/W)
        case 0x400010F:
            //4000136h - NOT USED - ZERO
        case 0x4000136:
            //4000137h - NOT USED - ZERO
        case 0x4000137:
            //4000141h - JOYCNT - JOY BUS Control Register (R/W)
        case 0x4000141:
            //4000142h - NOT USED - ZERO
        case 0x4000142:
            //4000143h - NOT USED - ZERO
        case 0x4000143:
            //4000159h - JoyBus Stat (R/W)
        case 0x4000159:
            //400015Ah - NOT USED - ZERO
        case 0x400015A:
            //400015Bh - NOT USED - ZERO
        case 0x400015B:
            //4000206h - NOT USED - ZERO
        case 0x4000206:
            //4000207h - NOT USED - ZERO
        case 0x4000207:
            //4000209h - IME - Interrupt Master Enable Register (R/W)
        case 0x4000209:
            //400020Ah - NOT USED - ZERO
        case 0x400020A:
            //400020Bh - NOT USED - ZERO
        case 0x400020B:
            //4000301h - HALTCNT - BYTE - Undocumented - Low Power Mode Control (W)
        case 0x4000301:
            //4000302h - NOT USED - ZERO
        case 0x4000302:
            //4000303h - NOT USED - ZERO
        case 0x4000303:
            break;
        default:
            if ((address & 0xFFFC) == 0x800) {
                //WRAM wait state control:
                data = this.wait.readConfigureWRAM8(address | 0) | 0;
            }
            else {
                //Undefined Illegal I/O:
                data = this.readUnused8CPUBase(address | 0) | 0;
            }
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readIODispatch16 = function (address) {
    address = address | 0;
    var data = 0;
    this.wait.singleClock();
    var data = this.readIO16(address | 0) | 0;
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readIODispatch16CPU = function (address) {
    address = address | 0;
    this.IOCore.updateCoreSingle();
    var data = this.readIO16(address | 0) | 0;
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readIO16 = function (address) {
    address = address | 0;
    var data = 0;
    switch (address & -2) {
        //4000000h - DISPCNT - LCD Control (Read/Write)
        case 0x4000000:
            data = this.gfxRenderer.readDISPCNT16() | 0;
            break;
        //4000002h - Undocumented - Green Swap (R/W)
        case 0x4000002:
            data = this.gfxRenderer.readDISPCNT8_2() | 0;
            break;
        //4000004h - DISPSTAT - General LCD Status (Read/Write)
        case 0x4000004:
            data = this.gfxState.readDISPSTAT16_0() | 0;
            break;
        //4000006h - VCOUNT - Vertical Counter (Read only)
        case 0x4000006:
            data = this.gfxState.readDISPSTAT8_2() | 0;
            break;
        //4000008h - BG0CNT - BG0 Control (R/W) (BG Modes 0,1 only)
        case 0x4000008:
            data = this.gfxRenderer.readBG0CNT16() | 0;
            break;
        //400000Ah - BG1CNT - BG1 Control (R/W) (BG Modes 0,1 only)
        case 0x400000A:
            data = this.gfxRenderer.readBG1CNT16() | 0;
            break;
        //400000Ch - BG2CNT - BG2 Control (R/W) (BG Modes 0,1,2 only)
        case 0x400000C:
            data = this.gfxRenderer.readBG2CNT16() | 0;
            break;
        //400000Eh - BG3CNT - BG3 Control (R/W) (BG Modes 0,2 only)
        case 0x400000E:
            data = this.gfxRenderer.readBG3CNT16() | 0;
            break;
        //4000010h through 4000047h - WRITE ONLY
        //4000048h - WININ - Control of Inside of Window(s) (R/W)
        case 0x4000048:
            data = this.gfxRenderer.readWININ16() | 0;
            break;
        //400004Ah- WINOUT - Control of Outside of Windows & Inside of OBJ Window (R/W)
        case 0x400004A:
            data = this.gfxRenderer.readWINOUT16() | 0;
            break;
        //4000050h - BLDCNT - Color Special Effects Selection (R/W)
        case 0x4000050:
            data = this.gfxRenderer.readBLDCNT16() | 0;
            break;
        //4000052h - BLDALPHA - Alpha Blending Coefficients (R/W)
        case 0x4000052:
            data = this.gfxRenderer.readBLDALPHA16() | 0;
            break;
        //4000054h through 400005Fh - NOT USED - GLITCHED
        //4000060h - SOUND1CNT_L (NR10) - Channel 1 Sweep register (R/W)
        case 0x4000060:
            //NR10:
            data = this.sound.readSOUND1CNT8_0() | 0;
            break;
        //4000062h - SOUND1CNT_H (NR11, NR12) - Channel 1 Duty/Len/Envelope (R/W)
        case 0x4000062:
            //NR11:
            //NR12:
            data = this.sound.readSOUND1CNT8_2() | (this.sound.readSOUND1CNT8_3() << 8);
            break;
        //4000064h - SOUND1CNT_X (NR13, NR14) - Channel 1 Frequency/Control (R/W)
        case 0x4000064:
            //NR14:
            data = this.sound.readSOUND1CNTX16() | 0;
            break;
        //4000068h - SOUND2CNT_L (NR21, NR22) - Channel 2 Duty/Length/Envelope (R/W)
        case 0x4000068:
            //NR21:
            //NR22:
            data = this.sound.readSOUND2CNTL16() | 0;
            break;
        //400006Ch - SOUND2CNT_H (NR23, NR24) - Channel 2 Frequency/Control (R/W)
        case 0x400006C:
            //NR24:
            data = this.sound.readSOUND2CNTH16() | 0;
            break;
        //4000070h - SOUND3CNT_L (NR30) - Channel 3 Stop/Wave RAM select (R/W)
        case 0x4000070:
            //NR30:
            data = this.sound.readSOUND3CNT8_0() | 0;
            break;
        //4000073h - SOUND3CNT_H (NR31, NR32) - Channel 3 Length/Volume (R/W)
        case 0x4000072:
            //NR32:
            data = this.sound.readSOUND3CNT16_1() | 0;
            break;
        //4000074h - SOUND3CNT_X (NR33, NR34) - Channel 3 Frequency/Control (R/W)
        case 0x4000074:
            //NR34:
            data = this.sound.readSOUND3CNTX16() | 0;
            break;
        //4000078h - SOUND4CNT_L (NR41, NR42) - Channel 4 Length/Envelope (R/W)
        case 0x4000078:
            //NR42:
            data = this.sound.readSOUND4CNTL16() | 0;
            break;
        //400007Ch - SOUND4CNT_H (NR43, NR44) - Channel 4 Frequency/Control (R/W)
        case 0x400007C:
            //NR43:
            //NR44:
            data = this.sound.readSOUND4CNTH16() | 0;
            break;
        //4000080h - SOUNDCNT_L (NR50, NR51) - Channel L/R Volume/Enable (R/W)
        case 0x4000080:
            //NR50:
            //NR51:
            data = this.sound.readSOUNDCNTL16() | 0;
            break;
        //4000082h - SOUNDCNT_H (GBA only) - DMA Sound Control/Mixing (R/W)
        case 0x4000082:
            data = this.sound.readSOUNDCNTH16() | 0;
            break;
        //4000084h - SOUNDCNT_X (NR52) - Sound on/off (R/W)
        case 0x4000084:
            data = this.sound.readSOUNDCNTX8() | 0;
            break;
        //4000088h - SOUNDBIAS - Sound PWM Control (R/W, see below)
        case 0x4000088:
            data = this.sound.readSOUNDBIAS16() | 0;
            break;
        //400008Ch - NOT USED - GLITCHED
        //400008Eh - NOT USED - GLITCHED
        //4000090h - WAVE_RAM0_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000090:
        //4000092h - WAVE_RAM0_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000092:
        //4000094h - WAVE_RAM1_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000094:
        //4000096h - WAVE_RAM1_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000096:
        //4000098h - WAVE_RAM2_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000098:
        //400009Ah - WAVE_RAM2_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009A:
        //400009Ch - WAVE_RAM3_L - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009C:
        //400009Eh - WAVE_RAM3_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009E:
            data = this.sound.readWAVE16(address & 0xF) | 0;
            break;
        //40000A0h through 40000B9h - WRITE ONLY
        //40000BAh - DMA0CNT_H - DMA 0 Control (R/W)
        case 0x40000BA:
            data = this.dmaChannel0.readDMAControl16() | 0;
            break;
        //40000BCh through 40000C5h - WRITE ONLY
        //40000C6h - DMA1CNT_H - DMA 1 Control (R/W)
        case 0x40000C6:
            data = this.dmaChannel1.readDMAControl16() | 0;
            break;
        //40000C8h through 40000D1h - WRITE ONLY
        //40000D2h - DMA2CNT_H - DMA 2 Control (R/W)
        case 0x40000D2:
            data = this.dmaChannel2.readDMAControl16() | 0;
            break;
        //40000D4h through 40000DDh - WRITE ONLY
        //40000DEh - DMA3CNT_H - DMA 3 Control (R/W)
        case 0x40000DE:
            data = this.dmaChannel3.readDMAControl16() | 0;
            break;
        //40000E0h through 40000FFh - NOT USED - GLITCHED
        //4000100h - TM0CNT_L - Timer 0 Counter/Reload (R/W)
        case 0x4000100:
            data = this.timer.readTM0CNT16() | 0;
            break;
        //4000102h - TM0CNT_H - Timer 0 Control (R/W)
        case 0x4000102:
            data = this.timer.readTM0CNT8_2() | 0;
            break;
        //4000104h - TM1CNT_L - Timer 1 Counter/Reload (R/W)
        case 0x4000104:
            data = this.timer.readTM1CNT16() | 0;
            break;
        //4000106h - TM1CNT_H - Timer 1 Control (R/W)
        case 0x4000106:
            data = this.timer.readTM1CNT8_2() | 0;
            break;
        //4000108h - TM2CNT_L - Timer 2 Counter/Reload (R/W)
        case 0x4000108:
            data = this.timer.readTM2CNT16() | 0;
            break;
        //400010Ah - TM2CNT_H - Timer 2 Control (R/W)
        case 0x400010A:
            data = this.timer.readTM2CNT8_2() | 0;
            break;
        //400010Ch - TM3CNT_L - Timer 3 Counter/Reload (R/W)
        case 0x400010C:
            data = this.timer.readTM3CNT16() | 0;
            break;
        //400010Eh - TM3CNT_H - Timer 3 Control (R/W)
        case 0x400010E:
            data = this.timer.readTM3CNT8_2() | 0;
            break;
        //4000110h through 400011Fh - NOT USED - GLITCHED
        //4000120h - Serial Data A (R/W)
        case 0x4000120:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_A0() | (this.serial.readSIODATA_A1() << 8);
            break;
        //4000122h - Serial Data B (R/W)
        case 0x4000122:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_B0() | (this.serial.readSIODATA_B1() << 8);
            break;
        //4000124h - Serial Data C (R/W)
        case 0x4000124:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_C0() | (this.serial.readSIODATA_C1() << 8);
            break;
        //4000126h - Serial Data D (R/W)
        case 0x4000126:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_D0() | (this.serial.readSIODATA_D1() << 8);
            break;
        //4000128h - SIOCNT - SIO Sub Mode Control (R/W)
        case 0x4000128:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIOCNT0() | (this.serial.readSIOCNT1() << 8);
            break;
        //400012Ah - SIOMLT_SEND - Data Send Register (R/W)
        case 0x400012A:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA8_0() | (this.serial.readSIODATA8_1() << 8);
            break;
        //400012Ch through 400012Fh - NOT USED - GLITCHED
        //4000130h - KEYINPUT - Key Status (R)
        case 0x4000130:
            data = this.joypad.readKeyStatus16() | 0;
            break;
        //4000132h - KEYCNT - Key Interrupt Control (R/W)
        case 0x4000132:
            data = this.joypad.readKeyControl16() | 0;
            break;
        //4000134h - RCNT (R/W) - Mode Selection
        case 0x4000134:
            this.IOCore.updateSerialClocking();
            data = this.serial.readRCNT0() | (this.serial.readRCNT1() << 8);
            break;
        //4000138h through 400013Fh - NOT USED - GLITCHED
        //4000140h - JOYCNT - JOY BUS Control Register (R/W)
        case 0x4000140:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYCNT() | 0;
            break;
        //4000144h through 400014Fh - NOT USED - GLITCHED
        //4000150h - JoyBus Receive (R/W)
        case 0x4000150:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_RECV0() | (this.serial.readJOYBUS_RECV1() << 8);
            break;
        //4000152h - JoyBus Receive (R/W)
        case 0x4000152:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_RECV2() | (this.serial.readJOYBUS_RECV3() << 8);
            break;
        //4000154h - JoyBus Send (R/W)
        case 0x4000154:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_SEND0() | (this.serial.readJOYBUS_SEND1() << 8);
            break;
        //4000156h - JoyBus Send (R/W)
        case 0x4000156:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_SEND2() | (this.serial.readJOYBUS_SEND3() << 8);
            break;
        //4000158h - JoyBus Stat (R/W)
        case 0x4000158:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_STAT() | 0;
            break;
        //400015Ch through 40001FFh - NOT USED - GLITCHED
        //4000200h - IE - Interrupt Enable Register (R/W)
        case 0x4000200:
            data = this.irq.readIE16() | 0;
            break;
        //4000202h - IF - Interrupt Request Flags / IRQ Acknowledge
        case 0x4000202:
            data = this.irq.readIF16() | 0;
            break;
        //4000204h - WAITCNT - Waitstate Control (R/W)
        case 0x4000204:
            data = this.wait.readWAITCNT16() | 0;
            break;
        //4000208h - IME - Interrupt Master Enable Register (R/W)
        case 0x4000208:
            data = this.irq.readIME() | 0;
            break;
        //400020Ch through 40002FFh - NOT USED - GLITCHED
        //4000300h - POSTFLG - BYTE - Undocumented - Post Boot / Debug Control (R/W)
        case 0x4000300:
            data = this.wait.readPOSTBOOT() | 0;
            break;
        default:
            data = this.readIO16LessCalled(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readIO16LessCalled = function (address) {
    address = address | 0;
    var data = 0;
    switch (address & -2) {
        //400004Ch - MOSAIC - Mosaic Size (W)
        case 0x400004C:
        //400004Eh - NOT USED - ZERO
        case 0x400004E:
        //4000066h - NOT USED - ZERO
        case 0x4000066:
        //400006Ah - NOT USED - ZERO
        case 0x400006A:
        //400006Eh - NOT USED - ZERO
        case 0x400006E:
        //4000076h - NOT USED - ZERO
        case 0x4000076:
        //400007Ah - NOT USED - ZERO
        case 0x400007A:
        //400007Eh - NOT USED - ZERO
        case 0x400007E:
        //4000086h - NOT USED - ZERO
        case 0x4000086:
        //400008Ah - NOT USED - ZERO
        case 0x400008A:
        //4000136h - NOT USED - ZERO
        case 0x4000136:
        //4000142h - NOT USED - ZERO
        case 0x4000142:
        //400015Ah - NOT USED - ZERO
        case 0x400015A:
        //4000206h - NOT USED - ZERO
        case 0x4000206:
        //400020Ah - NOT USED - ZERO
        case 0x400020A:
        //4000302h - NOT USED - ZERO
        case 0x4000302:
            break;
        default:
            if ((address & 0xFFFC) == 0x800) {
                //WRAM wait state control:
                data = this.wait.readConfigureWRAM16(address | 0) | 0;
            }
            else {
                //Undefined Illegal I/O:
                data = this.readUnused16MultiBase(address | 0) | 0;
            }
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readIODispatch32 = function (address) {
    address = address | 0;
    this.wait.singleClock();
    var data = this.readIO32(address | 0) | 0;
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readIODispatch32CPU = function (address) {
    address = address | 0;
    this.IOCore.updateCoreSingle();
    var data = this.readIO32(address | 0) | 0;
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readIO32 = function (address) {
    address = address | 0;
    var data = 0;
    switch (address & -4) {
        //4000000h - DISPCNT - LCD Control (Read/Write)
        //4000002h - Undocumented - Green Swap (R/W)
        case 0x4000000:
            data = this.gfxRenderer.readDISPCNT32() | 0;
            break;
        //4000004h - DISPSTAT - General LCD Status (Read/Write)
        //4000006h - VCOUNT - Vertical Counter (Read only)
        case 0x4000004:
            data = this.gfxState.readDISPSTAT32() | 0;
            break;
        //4000008h - BG0CNT - BG0 Control (R/W) (BG Modes 0,1 only)
        //400000Ah - BG1CNT - BG1 Control (R/W) (BG Modes 0,1 only)
        case 0x4000008:
            data = this.gfxRenderer.readBG0BG1CNT32() | 0;
            break;
        //400000Ch - BG2CNT - BG2 Control (R/W) (BG Modes 0,1,2 only)
        //400000Eh - BG3CNT - BG3 Control (R/W) (BG Modes 0,2 only)
        case 0x400000C:
            data = this.gfxRenderer.readBG2BG3CNT32() | 0;
            break;
        //4000010h through 4000047h - WRITE ONLY
        //4000048h - WININ - Control of Inside of Window(s) (R/W)
        //400004Ah- WINOUT - Control of Outside of Windows & Inside of OBJ Window (R/W)
        case 0x4000048:
            data = this.gfxRenderer.readWINCONTROL32() | 0;
            break;
        //400004Ch - MOSAIC - Mosaic Size (W)
        //4000050h - BLDCNT - Color Special Effects Selection (R/W)
        //4000052h - BLDALPHA - Alpha Blending Coefficients (R/W)
        case 0x4000050:
            data = this.gfxRenderer.readBLDCNT32() | 0;
            break;
        //4000054h through 400005Fh - NOT USED - GLITCHED
        //4000060h - SOUND1CNT_L (NR10) - Channel 1 Sweep register (R/W)
        //4000062h - SOUND1CNT_H (NR11, NR12) - Channel 1 Duty/Len/Envelope (R/W)
        case 0x4000060:
            //NR10:
            //NR11:
            //NR12:
            data = this.sound.readSOUND1CNT32() | 0;
            break;
        //4000064h - SOUND1CNT_X (NR13, NR14) - Channel 1 Frequency/Control (R/W)
        //4000066h - NOT USED - ZERO
        case 0x4000064:
            //NR14:
            data = this.sound.readSOUND1CNTX16() | 0;
            break;
        //4000068h - SOUND2CNT_L (NR21, NR22) - Channel 2 Duty/Length/Envelope (R/W)
        //400006Ah - NOT USED - ZERO
        case 0x4000068:
            //NR21:
            //NR22:
            data = this.sound.readSOUND2CNTL16() | 0;
            break;
        //400006Ch - SOUND2CNT_H (NR23, NR24) - Channel 2 Frequency/Control (R/W)
        //400006Eh - NOT USED - ZERO
        case 0x400006C:
            //NR24:
            data = this.sound.readSOUND2CNTH16() | 0;
            break;
        //4000070h - SOUND3CNT_L (NR30) - Channel 3 Stop/Wave RAM select (R/W)
        //4000073h - SOUND3CNT_H (NR31, NR32) - Channel 3 Length/Volume (R/W)
        case 0x4000070:
            //NR30:
            //NR32:
            data = this.sound.readSOUND3CNT32() | 0;
            break;
        //4000074h - SOUND3CNT_X (NR33, NR34) - Channel 3 Frequency/Control (R/W)
        //4000076h - NOT USED - ZERO
        case 0x4000074:
            //NR34:
            data = this.sound.readSOUND3CNTX16() | 0;
            break;
        //4000078h - SOUND4CNT_L (NR41, NR42) - Channel 4 Length/Envelope (R/W)
        //400007Ah - NOT USED - ZERO
        case 0x4000078:
            //NR42:
            data = this.sound.readSOUND4CNTL16() | 0;
            break;
        //400007Ch - SOUND4CNT_H (NR43, NR44) - Channel 4 Frequency/Control (R/W)
        //400007Eh - NOT USED - ZERO
        case 0x400007C:
            //NR43:
            //NR44:
            data = this.sound.readSOUND4CNTH16() | 0;
            break;
        //4000080h - SOUNDCNT_L (NR50, NR51) - Channel L/R Volume/Enable (R/W)
        //4000082h - SOUNDCNT_H (GBA only) - DMA Sound Control/Mixing (R/W)
        case 0x4000080:
            //NR50:
            //NR51:
            data = this.sound.readSOUNDCNT32() | 0;
            break;
        //4000084h - SOUNDCNT_X (NR52) - Sound on/off (R/W)
        //4000086h - NOT USED - ZERO
        case 0x4000084:
            data = this.sound.readSOUNDCNTX8() | 0;
            break;
        //4000088h - SOUNDBIAS - Sound PWM Control (R/W, see below)
        //400008Ah - NOT USED - ZERO
        case 0x4000088:
            data = this.sound.readSOUNDBIAS16() | 0;
            break;
        //400008Ch - NOT USED - GLITCHED
        //400008Eh - NOT USED - GLITCHED
        //4000090h - WAVE_RAM0_L - Channel 3 Wave Pattern RAM (W/R)
        //4000092h - WAVE_RAM0_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000090:
        //4000094h - WAVE_RAM1_L - Channel 3 Wave Pattern RAM (W/R)
        //4000096h - WAVE_RAM1_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000094:
        //4000098h - WAVE_RAM2_L - Channel 3 Wave Pattern RAM (W/R)
        //400009Ah - WAVE_RAM2_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x4000098:
        //400009Ch - WAVE_RAM3_L - Channel 3 Wave Pattern RAM (W/R)
        //400009Eh - WAVE_RAM3_H - Channel 3 Wave Pattern RAM (W/R)
        case 0x400009C:
            data = this.sound.readWAVE32(address & 0xF) | 0;
            break;
        //40000A0h through 40000B9h - WRITE ONLY
        //40000BAh - DMA0CNT_H - DMA 0 Control (R/W)
        case 0x40000B8:
            data = this.dmaChannel0.readDMAControl16() << 16;
            break;
        //40000BCh through 40000C5h - WRITE ONLY
        //40000C6h - DMA1CNT_H - DMA 1 Control (R/W)
        case 0x40000C4:
            data = this.dmaChannel1.readDMAControl16() << 16;
            break;
        //40000C8h through 40000D1h - WRITE ONLY
        //40000D2h - DMA2CNT_H - DMA 2 Control (R/W)
        case 0x40000D0:
            data = this.dmaChannel2.readDMAControl16() << 16;
            break;
        //40000D4h through 40000DDh - WRITE ONLY
        //40000DEh - DMA3CNT_H - DMA 3 Control (R/W)
        case 0x40000DC:
            data = this.dmaChannel3.readDMAControl16() << 16;
            break;
        //40000E0h through 40000FFh - NOT USED - GLITCHED
        //4000100h - TM0CNT_L - Timer 0 Counter/Reload (R/W)
        //4000102h - TM0CNT_H - Timer 0 Control (R/W)
        case 0x4000100:
            data = this.timer.readTM0CNT32() | 0;
            break;
        //4000104h - TM1CNT_L - Timer 1 Counter/Reload (R/W)
        //4000106h - TM1CNT_H - Timer 1 Control (R/W)
        case 0x4000104:
            data = this.timer.readTM1CNT32() | 0;
            break;
        //4000108h - TM2CNT_L - Timer 2 Counter/Reload (R/W)
        //400010Ah - TM2CNT_H - Timer 2 Control (R/W)
        case 0x4000108:
            data = this.timer.readTM2CNT32() | 0;
            break;
        //400010Ch - TM3CNT_L - Timer 3 Counter/Reload (R/W)
        //400010Eh - TM3CNT_H - Timer 3 Control (R/W)
        case 0x400010C:
            data = this.timer.readTM3CNT32() | 0;
            break;
        //4000110h through 400011Fh - NOT USED - GLITCHED
        //4000120h - Serial Data A (R/W)
        //4000122h - Serial Data B (R/W)
        case 0x4000110:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_A0() |
            (this.serial.readSIODATA_A1() << 8) |
            (this.serial.readSIODATA_B0() << 16) |
            (this.serial.readSIODATA_B1() << 24);
            break;
        //4000124h - Serial Data C (R/W)
        //4000126h - Serial Data D (R/W)
        case 0x4000124:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIODATA_C0() |
            (this.serial.readSIODATA_C1() << 8) |
            (this.serial.readSIODATA_D0() << 16) |
            (this.serial.readSIODATA_D1() << 24);
            break;
        //4000128h - SIOCNT - SIO Sub Mode Control (R/W)
        //400012Ah - SIOMLT_SEND - Data Send Register (R/W)
        case 0x4000128:
            this.IOCore.updateSerialClocking();
            data = this.serial.readSIOCNT0() |
            (this.serial.readSIOCNT1() << 8) |
            (this.serial.readSIODATA8_0() << 16) |
            (this.serial.readSIODATA8_1() << 24);
            break;
        //400012Ch through 400012Fh - NOT USED - GLITCHED
        //4000130h - KEYINPUT - Key Status (R)
        //4000132h - KEYCNT - Key Interrupt Control (R/W)
        case 0x4000130:
            data = this.joypad.readKeyStatusControl32() | 0;
            break;
        //4000134h - RCNT (R/W) - Mode Selection
        //4000136h - NOT USED - ZERO
        case 0x4000134:
            this.IOCore.updateSerialClocking();
            data = this.serial.readRCNT0() | (this.serial.readRCNT1() << 8);
            break;
        //4000138h through 400013Fh - NOT USED - GLITCHED
        //4000140h - JOYCNT - JOY BUS Control Register (R/W)
        //4000142h - NOT USED - ZERO
        case 0x4000138:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYCNT() | 0;
            break;
        //4000144h through 400014Fh - NOT USED - GLITCHED
        //4000150h - JoyBus Receive (R/W)
        //4000152h - JoyBus Receive (R/W)
        case 0x4000144:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_RECV0() |
            (this.serial.readJOYBUS_RECV1() << 8) |
            (this.serial.readJOYBUS_RECV2() << 16) |
            (this.serial.readJOYBUS_RECV3() << 24);
            break;
        //4000154h - JoyBus Send (R/W)
        //4000156h - JoyBus Send (R/W)
        case 0x4000154:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_SEND0() |
            (this.serial.readJOYBUS_SEND1() << 8) |
            (this.serial.readJOYBUS_SEND2() << 16) |
            (this.serial.readJOYBUS_SEND3() << 24);
            break;
        //4000158h - JoyBus Stat (R/W)
        //400015Ah - NOT USED - ZERO
        case 0x4000158:
            this.IOCore.updateSerialClocking();
            data = this.serial.readJOYBUS_STAT() | 0;
            break;
        //400015Ch through 40001FFh - NOT USED - GLITCHED
        //4000200h - IE - Interrupt Enable Register (R/W)
        //4000202h - IF - Interrupt Request Flags / IRQ Acknowledge
        case 0x4000200:
            data = this.irq.readIRQ32() | 0;
            break;
        //4000204h - WAITCNT - Waitstate Control (R/W)
        //4000206h - NOT USED - ZERO
        case 0x4000204:
            data = this.wait.readWAITCNT16() | 0;
            break;
        //4000208h - IME - Interrupt Master Enable Register (R/W)
        //400020Ah - NOT USED - ZERO
        case 0x4000208:
            data = this.irq.readIME() | 0;
            break;
        //400020Ch through 40002FFh - NOT USED - GLITCHED
        //4000300h - POSTFLG - BYTE - Undocumented - Post Boot / Debug Control (R/W)
        //4000302h - NOT USED - ZERO
        case 0x4000300:
            data = this.wait.readPOSTBOOT() | 0;
            break;
        //UNDEFINED / ILLEGAL:
        default:
            if ((address & 0xFFFC) == 0x800) {
                //WRAM wait state control:
                data = this.wait.readConfigureWRAM32() | 0;
            }
            else {
                //Undefined Illegal I/O:
                data = this.readUnused32MultiBase() | 0;
            }
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readVRAM8Preliminary = function (address) {
    address = address | 0;
    this.IOCore.updateGraphicsClocking();
    var data = 0;
    switch (address >> 24) {
        case 0x5:
            this.wait.VRAMAccess();
            data = this.gfxRenderer.readPalette8(address | 0) | 0;
            break;
        case 0x6:
            this.wait.VRAMAccess();
            data = this.gfxRenderer.readVRAM8(address | 0) | 0;
            break;
        default:
            this.wait.OAMAccess();
            data = this.gfxRenderer.readOAM(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readVRAM16Preliminary = function (address) {
    address = address | 0;
    this.IOCore.updateGraphicsClocking();
    var data = 0;
    switch (address >> 24) {
        case 0x5:
            this.wait.VRAMAccess();
            data = this.gfxRenderer.readPalette16(address | 0) | 0;
            break;
        case 0x6:
            this.wait.VRAMAccess();
            data = this.gfxRenderer.readVRAM16(address | 0) | 0;
            break;
        default:
            this.wait.OAMAccess();
            data = this.gfxRenderer.readOAM16(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readVRAM16CPUPreliminary = function (address) {
    address = address | 0;
    this.IOCore.updateGraphicsClocking();
    var data = 0;
    switch (address >> 24) {
        case 0x5:
            this.wait.VRAMAccess16CPU();
            data = this.gfxRenderer.readPalette16(address | 0) | 0;
            break;
        case 0x6:
            this.wait.VRAMAccess16CPU();
            data = this.gfxRenderer.readVRAM16(address | 0) | 0;
            break;
        default:
            this.wait.OAMAccessCPU();
            data = this.gfxRenderer.readOAM16(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readVRAM32Preliminary = function (address) {
    address = address | 0;
    this.IOCore.updateGraphicsClocking();
    var data = 0;
    switch (address >> 24) {
        case 0x5:
            this.wait.VRAMAccess32();
            data = this.gfxRenderer.readPalette32(address | 0) | 0;
            break;
        case 0x6:
            this.wait.VRAMAccess32();
            data = this.gfxRenderer.readVRAM32(address | 0) | 0;
            break;
        default:
            this.wait.OAMAccess();
            data = this.gfxRenderer.readOAM32(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readVRAM32CPUPreliminary = function (address) {
    address = address | 0;
    this.IOCore.updateGraphicsClocking();
    var data = 0;
    switch (address >> 24) {
        case 0x5:
            this.wait.VRAMAccess32CPU();
            data = this.gfxRenderer.readPalette32(address | 0) | 0;
            break;
        case 0x6:
            this.wait.VRAMAccess32CPU();
            data = this.gfxRenderer.readVRAM32(address | 0) | 0;
            break;
        default:
            this.wait.OAMAccessCPU();
            data = this.gfxRenderer.readOAM32(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceMemory.prototype.readROM8 = function (address) {
    address = address | 0;
    this.wait.ROMAccess(address | 0);
    return this.cartridge.readROM8(address & 0x1FFFFFF) | 0;
}
GameBoyAdvanceMemory.prototype.readROM16 = function (address) {
    address = address | 0;
    this.wait.ROMAccess(address | 0);
    return this.cartridge.readROM16(address & 0x1FFFFFE) | 0;
}
GameBoyAdvanceMemory.prototype.readROM16CPU = function (address) {
    address = address | 0;
    this.wait.ROMAccess16CPU(address | 0);
    return this.cartridge.readROM16(address & 0x1FFFFFE) | 0;
}
GameBoyAdvanceMemory.prototype.readROM32 = function (address) {
    address = address | 0;
    this.wait.ROMAccess32(address | 0);
    return this.cartridge.readROM32(address & 0x1FFFFFC) | 0;
}
GameBoyAdvanceMemory.prototype.readROM32CPU = function (address) {
    address = address | 0;
    this.wait.ROMAccess32CPU(address | 0);
    return this.cartridge.readROM32(address & 0x1FFFFFC) | 0;
}
GameBoyAdvanceMemory.prototype.readROM28 = function (address) {
    address = address | 0;
    this.wait.ROMAccess(address | 0);
    return this.cartridge.readROM8Space2(address & 0x1FFFFFF) | 0;
}
GameBoyAdvanceMemory.prototype.readROM216 = function (address) {
    address = address | 0;
    this.wait.ROMAccess(address | 0);
    return this.cartridge.readROM16Space2(address & 0x1FFFFFE) | 0;
}
GameBoyAdvanceMemory.prototype.readROM216CPU = function (address) {
    address = address | 0;
    this.wait.ROMAccess16CPU(address | 0);
    return this.cartridge.readROM16Space2(address & 0x1FFFFFE) | 0;
}
GameBoyAdvanceMemory.prototype.readROM232 = function (address) {
    address = address | 0;
    this.wait.ROMAccess32(address | 0);
    return this.cartridge.readROM32Space2(address & 0x1FFFFFC) | 0;
}
GameBoyAdvanceMemory.prototype.readROM232CPU = function (address) {
    address = address | 0;
    this.wait.ROMAccess32CPU(address | 0);
    return this.cartridge.readROM32Space2(address & 0x1FFFFFC) | 0;
}
GameBoyAdvanceMemory.prototype.readSRAM8 = function (address) {
    address = address | 0;
    this.wait.SRAMAccess();
    return this.saves.readSRAM(address & 0xFFFF) | 0;
}
if (typeof Math.imul == "function") {
    //Math.imul found, insert the optimized path in:
    GameBoyAdvanceMemory.prototype.readSRAM16 = function (address) {
        address = address | 0;
        this.wait.SRAMAccess();
        return Math.imul(this.saves.readSRAM(address & 0xFFFE) | 0, 0x101) | 0;
    }
    GameBoyAdvanceMemory.prototype.readSRAM16CPU = function (address) {
        address = address | 0;
        this.wait.SRAMAccessCPU();
        return Math.imul(this.saves.readSRAM(address & 0xFFFE) | 0, 0x101) | 0;
    }
    GameBoyAdvanceMemory.prototype.readSRAM32 = function (address) {
        address = address | 0;
        this.wait.SRAMAccess();
        return Math.imul(this.saves.readSRAM(address & 0xFFFC) | 0, 0x1010101) | 0;
    }
    GameBoyAdvanceMemory.prototype.readSRAM32CPU = function (address) {
        address = address | 0;
        this.wait.SRAMAccessCPU();
        return Math.imul(this.saves.readSRAM(address & 0xFFFC) | 0, 0x1010101) | 0;
    }
}
else {
    //Math.imul not found, use the compatibility method:
    GameBoyAdvanceMemory.prototype.readSRAM16 = function (address) {
        address = address | 0;
        this.wait.SRAMAccess();
        return ((this.saves.readSRAM(address & 0xFFFE) | 0) * 0x101) | 0;
    }
    GameBoyAdvanceMemory.prototype.readSRAM16CPU = function (address) {
        address = address | 0;
        this.wait.SRAMAccessCPU();
        return ((this.saves.readSRAM(address & 0xFFFE) | 0) * 0x101) | 0;
    }
    GameBoyAdvanceMemory.prototype.readSRAM32 = function (address) {
        address = address | 0;
        this.wait.SRAMAccess();
        return ((this.saves.readSRAM(address & 0xFFFC) | 0) * 0x1010101) | 0;
    }
    GameBoyAdvanceMemory.prototype.readSRAM32CPU = function (address) {
        address = address | 0;
        this.wait.SRAMAccessCPU();
        return ((this.saves.readSRAM(address & 0xFFFC) | 0) * 0x1010101) | 0;
    }
}
GameBoyAdvanceMemory.prototype.readUnused8 = function (address) {
    address = address | 0;
    this.wait.singleClock();
    return this.readUnused8CPUBase(address | 0) | 0;
}
GameBoyAdvanceMemory.prototype.readUnused8CPUBase = function (address) {
    address = address | 0;
    return (this.cpu.getCurrentFetchValue() >> ((address & 0x3) << 3)) & 0xFF;
}
GameBoyAdvanceMemory.prototype.readUnused16 = function (address) {
    address = address | 0;
    this.wait.singleClock();
    return this.readUnused16CPUBase(address | 0) | 0;
}
GameBoyAdvanceMemory.prototype.readUnused16CPU = function (address) {
    address = address | 0;
    this.IOCore.updateCoreSingle();
    return this.readUnused16CPUBase(address | 0) | 0;
}
GameBoyAdvanceMemory.prototype.readUnused16CPUBase = function (address) {
    address = address | 0;
    return (this.cpu.getCurrentFetchValue() >> ((address & 0x2) << 3)) & 0xFFFF;
}
GameBoyAdvanceMemory.prototype.readUnused16DMA = function (address) {
    address = address | 0;
    this.wait.singleClock();
    return this.readUnused16DMABase(address | 0) | 0;
}
GameBoyAdvanceMemory.prototype.readUnused16DMABase = function (address) {
    address = address | 0;
    return (this.dma.getCurrentFetchValue() >> ((address & 0x2) << 3)) & 0xFFFF;
}
GameBoyAdvanceMemory.prototype.readUnused16MultiBase = function (address) {
    address = address | 0;
    return (this.readUnused32MultiBase() >> ((address & 0x2) << 3)) & 0xFFFF;
}
GameBoyAdvanceMemory.prototype.readUnused32 = function () {
    this.wait.singleClock();
    return this.cpu.getCurrentFetchValue() | 0;
}
GameBoyAdvanceMemory.prototype.readUnused32CPU = function () {
    this.IOCore.updateCoreSingle();
    return this.cpu.getCurrentFetchValue() | 0;
}
GameBoyAdvanceMemory.prototype.readUnused32DMA = function () {
    this.wait.singleClock();
    return this.dma.getCurrentFetchValue() | 0;
}
GameBoyAdvanceMemory.prototype.readUnused32MultiBase = function () {
    return this.IOCore.getCurrentFetchValue() | 0;
}
GameBoyAdvanceMemory.prototype.loadBIOS = function () {
    var allowInit = 1;
    //Ensure BIOS is of correct length:
    if ((this.IOCore.BIOS.length | 0) == 0x4000) {
        //this.IOCore.BIOSFound = true;
        for (var index = 0; (index | 0) < 0x4000; index = ((index | 0) + 1) | 0) {
            this.BIOS[index & 0x3FFF] = this.IOCore.BIOS[index & 0x3FFF] & 0xFF;
        }
    }
    else {
        //this.IOCore.BIOSFound = false;
        this.IOCore.SKIPBoot = true;
        //Kill init, rather than allow HLE for now:
        allowInit = 0;
    }
    return allowInit | 0;
}
function generateMemoryTopLevelDispatch() {
    //Generic memory read dispatch generator:
    function compileMemoryReadDispatch(readUnused, readExternalWRAM, readInternalWRAM,
                                       readIODispatch, readVRAM, readROM, readROM2, readSRAM, readBIOS) {
        var code = "address = address | 0;var data = 0;switch (address >> 24) {";
        /*
         Decoder for the nibble at bits 24-27
         (Top 4 bits of the address falls through to default (unused),
         so the next nibble down is used for dispatch.):
         */
        /*
         BIOS Area (00000000-00003FFF)
         Unused (00004000-01FFFFFF)
         */
        code += "case 0:{data = this." + readBIOS + "(address | 0) | 0;break};";
        /*
         Unused (00004000-01FFFFFF)
         */
        /*
         WRAM - On-board Work RAM (02000000-0203FFFF)
         Unused (02040000-02FFFFFF)
         */
        if (readExternalWRAM.slice(0, 10) != "readUnused") {
            code += "case 0x2:";
            if (readExternalWRAM.slice(0, 12) != "readInternal") {
                code += "{data = this." + readExternalWRAM + "(address | 0) | 0;break};";
            }
        }
        /*
         WRAM - In-Chip Work RAM (03000000-03007FFF)
         Unused (03008000-03FFFFFF)
         */
        if (readInternalWRAM.slice(0, 10) != "readUnused") {
            code += "case 0x3:{data = this." + readInternalWRAM + "(address | 0) | 0;break};";
        }
        /*
         I/O Registers (04000000-040003FE)
         Unused (04000400-04FFFFFF)
         */
        code += "case 0x4:{data = this." + readIODispatch + "(address | 0) | 0;break};";
        /*
         BG/OBJ Palette RAM (05000000-050003FF)
         Unused (05000400-05FFFFFF)
         */
        code += "case 0x5:";
        /*
         VRAM - Video RAM (06000000-06017FFF)
         Unused (06018000-06FFFFFF)
         */
        code += "case 0x6:";
        /*
         OAM - OBJ Attributes (07000000-070003FF)
         Unused (07000400-07FFFFFF)
         */
        code += "case 0x7:{data = this." + readVRAM + "(address | 0) | 0;break};";
        /*
         Game Pak ROM (max 16MB) - Wait State 0 (08000000-08FFFFFF)
         */
        code += "case 0x8:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 0 (09000000-09FFFFFF)
         */
        code += "case 0x9:";
        /*
         Game Pak ROM (max 16MB) - Wait State 1 (0A000000-0AFFFFFF)
         */
        code += "case 0xA:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 1 (0B000000-0BFFFFFF)
         */
        code += "case 0xB:{data = this." + readROM + "(address | 0) | 0;break};";
        /*
         Game Pak ROM (max 16MB) - Wait State 2 (0C000000-0CFFFFFF)
         */
        code += "case 0xC:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 2 (0D000000-0DFFFFFF)
         */
        code += "case 0xD:{data = this." + readROM2 + "(address | 0) | 0;break};";
        /*
         Game Pak SRAM  (max 64 KBytes) - 8bit Bus width (0E000000-0E00FFFF)
         */
        code += "case 0xE:";
        /*
         Game Pak SRAM  (max 64 KBytes) - 8bit Bus width (0E000000-0E00FFFF)
         Mirrored up to 0FFFFFFF
         */
        code += "case 0xF:{data = this." + readSRAM + "(address | 0) | 0;break};";
        /*
         Unused (10000000-FFFFFFFF)
         */
        code += "default:{data = this." + readUnused + "(" + ((readUnused.slice(0, 12) == "readUnused32") ? "" : "address | 0") + ") | 0};";
        //Generate the function:
        code += "}return data | 0;";
        return Function("address", code);
    }
    //Optimized for DMA 0:
    function compileMemoryDMA0ReadDispatch(readUnused, readExternalWRAM, readInternalWRAM,
                                       readIODispatch, readVRAM, readBIOS) {
        var code = "address = address | 0;var data = 0;switch (address >> 24) {";
        /*
         Decoder for the nibble at bits 24-27
         (Top 4 bits of the address falls through to default (unused),
         so the next nibble down is used for dispatch.):
         */
        /*
         BIOS Area (00000000-00003FFF)
         Unused (00004000-01FFFFFF)
         */
        code += "case 0:{data = this." + readBIOS + "(address | 0) | 0;break};";
        /*
         Unused (00004000-01FFFFFF)
         */
        /*
         WRAM - On-board Work RAM (02000000-0203FFFF)
         Unused (02040000-02FFFFFF)
         */
        if (readExternalWRAM.slice(0, 10) != "readUnused") {
            code += "case 0x2:";
            if (readExternalWRAM.slice(0, 12) != "readInternal") {
                code += "{data = this." + readExternalWRAM + "(address | 0) | 0;break};";
            }
        }
        /*
         WRAM - In-Chip Work RAM (03000000-03007FFF)
         Unused (03008000-03FFFFFF)
         */
        if (readInternalWRAM.slice(0, 10) != "readUnused") {
            code += "case 0x3:{data = this." + readInternalWRAM + "(address | 0) | 0;break};";
        }
        /*
         I/O Registers (04000000-040003FE)
         Unused (04000400-04FFFFFF)
         */
        code += "case 0x4:{data = this." + readIODispatch + "(address | 0) | 0;break};";
        /*
         BG/OBJ Palette RAM (05000000-050003FF)
         Unused (05000400-05FFFFFF)
         */
        code += "case 0x5:";
        /*
         VRAM - Video RAM (06000000-06017FFF)
         Unused (06018000-06FFFFFF)
         */
        code += "case 0x6:";
        /*
         OAM - OBJ Attributes (07000000-070003FF)
         Unused (07000400-07FFFFFF)
         */
        code += "case 0x7:{data = this." + readVRAM + "(address | 0) | 0;break};";
        /*
         Unused, DMA 0 cannot read past 07FFFFFF:
         */
        code += "default:{data = this." + readUnused + "(" + ((readUnused.slice(0, 12) == "readUnused32") ? "" : "address | 0") + ") | 0};";
        //Generate the function:
        code += "}return data | 0;";
        return Function("address", code);
    }
    //Optimized for DMA 1-3:
    function compileMemoryDMAReadDispatch(readUnused, readExternalWRAM, readInternalWRAM,
                                       readIODispatch, readVRAM, readROM, readROM2, readBIOS) {
        var code = "address = address | 0;var data = 0;switch (address >> 24) {";
        /*
         Decoder for the nibble at bits 24-27
         (Top 4 bits of the address falls through to default (unused),
         so the next nibble down is used for dispatch.):
         */
        /*
         BIOS Area (00000000-00003FFF)
         Unused (00004000-01FFFFFF)
         */
        code += "case 0:{data = this." + readBIOS + "(address | 0) | 0;break};";
        /*
         Unused (00004000-01FFFFFF)
         */
        /*
         WRAM - On-board Work RAM (02000000-0203FFFF)
         Unused (02040000-02FFFFFF)
         */
        if (readExternalWRAM.slice(0, 10) != "readUnused") {
            code += "case 0x2:";
            if (readExternalWRAM.slice(0, 12) != "readInternal") {
                code += "{data = this." + readExternalWRAM + "(address | 0) | 0;break};";
            }
        }
        /*
         WRAM - In-Chip Work RAM (03000000-03007FFF)
         Unused (03008000-03FFFFFF)
         */
        if (readInternalWRAM.slice(0, 10) != "readUnused") {
            code += "case 0x3:{data = this." + readInternalWRAM + "(address | 0) | 0;break};";
        }
        /*
         I/O Registers (04000000-040003FE)
         Unused (04000400-04FFFFFF)
         */
        code += "case 0x4:{data = this." + readIODispatch + "(address | 0) | 0;break};";
        /*
         BG/OBJ Palette RAM (05000000-050003FF)
         Unused (05000400-05FFFFFF)
         */
        code += "case 0x5:";
        /*
         VRAM - Video RAM (06000000-06017FFF)
         Unused (06018000-06FFFFFF)
         */
        code += "case 0x6:";
        /*
         OAM - OBJ Attributes (07000000-070003FF)
         Unused (07000400-07FFFFFF)
         */
        code += "case 0x7:{data = this." + readVRAM + "(address | 0) | 0;break};";
        /*
         Game Pak ROM (max 16MB) - Wait State 0 (08000000-08FFFFFF)
         */
        code += "case 0x8:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 0 (09000000-09FFFFFF)
         */
        code += "case 0x9:";
        /*
         Game Pak ROM (max 16MB) - Wait State 1 (0A000000-0AFFFFFF)
         */
        code += "case 0xA:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 1 (0B000000-0BFFFFFF)
         */
        code += "case 0xB:{data = this." + readROM + "(address | 0) | 0;break};";
        /*
         Game Pak ROM (max 16MB) - Wait State 2 (0C000000-0CFFFFFF)
         */
        code += "case 0xC:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 2 (0D000000-0DFFFFFF)
         */
        code += "case 0xD:{data = this." + readROM2 + "(address | 0) | 0;break};";
        /*
         Unused, DMA 1-3 cannot read past 0DFFFFFF:
         */
        code += "default:{data = this." + readUnused + "(" + ((readUnused.slice(0, 12) == "readUnused32") ? "" : "address | 0") + ") | 0};";
        //Generate the function:
        code += "}return data | 0;";
        return Function("address", code);
    }
    //Graphics should not be handled as often for this one:
    function compileMemoryWriteDispatch(writeUnused, writeExternalWRAM, writeInternalWRAM,
                                        writeIODispatch, writeVRAM, writeROM, writeSRAM) {
        var code = "address = address | 0;data = data | 0;switch (address >> 24) {";
        /*
         Decoder for the nibble at bits 24-27
         (Top 4 bits of the address falls through to default (unused),
         so the next nibble down is used for dispatch.):
         */
        /*
         BIOS Area (00000000-00003FFF)
         Unused (00004000-01FFFFFF)
         */
        /*
         Unused (00004000-01FFFFFF)
         */
        /*
         WRAM - On-board Work RAM (02000000-0203FFFF)
         Unused (02040000-02FFFFFF)
         */
        if (writeExternalWRAM != "writeUnused") {
            code += "case 0x2:";
            if (writeExternalWRAM.slice(0, 13) != "writeInternal") {
                code += "{this." + writeExternalWRAM + "(address | 0, data | 0);break};";
            }
        }
        /*
         WRAM - In-Chip Work RAM (03000000-03007FFF)
         Unused (03008000-03FFFFFF)
         */
        if (writeInternalWRAM != "writeUnused") {
            code += "case 0x3:{this." + writeInternalWRAM + "(address | 0, data | 0);break};";
        }
        /*
         I/O Registers (04000000-040003FE)
         Unused (04000400-04FFFFFF)
         */
        code += "case 0x4:{this." + writeIODispatch + "(address | 0, data | 0);break};";
        /*
         BG/OBJ Palette RAM (05000000-050003FF)
         Unused (05000400-05FFFFFF)
         */
        code += "case 0x5:";
        /*
         VRAM - Video RAM (06000000-06017FFF)
         Unused (06018000-06FFFFFF)
         */
        code += "case 0x6:";
        /*
         OAM - OBJ Attributes (07000000-070003FF)
         Unused (07000400-07FFFFFF)
         */
        code += "case 0x7:{this." + writeVRAM + "(address | 0, data | 0);break};";
        /*
         Game Pak ROM (max 16MB) - Wait State 0 (08000000-08FFFFFF)
         */
        code += "case 0x8:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 0 (09000000-09FFFFFF)
         */
        code += "case 0x9:";
        /*
         Game Pak ROM (max 16MB) - Wait State 1 (0A000000-0AFFFFFF)
         */
        code += "case 0xA:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 1 (0B000000-0BFFFFFF)
         */
        code += "case 0xB:";
        /*
         Game Pak ROM (max 16MB) - Wait State 2 (0C000000-0CFFFFFF)
         */
        code += "case 0xC:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 2 (0D000000-0DFFFFFF)
         */
        code += "case 0xD:{this." + writeROM + "(address | 0, data | 0);break};";
        /*
         Game Pak SRAM  (max 64 KBytes) - 8bit Bus width (0E000000-0E00FFFF)
         */
        code += "case 0xE:";
        /*
         Game Pak SRAM  (max 64 KBytes) - 8bit Bus width (0E000000-0E00FFFF)
         Mirrored up to 0FFFFFFF
         */
        code += "case 0xF:{this." + writeSRAM + "(address | 0, data | 0);break};";
        /*
         Unused (10000000-FFFFFFFF)
         */
        code += "default:{this." + writeUnused + "()}";
        //Generate the function:
        code += "}";
        return Function("address", "data", code);
    }
    //Graphics calls slightly faster in this one, at the expense of other calls:
    function compileMemoryWriteDispatch2(writeUnused, writeExternalWRAM, writeInternalWRAM,
                                        writeIODispatch, writePalette, writeVRAM, writeOAM, writeROM, writeSRAM) {
        var code = "address = address | 0;data = data | 0;switch (address >> 24) {";
        /*
         Decoder for the nibble at bits 24-27
         (Top 4 bits of the address falls through to default (unused),
         so the next nibble down is used for dispatch.):
         */
        /*
         BIOS Area (00000000-00003FFF)
         Unused (00004000-01FFFFFF)
         */
        /*
         Unused (00004000-01FFFFFF)
         */
        /*
         WRAM - On-board Work RAM (02000000-0203FFFF)
         Unused (02040000-02FFFFFF)
         */
        if (writeExternalWRAM != "writeUnused") {
            code += "case 0x2:";
            if (writeExternalWRAM.slice(0, 13) != "writeInternal") {
                code += "{this." + writeExternalWRAM + "(address | 0, data | 0);break};";
            }
        }
        /*
         WRAM - In-Chip Work RAM (03000000-03007FFF)
         Unused (03008000-03FFFFFF)
         */
        if (writeInternalWRAM != "writeUnused") {
            code += "case 0x3:{this." + writeInternalWRAM + "(address | 0, data | 0);break};";
        }
        /*
         I/O Registers (04000000-040003FE)
         Unused (04000400-04FFFFFF)
         */
        code += "case 0x4:{this." + writeIODispatch + "(address | 0, data | 0);break};";
        /*
         BG/OBJ Palette RAM (05000000-050003FF)
         Unused (05000400-05FFFFFF)
         */
        code += "case 0x5:{this." + writePalette + "(address | 0, data | 0);break};";
        /*
         VRAM - Video RAM (06000000-06017FFF)
         Unused (06018000-06FFFFFF)
         */
        code += "case 0x6:{this." + writeVRAM + "(address | 0, data | 0);break};";
        /*
         OAM - OBJ Attributes (07000000-070003FF)
         Unused (07000400-07FFFFFF)
         */
        code += "case 0x7:{this." + writeOAM + "(address | 0, data | 0);break};";
        /*
         Game Pak ROM (max 16MB) - Wait State 0 (08000000-08FFFFFF)
         */
        code += "case 0x8:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 0 (09000000-09FFFFFF)
         */
        code += "case 0x9:";
        /*
         Game Pak ROM (max 16MB) - Wait State 1 (0A000000-0AFFFFFF)
         */
        code += "case 0xA:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 1 (0B000000-0BFFFFFF)
         */
        code += "case 0xB:";
        /*
         Game Pak ROM (max 16MB) - Wait State 2 (0C000000-0CFFFFFF)
         */
        code += "case 0xC:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 2 (0D000000-0DFFFFFF)
         */
        code += "case 0xD:{this." + writeROM + "(address | 0, data | 0);break};";
        /*
         Game Pak SRAM  (max 64 KBytes) - 8bit Bus width (0E000000-0E00FFFF)
         */
        code += "case 0xE:";
        /*
         Game Pak SRAM  (max 64 KBytes) - 8bit Bus width (0E000000-0E00FFFF)
         Mirrored up to 0FFFFFFF
         */
        code += "case 0xF:{this." + writeSRAM + "(address | 0, data | 0);break};";
        /*
         Unused (10000000-FFFFFFFF)
         */
        code += "default:{this." + writeUnused + "()}";
        //Generate the function:
        code += "}";
        return Function("address", "data", code);
    }
    //Optimized for DMA 0-2:
    function compileMemoryDMAWriteDispatch(writeUnused, writeExternalWRAM, writeInternalWRAM,
                                        writeIODispatch, writePalette, writeVRAM, writeOAM) {
        var code = "address = address | 0;data = data | 0;switch (address >> 24) {";
        /*
         Decoder for the nibble at bits 24-27
         (Top 4 bits of the address falls through to default (unused),
         so the next nibble down is used for dispatch.):
         */
        /*
         BIOS Area (00000000-00003FFF)
         Unused (00004000-01FFFFFF)
         */
        /*
         Unused (00004000-01FFFFFF)
         */
        /*
         WRAM - On-board Work RAM (02000000-0203FFFF)
         Unused (02040000-02FFFFFF)
         */
        if (writeExternalWRAM != "writeUnused") {
            code += "case 0x2:";
            if (writeExternalWRAM.slice(0, 13) != "writeInternal") {
                code += "{this." + writeExternalWRAM + "(address | 0, data | 0);break};";
            }
        }
        /*
         WRAM - In-Chip Work RAM (03000000-03007FFF)
         Unused (03008000-03FFFFFF)
         */
        if (writeInternalWRAM != "writeUnused") {
            code += "case 0x3:{this." + writeInternalWRAM + "(address | 0, data | 0);break};";
        }
        /*
         I/O Registers (04000000-040003FE)
         Unused (04000400-04FFFFFF)
         */
        code += "case 0x4:{this." + writeIODispatch + "(address | 0, data | 0);break};";
        /*
         BG/OBJ Palette RAM (05000000-050003FF)
         Unused (05000400-05FFFFFF)
         */
        code += "case 0x5:{this." + writePalette + "(address | 0, data | 0);break};";
        /*
         VRAM - Video RAM (06000000-06017FFF)
         Unused (06018000-06FFFFFF)
         */
        code += "case 0x6:{this." + writeVRAM + "(address | 0, data | 0);break};";
        /*
         OAM - OBJ Attributes (07000000-070003FF)
         Unused (07000400-07FFFFFF)
         */
        code += "case 0x7:{this." + writeOAM + "(address | 0, data | 0);break};";
        /*
         Unused, DMA 0-2 cannot write past 07FFFFFF:
         */
        code += "default:{this." + writeUnused + "()}";
        //Generate the function:
        code += "}";
        return Function("address", "data", code);
    }
    //Optimized for DMA 3:
    function compileMemoryDMA3WriteDispatch(writeUnused, writeExternalWRAM, writeInternalWRAM,
                                         writeIODispatch, writePalette, writeVRAM, writeOAM, writeROM) {
        var code = "address = address | 0;data = data | 0;switch (address >> 24) {";
        /*
         Decoder for the nibble at bits 24-27
         (Top 4 bits of the address falls through to default (unused),
         so the next nibble down is used for dispatch.):
         */
        /*
         BIOS Area (00000000-00003FFF)
         Unused (00004000-01FFFFFF)
         */
        /*
         Unused (00004000-01FFFFFF)
         */
        /*
         WRAM - On-board Work RAM (02000000-0203FFFF)
         Unused (02040000-02FFFFFF)
         */
        if (writeExternalWRAM != "writeUnused") {
            code += "case 0x2:";
            if (writeExternalWRAM.slice(0, 13) != "writeInternal") {
                code += "{this." + writeExternalWRAM + "(address | 0, data | 0);break};";
            }
        }
        /*
         WRAM - In-Chip Work RAM (03000000-03007FFF)
         Unused (03008000-03FFFFFF)
         */
        if (writeInternalWRAM != "writeUnused") {
            code += "case 0x3:{this." + writeInternalWRAM + "(address | 0, data | 0);break};";
        }
        /*
         I/O Registers (04000000-040003FE)
         Unused (04000400-04FFFFFF)
         */
        code += "case 0x4:{this." + writeIODispatch + "(address | 0, data | 0);break};";
        /*
         BG/OBJ Palette RAM (05000000-050003FF)
         Unused (05000400-05FFFFFF)
         */
        code += "case 0x5:{this." + writePalette + "(address | 0, data | 0);break};";
        /*
         VRAM - Video RAM (06000000-06017FFF)
         Unused (06018000-06FFFFFF)
         */
        code += "case 0x6:{this." + writeVRAM + "(address | 0, data | 0);break};";
        /*
         OAM - OBJ Attributes (07000000-070003FF)
         Unused (07000400-07FFFFFF)
         */
        code += "case 0x7:{this." + writeOAM + "(address | 0, data | 0);break};";
        /*
         Game Pak ROM (max 16MB) - Wait State 0 (08000000-08FFFFFF)
         */
        code += "case 0x8:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 0 (09000000-09FFFFFF)
         */
        code += "case 0x9:";
        /*
         Game Pak ROM (max 16MB) - Wait State 1 (0A000000-0AFFFFFF)
         */
        code += "case 0xA:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 1 (0B000000-0BFFFFFF)
         */
        code += "case 0xB:";
        /*
         Game Pak ROM (max 16MB) - Wait State 2 (0C000000-0CFFFFFF)
         */
        code += "case 0xC:";
        /*
         Game Pak ROM/FlashROM (max 16MB) - Wait State 2 (0D000000-0DFFFFFF)
         */
        code += "case 0xD:{this." + writeROM + "(address | 0, data | 0);break};";
        /*
         Unused, DMA 3 cannot write past 0DFFFFFF:
         */
        code += "default:{this." + writeUnused + "()}";
        //Generate the function:
        code += "}";
        return Function("address", "data", code);
    }
    //Generic 8-Bit Read Dispatch:
    GameBoyAdvanceMemory.prototype.memoryRead8Generated = [
                                                             compileMemoryReadDispatch(
                                                                                        "readUnused8",
                                                                                        "readInternalWRAM8",
                                                                                        "readInternalWRAM8",
                                                                                        "readIODispatch8",
                                                                                        "readVRAM8Preliminary",
                                                                                        "readROM8",
                                                                                        "readROM28",
                                                                                        "readSRAM8",
                                                                                        "readBIOS8"
                                                                                        ),
                                                             compileMemoryReadDispatch(
                                                                                        "readUnused8",
                                                                                        "readExternalWRAM8",
                                                                                        "readInternalWRAM8",
                                                                                        "readIODispatch8",
                                                                                        "readVRAM8Preliminary",
                                                                                        "readROM8",
                                                                                        "readROM28",
                                                                                        "readSRAM8",
                                                                                        "readBIOS8"
                                                                                        ),
                                                             compileMemoryReadDispatch(
                                                                                        "readUnused8",
                                                                                        "readUnused8",
                                                                                        "readUnused8",
                                                                                        "readIODispatch8",
                                                                                        "readVRAM8Preliminary",
                                                                                        "readROM8",
                                                                                        "readROM28",
                                                                                        "readSRAM8",
                                                                                        "readBIOS8"
                                                                                        )
                                                             ];
    //Generic 8-Bit Write Dispatch:
    GameBoyAdvanceMemory.prototype.memoryWrite8Generated = [
                                                             compileMemoryWriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeInternalWRAM8",
                                                                                         "writeInternalWRAM8",
                                                                                         "writeIODispatch8",
                                                                                         "writeVRAM8Preliminary",
                                                                                         "writeROM8",
                                                                                         "writeSRAM8"
                                                                                         ),
                                                             compileMemoryWriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeExternalWRAM8",
                                                                                         "writeInternalWRAM8",
                                                                                         "writeIODispatch8",
                                                                                         "writeVRAM8Preliminary",
                                                                                         "writeROM8",
                                                                                         "writeSRAM8"
                                                                                         ),
                                                             compileMemoryWriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeUnused",
                                                                                         "writeUnused",
                                                                                         "writeIODispatch8",
                                                                                         "writeVRAM8Preliminary",
                                                                                         "writeROM8",
                                                                                         "writeSRAM8"
                                                                                         )
                                                             ];
    //Generic 16-Bit Read Dispatch:
    GameBoyAdvanceMemory.prototype.memoryRead16Generated = [
                                                              compileMemoryReadDispatch(
                                                                                         "readUnused16",
                                                                                         "readInternalWRAM16",
                                                                                         "readInternalWRAM16",
                                                                                         "readIODispatch16",
                                                                                         "readVRAM16Preliminary",
                                                                                         "readROM16",
                                                                                         "readROM216",
                                                                                         "readSRAM16",
                                                                                         "readBIOS16"
                                                                                         ),
                                                              compileMemoryReadDispatch(
                                                                                         "readUnused16",
                                                                                         "readExternalWRAM16",
                                                                                         "readInternalWRAM16",
                                                                                         "readIODispatch16",
                                                                                         "readVRAM16Preliminary",
                                                                                         "readROM16",
                                                                                         "readROM216",
                                                                                         "readSRAM16",
                                                                                         "readBIOS16"
                                                                                         ),
                                                              compileMemoryReadDispatch(
                                                                                         "readUnused16",
                                                                                         "readUnused16",
                                                                                         "readUnused16",
                                                                                         "readIODispatch16",
                                                                                         "readVRAM16Preliminary",
                                                                                         "readROM16",
                                                                                         "readROM216",
                                                                                         "readSRAM16",
                                                                                         "readBIOS16"
                                                                                         )
                                                              ];
    //DMA 0 Optimized 16-Bit Read Dispatch:
    GameBoyAdvanceMemory.prototype.memoryReadDMA16Generated = [
                                                            compileMemoryDMA0ReadDispatch(
                                                                                      "readUnused16DMA",
                                                                                      "readInternalWRAM16",
                                                                                      "readInternalWRAM16",
                                                                                      "readIODispatch16",
                                                                                      "readVRAM16Preliminary",
                                                                                      "readBIOS16DMA"
                                                                                      ),
                                                            compileMemoryDMA0ReadDispatch(
                                                                                      "readUnused16DMA",
                                                                                      "readExternalWRAM16",
                                                                                      "readInternalWRAM16",
                                                                                      "readIODispatch16",
                                                                                      "readVRAM16Preliminary",
                                                                                      "readBIOS16DMA"
                                                                                      ),
                                                            compileMemoryDMA0ReadDispatch(
                                                                                      "readUnused16DMA",
                                                                                      "readUnused16DMA",
                                                                                      "readUnused16DMA",
                                                                                      "readIODispatch16",
                                                                                      "readVRAM16Preliminary",
                                                                                      "readBIOS16DMA"
                                                                                      )
                                                            ];
    //DMA 1-3 Optimized 16-Bit Read Dispatch:
    GameBoyAdvanceMemory.prototype.memoryReadDMA16FullGenerated = [
                                                            compileMemoryDMAReadDispatch(
                                                                                      "readUnused16DMA",
                                                                                      "readInternalWRAM16",
                                                                                      "readInternalWRAM16",
                                                                                      "readIODispatch16",
                                                                                      "readVRAM16Preliminary",
                                                                                      "readROM16",
                                                                                      "readROM216",
                                                                                      "readBIOS16DMA"
                                                                                      ),
                                                            compileMemoryDMAReadDispatch(
                                                                                      "readUnused16DMA",
                                                                                      "readExternalWRAM16",
                                                                                      "readInternalWRAM16",
                                                                                      "readIODispatch16",
                                                                                      "readVRAM16Preliminary",
                                                                                      "readROM16",
                                                                                      "readROM216",
                                                                                      "readBIOS16DMA"
                                                                                      ),
                                                            compileMemoryDMAReadDispatch(
                                                                                      "readUnused16DMA",
                                                                                      "readUnused16DMA",
                                                                                      "readUnused16DMA",
                                                                                      "readIODispatch16",
                                                                                      "readVRAM16Preliminary",
                                                                                      "readROM16",
                                                                                      "readROM216",
                                                                                      "readBIOS16DMA"
                                                                                      )
                                                            ];
    //Generic 16-Bit Instruction Read Dispatch:
    GameBoyAdvanceMemory.prototype.memoryReadCPU16Generated = [
                                                                 compileMemoryReadDispatch(
                                                                                            "readUnused16CPU",
                                                                                            "readInternalWRAM16CPU",
                                                                                            "readInternalWRAM16CPU",
                                                                                            "readIODispatch16CPU",
                                                                                            "readVRAM16CPUPreliminary",
                                                                                            "readROM16CPU",
                                                                                            "readROM216CPU",
                                                                                            "readSRAM16CPU",
                                                                                            "readBIOS16CPU"
                                                                                            ),
                                                                 compileMemoryReadDispatch(
                                                                                            "readUnused16CPU",
                                                                                            "readExternalWRAM16CPU",
                                                                                            "readInternalWRAM16CPU",
                                                                                            "readIODispatch16CPU",
                                                                                            "readVRAM16CPUPreliminary",
                                                                                            "readROM16CPU",
                                                                                            "readROM216CPU",
                                                                                            "readSRAM16CPU",
                                                                                            "readBIOS16CPU"
                                                                                            ),
                                                                 compileMemoryReadDispatch(
                                                                                            "readUnused16CPU",
                                                                                            "readUnused16CPU",
                                                                                            "readUnused16CPU",
                                                                                            "readIODispatch16CPU",
                                                                                            "readVRAM16CPUPreliminary",
                                                                                            "readROM16CPU",
                                                                                            "readROM216CPU",
                                                                                            "readSRAM16CPU",
                                                                                            "readBIOS16CPU"
                                                                                            )
                                                                 ];
    //Generic 16-Bit Write Dispatch:
    GameBoyAdvanceMemory.prototype.memoryWrite16Generated = [
                                                              compileMemoryWriteDispatch2(
                                                                                          "writeUnused",
                                                                                          "writeInternalWRAM16",
                                                                                          "writeInternalWRAM16",
                                                                                          "writeIODispatch16",
                                                                                          "writePalette16",
                                                                                          "writeVRAM16",
                                                                                          "writeOBJ16",
                                                                                          "writeROM16",
                                                                                          "writeSRAM16"
                                                                                          ),
                                                              compileMemoryWriteDispatch2(
                                                                                          "writeUnused",
                                                                                          "writeExternalWRAM16",
                                                                                          "writeInternalWRAM16",
                                                                                          "writeIODispatch16",
                                                                                          "writePalette16",
                                                                                          "writeVRAM16",
                                                                                          "writeOBJ16",
                                                                                          "writeROM16",
                                                                                          "writeSRAM16"
                                                                                          ),
                                                              compileMemoryWriteDispatch2(
                                                                                          "writeUnused",
                                                                                          "writeUnused",
                                                                                          "writeUnused",
                                                                                          "writeIODispatch16",
                                                                                          "writePalette16",
                                                                                          "writeVRAM16",
                                                                                          "writeOBJ16",
                                                                                          "writeROM16",
                                                                                          "writeSRAM16"
                                                                                          )
                                                              ];
    //DMA 0-2 Optimized 16-Bit Write Dispatch:
    GameBoyAdvanceMemory.prototype.memoryWriteDMA16Generated = [
                                                             compileMemoryDMAWriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeInternalWRAM16",
                                                                                         "writeInternalWRAM16",
                                                                                         "writeIODispatch16",
                                                                                         "writePalette16",
                                                                                         "writeVRAM16",
                                                                                         "writeOBJ16"
                                                                                         ),
                                                             compileMemoryDMAWriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeExternalWRAM16",
                                                                                         "writeInternalWRAM16",
                                                                                         "writeIODispatch16",
                                                                                         "writePalette16",
                                                                                         "writeVRAM16",
                                                                                         "writeOBJ16"
                                                                                         ),
                                                             compileMemoryDMAWriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeUnused",
                                                                                         "writeUnused",
                                                                                         "writeIODispatch16",
                                                                                         "writePalette16",
                                                                                         "writeVRAM16",
                                                                                         "writeOBJ16"
                                                                                         )
                                                             ];
    //DMA 3 Optimized 16-Bit Write Dispatch:
    GameBoyAdvanceMemory.prototype.memoryWriteDMA16FullGenerated = [
                                                                    compileMemoryDMA3WriteDispatch(
                                                                                                   "writeUnused",
                                                                                                   "writeInternalWRAM16",
                                                                                                   "writeInternalWRAM16",
                                                                                                   "writeIODispatch16",
                                                                                                   "writePalette16",
                                                                                                   "writeVRAM16",
                                                                                                   "writeOBJ16",
                                                                                                   "writeROM16DMA"
                                                                                                   ),
                                                                    compileMemoryDMA3WriteDispatch(
                                                                                                   "writeUnused",
                                                                                                   "writeExternalWRAM16",
                                                                                                   "writeInternalWRAM16",
                                                                                                   "writeIODispatch16",
                                                                                                   "writePalette16",
                                                                                                   "writeVRAM16",
                                                                                                   "writeOBJ16",
                                                                                                   "writeROM16DMA"
                                                                                                   ),
                                                                    compileMemoryDMA3WriteDispatch(
                                                                                                   "writeUnused",
                                                                                                   "writeUnused",
                                                                                                   "writeUnused",
                                                                                                   "writeIODispatch16",
                                                                                                   "writePalette16",
                                                                                                   "writeVRAM16",
                                                                                                   "writeOBJ16",
                                                                                                   "writeROM16DMA"
                                                                                                   )
                                                                    ];
    //Generic 32-Bit Read Dispatch:
    GameBoyAdvanceMemory.prototype.memoryRead32Generated = [
                                                              compileMemoryReadDispatch(
                                                                                         "readUnused32",
                                                                                         "readInternalWRAM32",
                                                                                         "readInternalWRAM32",
                                                                                         "readIODispatch32",
                                                                                         "readVRAM32Preliminary",
                                                                                         "readROM32",
                                                                                         "readROM232",
                                                                                         "readSRAM32",
                                                                                         "readBIOS32"
                                                                                         ),
                                                              compileMemoryReadDispatch(
                                                                                         "readUnused32",
                                                                                         "readExternalWRAM32",
                                                                                         "readInternalWRAM32",
                                                                                         "readIODispatch32",
                                                                                         "readVRAM32Preliminary",
                                                                                         "readROM32",
                                                                                         "readROM232",
                                                                                         "readSRAM32",
                                                                                         "readBIOS32"
                                                                                         ),
                                                              compileMemoryReadDispatch(
                                                                                         "readUnused32",
                                                                                         "readUnused32",
                                                                                         "readUnused32",
                                                                                         "readIODispatch32",
                                                                                         "readVRAM32Preliminary",
                                                                                         "readROM32",
                                                                                         "readROM232",
                                                                                         "readSRAM32",
                                                                                         "readBIOS32"
                                                                                         )
                                                              ];
    //DMA 0 Optimized 32-Bit Read Dispatch:
    GameBoyAdvanceMemory.prototype.memoryReadDMA32Generated = [
                                                               compileMemoryDMA0ReadDispatch(
                                                                                            "readUnused32DMA",
                                                                                            "readInternalWRAM32",
                                                                                            "readInternalWRAM32",
                                                                                            "readIODispatch32",
                                                                                            "readVRAM32Preliminary",
                                                                                            "readBIOS32DMA"
                                                                                            ),
                                                               compileMemoryDMA0ReadDispatch(
                                                                                            "readUnused32DMA",
                                                                                            "readExternalWRAM32",
                                                                                            "readInternalWRAM32",
                                                                                            "readIODispatch32",
                                                                                            "readVRAM32Preliminary",
                                                                                            "readBIOS32DMA"
                                                                                            ),
                                                               compileMemoryDMA0ReadDispatch(
                                                                                            "readUnused32DMA",
                                                                                            "readUnused32DMA",
                                                                                            "readUnused32DMA",
                                                                                            "readIODispatch32",
                                                                                            "readVRAM32Preliminary",
                                                                                            "readBIOS32DMA"
                                                                                            )
                                                               ];
    //DMA 1-3 Optimized 32-Bit Read Dispatch:
    GameBoyAdvanceMemory.prototype.memoryReadDMA32FullGenerated = [
                                                            compileMemoryDMAReadDispatch(
                                                                                      "readUnused32DMA",
                                                                                      "readInternalWRAM32",
                                                                                      "readInternalWRAM32",
                                                                                      "readIODispatch32",
                                                                                      "readVRAM32Preliminary",
                                                                                      "readROM32",
                                                                                      "readROM232",
                                                                                      "readBIOS32DMA"
                                                                                      ),
                                                            compileMemoryDMAReadDispatch(
                                                                                      "readUnused32DMA",
                                                                                      "readExternalWRAM32",
                                                                                      "readInternalWRAM32",
                                                                                      "readIODispatch32",
                                                                                      "readVRAM32Preliminary",
                                                                                      "readROM32",
                                                                                      "readROM232",
                                                                                      "readBIOS32DMA"
                                                                                      ),
                                                            compileMemoryDMAReadDispatch(
                                                                                      "readUnused32DMA",
                                                                                      "readUnused32DMA",
                                                                                      "readUnused32DMA",
                                                                                      "readIODispatch32",
                                                                                      "readVRAM32Preliminary",
                                                                                      "readROM32",
                                                                                      "readROM232",
                                                                                      "readBIOS32DMA"
                                                                                      )
                                                            ];
    //Generic 32-Bit Instruction Read Dispatch:
    GameBoyAdvanceMemory.prototype.memoryReadCPU32Generated = [
                                                                 compileMemoryReadDispatch(
                                                                                            "readUnused32CPU",
                                                                                            "readInternalWRAM32CPU",
                                                                                            "readInternalWRAM32CPU",
                                                                                            "readIODispatch32CPU",
                                                                                            "readVRAM32CPUPreliminary",
                                                                                            "readROM32CPU",
                                                                                            "readROM232CPU",
                                                                                            "readSRAM32CPU",
                                                                                            "readBIOS32CPU"
                                                                                            ),
                                                                 compileMemoryReadDispatch(
                                                                                            "readUnused32CPU",
                                                                                            "readExternalWRAM32CPU",
                                                                                            "readInternalWRAM32CPU",
                                                                                            "readIODispatch32CPU",
                                                                                            "readVRAM32CPUPreliminary",
                                                                                            "readROM32CPU",
                                                                                            "readROM232CPU",
                                                                                            "readSRAM32CPU",
                                                                                            "readBIOS32CPU"
                                                                                            ),
                                                                 compileMemoryReadDispatch(
                                                                                            "readUnused32CPU",
                                                                                            "readUnused32CPU",
                                                                                            "readUnused32CPU",
                                                                                            "readIODispatch32CPU",
                                                                                            "readVRAM32CPUPreliminary",
                                                                                            "readROM32CPU",
                                                                                            "readROM232CPU",
                                                                                            "readSRAM32CPU",
                                                                                            "readBIOS32CPU"
                                                                                            )
                                                                 ];
    //Generic 32-Bit Write Dispatch:
    GameBoyAdvanceMemory.prototype.memoryWrite32Generated = [
                                                              compileMemoryWriteDispatch2(
                                                                                          "writeUnused",
                                                                                          "writeInternalWRAM32",
                                                                                          "writeInternalWRAM32",
                                                                                          "writeIODispatch32",
                                                                                          "writePalette32",
                                                                                          "writeVRAM32",
                                                                                          "writeOBJ32",
                                                                                          "writeROM32",
                                                                                          "writeSRAM32"
                                                                                          ),
                                                              compileMemoryWriteDispatch2(
                                                                                          "writeUnused",
                                                                                          "writeExternalWRAM32",
                                                                                          "writeInternalWRAM32",
                                                                                          "writeIODispatch32",
                                                                                          "writePalette32",
                                                                                          "writeVRAM32",
                                                                                          "writeOBJ32",
                                                                                          "writeROM32",
                                                                                          "writeSRAM32"
                                                                                          ),
                                                              compileMemoryWriteDispatch2(
                                                                                          "writeUnused",
                                                                                          "writeUnused",
                                                                                          "writeUnused",
                                                                                          "writeIODispatch32",
                                                                                          "writePalette32",
                                                                                          "writeVRAM32",
                                                                                          "writeOBJ32",
                                                                                          "writeROM32",
                                                                                          "writeSRAM32"
                                                                                          )
                                                              ];
    //DMA 0-2 Optimized 32-Bit Write Dispatch:
    GameBoyAdvanceMemory.prototype.memoryWriteDMA32Generated = [
                                                             compileMemoryDMAWriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeInternalWRAM32",
                                                                                         "writeInternalWRAM32",
                                                                                         "writeIODispatch32",
                                                                                         "writePalette32",
                                                                                         "writeVRAM32",
                                                                                         "writeOBJ32"
                                                                                         ),
                                                             compileMemoryDMAWriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeExternalWRAM32",
                                                                                         "writeInternalWRAM32",
                                                                                         "writeIODispatch32",
                                                                                         "writePalette32",
                                                                                         "writeVRAM32",
                                                                                         "writeOBJ32"
                                                                                         ),
                                                             compileMemoryDMAWriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeUnused",
                                                                                         "writeUnused",
                                                                                         "writeIODispatch32",
                                                                                         "writePalette32",
                                                                                         "writeVRAM32",
                                                                                         "writeOBJ32"
                                                                                         )
                                                             ];
    //DMA 3 Optimized 32-Bit Write Dispatch:
    GameBoyAdvanceMemory.prototype.memoryWriteDMA32FullGenerated = [
                                                             compileMemoryDMA3WriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeInternalWRAM32",
                                                                                         "writeInternalWRAM32",
                                                                                         "writeIODispatch32",
                                                                                         "writePalette32",
                                                                                         "writeVRAM32",
                                                                                         "writeOBJ32",
                                                                                         "writeROM32"
                                                                                         ),
                                                             compileMemoryDMA3WriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeExternalWRAM32",
                                                                                         "writeInternalWRAM32",
                                                                                         "writeIODispatch32",
                                                                                         "writePalette32",
                                                                                         "writeVRAM32",
                                                                                         "writeOBJ32",
                                                                                         "writeROM32"
                                                                                         ),
                                                             compileMemoryDMA3WriteDispatch(
                                                                                         "writeUnused",
                                                                                         "writeUnused",
                                                                                         "writeUnused",
                                                                                         "writeIODispatch32",
                                                                                         "writePalette32",
                                                                                         "writeVRAM32",
                                                                                         "writeOBJ32",
                                                                                         "writeROM32"
                                                                                         )
                                                             ];
    //Initialize to default memory map:
    GameBoyAdvanceMemory.prototype.memoryRead8 = GameBoyAdvanceMemory.prototype.memoryRead8Generated[1];
    GameBoyAdvanceMemory.prototype.memoryWrite8 = GameBoyAdvanceMemory.prototype.memoryWrite8Generated[1];
    GameBoyAdvanceMemory.prototype.memoryRead16 = GameBoyAdvanceMemory.prototype.memoryRead16Generated[1];
    GameBoyAdvanceMemory.prototype.memoryReadDMA16 = GameBoyAdvanceMemory.prototype.memoryReadDMA16Generated[1];
    GameBoyAdvanceMemory.prototype.memoryReadDMAFull16 = GameBoyAdvanceMemory.prototype.memoryReadDMA16FullGenerated[1];
    GameBoyAdvanceMemory.prototype.memoryReadCPU16 = GameBoyAdvanceMemory.prototype.memoryReadCPU16Generated[1];
    GameBoyAdvanceMemory.prototype.memoryWrite16 = GameBoyAdvanceMemory.prototype.memoryWrite16Generated[1];
    GameBoyAdvanceMemory.prototype.memoryWriteDMA16 = GameBoyAdvanceMemory.prototype.memoryWriteDMA16Generated[1];
    GameBoyAdvanceMemory.prototype.memoryWriteDMAFull16 = GameBoyAdvanceMemory.prototype.memoryWriteDMA16FullGenerated[1];
    GameBoyAdvanceMemory.prototype.memoryRead32 = GameBoyAdvanceMemory.prototype.memoryRead32Generated[1];
    GameBoyAdvanceMemory.prototype.memoryReadDMA32 = GameBoyAdvanceMemory.prototype.memoryReadDMA32Generated[1];
    GameBoyAdvanceMemory.prototype.memoryReadDMAFull32 = GameBoyAdvanceMemory.prototype.memoryReadDMA32FullGenerated[1];
    GameBoyAdvanceMemory.prototype.memoryReadCPU32 = GameBoyAdvanceMemory.prototype.memoryReadCPU32Generated[1];
    GameBoyAdvanceMemory.prototype.memoryWrite32 = GameBoyAdvanceMemory.prototype.memoryWrite32Generated[1];
    GameBoyAdvanceMemory.prototype.memoryWriteDMA32 = GameBoyAdvanceMemory.prototype.memoryWriteDMA32Generated[1];
    GameBoyAdvanceMemory.prototype.memoryWriteDMAFull32 = GameBoyAdvanceMemory.prototype.memoryWriteDMA32FullGenerated[1];
}
generateMemoryTopLevelDispatch();

// graphics----------------------------
"use strict";
/*
 Copyright (C) 2012-2015 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceGraphics(IOCore) {
    //Build references:
    this.IOCore = IOCore;
}
GameBoyAdvanceGraphics.prototype.initialize = function () {
    this.gfxRenderer = this.IOCore.gfxRenderer;
    this.dma = this.IOCore.dma;
    this.dmaChannel3 = this.IOCore.dmaChannel3;
    this.irq = this.IOCore.irq;
    this.wait = this.IOCore.wait;
    this.initializeState();
}
GameBoyAdvanceGraphics.prototype.initializeState = function () {
    //Initialize Pre-Boot:
    this.renderedScanLine = false;
    this.statusFlags = 0;
    this.IRQFlags = 0;
    this.VCounter = 0;
    this.currentScanLine = 0;
    this.LCDTicks = 0;
    if (this.IOCore.SKIPBoot) {
        //BIOS entered the ROM at line 0x7C:
        this.currentScanLine = 0x7C;
    }
}
GameBoyAdvanceGraphics.prototype.addClocks = function (clocks) {
    clocks = clocks | 0;
    //Call this when clocking the state some more:
    this.LCDTicks = ((this.LCDTicks | 0) + (clocks | 0)) | 0;
    this.clockLCDState();
}
GameBoyAdvanceGraphics.prototype.clockLCDState = function () {
    if ((this.LCDTicks | 0) >= 960) {
        this.clockScanLine();                                                //Line finishes drawing at clock 960.
        this.clockLCDStatePostRender();                                      //Check for hblank and clocking into next line.
    }
}
GameBoyAdvanceGraphics.prototype.clockScanLine = function () {
    if (!this.renderedScanLine) {                                            //If we rendered the scanline, don't run this again.
        this.renderedScanLine = true;                                        //Mark rendering.
        if ((this.currentScanLine | 0) < 160) {
            this.gfxRenderer.incrementScanLineQueue();                          //Tell the gfx JIT to queue another line to draw.
        }
    }
}
GameBoyAdvanceGraphics.prototype.clockLCDStatePostRender = function () {
    if ((this.LCDTicks | 0) >= 1006) {
        //HBlank Event Occurred:
        this.updateHBlank();
        if ((this.LCDTicks | 0) >= 1232) {
            //Clocking to next line occurred:
            this.clockLCDNextLine();
        }
    }
}
GameBoyAdvanceGraphics.prototype.clockLCDNextLine = function () {
    /*We've now overflowed the LCD scan line state machine counter,
     which tells us we need to be on a new scan-line and refresh over.*/
    this.renderedScanLine = false;                                  //Unmark line render.
    this.statusFlags = this.statusFlags & 0x5;                      //Un-mark HBlank.
    //De-clock for starting on new scan-line:
    this.LCDTicks = ((this.LCDTicks | 0) - 1232) | 0;               //We start out at the beginning of the next line.
    //Increment scanline counter:
    this.currentScanLine = ((this.currentScanLine | 0) + 1) | 0;    //Increment to the next scan line.
    //Handle switching in/out of vblank:
    if ((this.currentScanLine | 0) >= 160) {
        //Handle special case scan lines of vblank:
        switch (this.currentScanLine | 0) {
            case 160:
                this.updateVBlankStart();                           //Update state for start of vblank.
            case 161:
                this.dmaChannel3.gfxDisplaySyncRequest();           //Display Sync. DMA trigger.
                break;
            case 162:
                this.dmaChannel3.gfxDisplaySyncEnableCheck();       //Display Sync. DMA reset on start of line 162.
                break;
            case 227:
                this.statusFlags = this.statusFlags & 0x6;          //Un-mark VBlank on start of last vblank line.
                break;
            case 228:
                this.currentScanLine = 0;                           //Reset scan-line to zero (First line of draw).
        }
    }
    else if ((this.currentScanLine | 0) > 1) {
        this.dmaChannel3.gfxDisplaySyncRequest();                   //Display Sync. DMA trigger.
    }
    this.checkVCounter();                                           //We're on a new scan line, so check the VCounter for match.
    this.isRenderingCheckPreprocess();                              //Update a check value.
    //Recursive clocking of the LCD state:
    this.clockLCDState();
}
GameBoyAdvanceGraphics.prototype.updateHBlank = function () {
    if ((this.statusFlags & 0x2) == 0) {                            //If we were last in HBlank, don't run this again.
        this.statusFlags = this.statusFlags | 0x2;                  //Mark HBlank.
        if ((this.IRQFlags & 0x10) != 0) {
            this.irq.requestIRQ(0x2);                               //Check for IRQ.
        }
        if ((this.currentScanLine | 0) < 160) {
            this.dma.gfxHBlankRequest();                            //Check for HDMA Trigger.
        }
        this.isRenderingCheckPreprocess();                          //Update a check value.
    }
}
GameBoyAdvanceGraphics.prototype.checkVCounter = function () {
    if ((this.currentScanLine | 0) == (this.VCounter | 0)) {        //Check for VCounter match.
        this.statusFlags = this.statusFlags | 0x4;
        if ((this.IRQFlags & 0x20) != 0) {                          //Check for VCounter IRQ.
            this.irq.requestIRQ(0x4);
        }
    }
    else {
        this.statusFlags = this.statusFlags & 0x3;
    }
}
GameBoyAdvanceGraphics.prototype.nextVBlankIRQEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if ((this.IRQFlags & 0x8) != 0) {
        //Only give a time if we're allowed to irq:
        nextEventTime = this.nextVBlankEventTime() | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextHBlankEventTime = function () {
    var time = this.LCDTicks | 0;
    if ((time | 0) < 1006) {
        //Haven't reached hblank yet, so hblank offset - current:
        time = (1006 - (time | 0)) | 0;
    }
    else {
        //We're in hblank, so it's end clock - current + next scanline hblank offset:
        time = (2238 - (time | 0)) | 0;
    }
    return time | 0;
}
GameBoyAdvanceGraphics.prototype.nextHBlankIRQEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if ((this.IRQFlags & 0x10) != 0) {
        //Only give a time if we're allowed to irq:
        nextEventTime = this.nextHBlankEventTime() | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextVCounterIRQEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if ((this.IRQFlags & 0x20) != 0) {
        //Only give a time if we're allowed to irq:
        nextEventTime = this.nextVCounterEventTime() | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextVBlankEventTime = function () {
    var nextEventTime = this.currentScanLine | 0;
    if ((nextEventTime | 0) < 160) {
        //Haven't reached vblank yet, so vblank offset - current:
        nextEventTime = (160 - (nextEventTime | 0)) | 0;
    }
    else {
        //We're in vblank, so it's end clock - current + next frame vblank offset:
        nextEventTime = (388 - (nextEventTime | 0)) | 0;
    }
    //Convert line count to clocks:
    nextEventTime = this.convertScanlineToClocks(nextEventTime | 0) | 0;
    //Subtract scanline offset from clocks:
    nextEventTime = ((nextEventTime | 0) - (this.LCDTicks | 0)) | 0;
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextHBlankDMAEventTime = function () {
    var nextEventTime = this.nextHBlankEventTime() | 0;
    if ((this.currentScanLine | 0) > 159 || ((this.currentScanLine | 0) == 159 && (this.LCDTicks | 0) >= 1006)) {
        //No HBlank DMA in VBlank:
        var linesToSkip = (227 - (this.currentScanLine | 0)) | 0;
        linesToSkip = this.convertScanlineToClocks(linesToSkip | 0) | 0;
        nextEventTime = ((nextEventTime | 0) + (linesToSkip | 0)) | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextVCounterEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if ((this.VCounter | 0) <= 227) {
        //Only match lines within screen or vblank:
        nextEventTime = ((this.VCounter | 0) - (this.currentScanLine | 0)) | 0;
        if ((nextEventTime | 0) <= 0) {
            nextEventTime = ((nextEventTime | 0) + 228) | 0;
        }
        nextEventTime = this.convertScanlineToClocks(nextEventTime | 0) | 0;
        nextEventTime = ((nextEventTime | 0) - (this.LCDTicks | 0)) | 0;
    }
    return nextEventTime | 0;
}
GameBoyAdvanceGraphics.prototype.nextDisplaySyncEventTime = function (delay) {
    delay = delay | 0;
    var nextEventTime = 0x7FFFFFFF;
    if ((this.currentScanLine | 0) >= 161 || (delay | 0) != 0) {
        //Skip to line 2 metrics:
        nextEventTime = (230 - (this.currentScanLine | 0)) | 0;
        nextEventTime = this.convertScanlineToClocks(nextEventTime | 0) | 0;
        nextEventTime = ((nextEventTime | 0) - (this.LCDTicks | 0)) | 0;
    }
    else if ((this.currentScanLine | 0) == 0) {
        //Doesn't start until line 2:
        nextEventTime = (2464 - (this.LCDTicks | 0)) | 0;
    }
    else {
        //Line 2 through line 161:
        nextEventTime = (1232 - (this.LCDTicks | 0)) | 0;
    }
    return nextEventTime | 0;
}
if (typeof Math.imul == "function") {
    //Math.imul found, insert the optimized path in:
    GameBoyAdvanceGraphics.prototype.convertScanlineToClocks = function (lines) {
        lines = lines | 0;
        lines = Math.imul(lines | 0, 1232) | 0;
        return lines | 0;
    }
}
else {
    //Math.imul not found, use the compatibility method:
    GameBoyAdvanceGraphics.prototype.convertScanlineToClocks = function (lines) {
        lines = lines | 0;
        lines = ((lines | 0) * 1232) | 0;
        return lines | 0;
    }
}
GameBoyAdvanceGraphics.prototype.updateVBlankStart = function () {
    this.statusFlags = this.statusFlags | 0x1;           //Mark VBlank.
    if ((this.IRQFlags & 0x8) != 0) {                    //Check for VBlank IRQ.
        this.irq.requestIRQ(0x1);
    }
    this.gfxRenderer.ensureFraming();
    this.dma.gfxVBlankRequest();
}
GameBoyAdvanceGraphics.prototype.isRenderingCheckPreprocess = function () {
    var isInVisibleLines = ((this.gfxRenderer.IOData8[0] & 0x80) == 0 && (this.statusFlags & 0x1) == 0);
    var isRendering = (isInVisibleLines && (this.statusFlags & 0x2) == 0) ? 2 : 1;
    var isOAMRendering = (isInVisibleLines && ((this.statusFlags & 0x2) == 0 || (this.gfxRenderer.IOData8[0] & 0x20) == 0)) ? 2 : 1;
    this.wait.updateRenderStatus(isRendering | 0, isOAMRendering | 0);
}
GameBoyAdvanceGraphics.prototype.writeDISPSTAT8_0 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    //VBlank flag read only.
    //HBlank flag read only.
    //V-Counter flag read only.
    //Only LCD IRQ generation enablers can be set here:
    this.IRQFlags = data & 0x38;
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceGraphics.prototype.writeDISPSTAT8_1 = function (data) {
    data = data | 0;
    data = data & 0xFF;
    //V-Counter match value:
    if ((data | 0) != (this.VCounter | 0)) {
        this.IOCore.updateCoreClocking();
        this.VCounter = data | 0;
        this.checkVCounter();
        this.IOCore.updateCoreEventTime();
    }
}
GameBoyAdvanceGraphics.prototype.writeDISPSTAT16 = function (data) {
    data = data | 0;
    this.IOCore.updateCoreClocking();
    //VBlank flag read only.
    //HBlank flag read only.
    //V-Counter flag read only.
    //Only LCD IRQ generation enablers can be set here:
    this.IRQFlags = data & 0x38;
    data = (data >> 8) & 0xFF;
    //V-Counter match value:
    if ((data | 0) != (this.VCounter | 0)) {
        this.VCounter = data | 0;
        this.checkVCounter();
    }
    this.IOCore.updateCoreEventTime();
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT8_0 = function () {
    this.IOCore.updateGraphicsClocking();
    return (this.statusFlags | this.IRQFlags);
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT8_1 = function () {
    return this.VCounter | 0;
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT8_2 = function () {
    this.IOCore.updateGraphicsClocking();
    return this.currentScanLine | 0;
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT16_0 = function () {
    this.IOCore.updateGraphicsClocking();
    return ((this.VCounter << 8) | this.statusFlags | this.IRQFlags);
}
GameBoyAdvanceGraphics.prototype.readDISPSTAT32 = function () {
    this.IOCore.updateGraphicsClocking();
    return ((this.currentScanLine << 16) | (this.VCounter << 8) | this.statusFlags | this.IRQFlags);
}
//sound
"use strict";
/*
 Copyright (C) 2012-2015 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceSound(IOCore) {
    //Build references:
    this.IOCore = IOCore;
}
GameBoyAdvanceSound.prototype.initialize = function () {
    this.coreExposed = this.IOCore.coreExposed;
    this.dmaChannel1 = this.IOCore.dmaChannel1;
    this.dmaChannel2 = this.IOCore.dmaChannel2;
    //Initialize start:
    this.audioTicks = 0;
    this.initializeSampling(380);
    this.initializeAudioStartState();
}
GameBoyAdvanceSound.prototype.initializeOutput = function (audioResamplerFirstPassFactor) {
    audioResamplerFirstPassFactor = audioResamplerFirstPassFactor | 0;
    if ((audioResamplerFirstPassFactor | 0) != (this.audioResamplerFirstPassFactor | 0)) {
        this.initializeSampling(audioResamplerFirstPassFactor | 0);
    }
}
GameBoyAdvanceSound.prototype.initializeSampling = function (audioResamplerFirstPassFactor) {
    audioResamplerFirstPassFactor = audioResamplerFirstPassFactor | 0;
    this.audioIndex = 0;
    this.downsampleInputLeft = 0;
    this.downsampleInputRight = 0;
    this.audioResamplerFirstPassFactor = audioResamplerFirstPassFactor | 0;
}
GameBoyAdvanceSound.prototype.initializeAudioStartState = function () {
    //NOTE: NR 60-63 never get reset in audio halting:
    this.nr60 = 0;
    this.nr61 = 0;
    this.nr62 = (!this.IOCore.SKIPBoot) ? 0 : 0xFF;
    this.nr63 = (!this.IOCore.SKIPBoot) ? 0 : 0x2;
    this.soundMasterEnabled = !!this.IOCore.SKIPBoot;
    this.mixerSoundBIAS = (!this.IOCore.SKIPBoot) ? 0 : 0x200;
    this.channel1 = new GameBoyAdvanceChannel1Synth(this);
    this.channel2 = new GameBoyAdvanceChannel2Synth(this);
    this.channel3 = new GameBoyAdvanceChannel3Synth(this);
    this.channel4 = new GameBoyAdvanceChannel4Synth(this);
    this.CGBMixerOutputCacheLeft = 0;
    this.CGBMixerOutputCacheLeftFolded = 0;
    this.CGBMixerOutputCacheRight = 0;
    this.CGBMixerOutputCacheRightFolded = 0;
    this.AGBDirectSoundATimer = 0;
    this.AGBDirectSoundBTimer = 0;
    this.AGBDirectSoundA = 0;
    this.AGBDirectSoundAFolded = 0;
    this.AGBDirectSoundB = 0;
    this.AGBDirectSoundBFolded = 0;
    this.AGBDirectSoundAShifter = 0;
    this.AGBDirectSoundBShifter = 0;
    this.AGBDirectSoundALeftCanPlay = false;
    this.AGBDirectSoundBLeftCanPlay = false;
    this.AGBDirectSoundARightCanPlay = false;
    this.AGBDirectSoundBRightCanPlay = false;
    this.CGBOutputRatio = 2;
    this.FIFOABuffer = new GameBoyAdvanceFIFO();
    this.FIFOBBuffer = new GameBoyAdvanceFIFO();
    this.audioDisabled();       //Clear legacy PAPU registers:
}
GameBoyAdvanceSound.prototype.audioDisabled = function () {
    this.channel1.disabled();
    this.channel2.disabled();
    this.channel3.disabled();
    this.channel4.disabled();
    //Clear FIFO:
    this.AGBDirectSoundAFIFOClear();
    this.AGBDirectSoundBFIFOClear();
    //Clear NR50:
    this.nr50 = 0;
    this.VinLeftChannelMasterVolume = 1;
    this.VinRightChannelMasterVolume = 1;
    //Clear NR51:
    this.nr51 = 0;
    //Clear NR52:
    this.nr52 = 0;
    this.soundMasterEnabled = false;
    this.mixerOutputCacheLeft = this.mixerSoundBIAS | 0;
    this.mixerOutputCacheRight = this.mixerSoundBIAS | 0;
    this.audioClocksUntilNextEventCounter = 0;
    this.audioClocksUntilNextEvent = 0;
    this.sequencePosition = 0;
    this.sequencerClocks = 0x8000;
    this.PWMWidth = 0x200;
    this.PWMWidthOld = 0x200;
    this.PWMWidthShadow = 0x200;
    this.PWMBitDepthMask = 0x3FE;
    this.PWMBitDepthMaskShadow = 0x3FE;
    this.channel1.outputLevelCache();
    this.channel2.outputLevelCache();
    this.channel3.updateCache();
    this.channel4.updateCache();
}
GameBoyAdvanceSound.prototype.audioEnabled = function () {
    //Set NR52:
    this.nr52 = 0x80;
    this.soundMasterEnabled = true;
}
GameBoyAdvanceSound.prototype.addClocks = function (clocks) {
    clocks = clocks | 0;
    this.audioTicks = ((this.audioTicks | 0) + (clocks | 0)) | 0;
}
if (typeof Math.imul == "function") {
    //Math.imul found, insert the optimized path in:
    GameBoyAdvanceSound.prototype.generateAudio = function (numSamples) {
        numSamples = numSamples | 0;
        var multiplier = 0;
        if (this.soundMasterEnabled && !this.IOCore.isStopped()) {
            for (var clockUpTo = 0; (numSamples | 0) > 0;) {
                clockUpTo = Math.min(this.PWMWidth | 0, numSamples | 0) | 0;
                this.PWMWidth = ((this.PWMWidth | 0) - (clockUpTo | 0)) | 0;
                numSamples = ((numSamples | 0) - (clockUpTo | 0)) | 0;
                while ((clockUpTo | 0) > 0) {
                    multiplier = Math.min(clockUpTo | 0, ((this.audioResamplerFirstPassFactor | 0) - (this.audioIndex | 0)) | 0) | 0;
                    clockUpTo = ((clockUpTo | 0) - (multiplier | 0)) | 0;
                    this.audioIndex = ((this.audioIndex | 0) + (multiplier | 0)) | 0;
                    this.downsampleInputLeft = ((this.downsampleInputLeft | 0) + Math.imul(this.mixerOutputCacheLeft | 0, multiplier | 0)) | 0;
                    this.downsampleInputRight = ((this.downsampleInputRight | 0) + Math.imul(this.mixerOutputCacheRight | 0, multiplier | 0)) | 0;
                    if ((this.audioIndex | 0) == (this.audioResamplerFirstPassFactor | 0)) {
                        this.audioIndex = 0;
                        this.coreExposed.outputAudio(this.downsampleInputLeft | 0, this.downsampleInputRight | 0);
                        this.downsampleInputLeft = 0;
                        this.downsampleInputRight = 0;
                    }
                }
                if ((this.PWMWidth | 0) == 0) {
                    this.computeNextPWMInterval();
                    this.PWMWidthOld = this.PWMWidthShadow | 0;
                    this.PWMWidth = this.PWMWidthShadow | 0;
                }
            }
        }
        else {
            //SILENT OUTPUT:
            while ((numSamples | 0) > 0) {
                multiplier = Math.min(numSamples | 0, ((this.audioResamplerFirstPassFactor | 0) - (this.audioIndex | 0)) | 0) | 0;
                numSamples = ((numSamples | 0) - (multiplier | 0)) | 0;
                this.audioIndex = ((this.audioIndex | 0) + (multiplier | 0)) | 0;
                if ((this.audioIndex | 0) == (this.audioResamplerFirstPassFactor | 0)) {
                    this.audioIndex = 0;
                    this.coreExposed.outputAudio(this.downsampleInputLeft | 0, this.downsampleInputRight | 0);
                    this.downsampleInputLeft = 0;
                    this.downsampleInputRight = 0;
                }
            }
        }
    }
}
else {
    //Math.imul not found, use the compatibility method:
    GameBoyAdvanceSound.prototype.generateAudio = function (numSamples) {
        var multiplier = 0;
        if (this.soundMasterEnabled && !this.IOCore.isStopped()) {
            for (var clockUpTo = 0; numSamples > 0;) {
                clockUpTo = Math.min(this.PWMWidth, numSamples);
                this.PWMWidth = this.PWMWidth - clockUpTo;
                numSamples -= clockUpTo;
                while (clockUpTo > 0) {
                    multiplier = Math.min(clockUpTo, this.audioResamplerFirstPassFactor - this.audioIndex);
                    clockUpTo -= multiplier;
                    this.audioIndex += multiplier;
                    this.downsampleInputLeft += this.mixerOutputCacheLeft * multiplier;
                    this.downsampleInputRight += this.mixerOutputCacheRight * multiplier;
                    if (this.audioIndex == this.audioResamplerFirstPassFactor) {
                        this.audioIndex = 0;
                        this.coreExposed.outputAudio(this.downsampleInputLeft, this.downsampleInputRight);
                        this.downsampleInputLeft = 0;
                        this.downsampleInputRight = 0;
                    }
                }
                if (this.PWMWidth == 0) {
                    this.computeNextPWMInterval();
                    this.PWMWidthOld = this.PWMWidthShadow;
                    this.PWMWidth = this.PWMWidthShadow;
                }
            }
        }
        else {
            //SILENT OUTPUT:
            while (numSamples > 0) {
                multiplier = Math.min(numSamples, this.audioResamplerFirstPassFactor - this.audioIndex);
                numSamples -= multiplier;
                this.audioIndex += multiplier;
                if (this.audioIndex == this.audioResamplerFirstPassFactor) {
                    this.audioIndex = 0;
                    this.coreExposed.outputAudio(this.downsampleInputLeft, this.downsampleInputRight);
                    this.downsampleInputLeft = 0;
                    this.downsampleInputRight = 0;
                }
            }
        }
    }
}
GameBoyAdvanceSound.prototype.audioJIT = function () {
    //Audio Sample Generation Timing:
    this.generateAudio(this.audioTicks | 0);
    this.audioTicks = 0;
}
GameBoyAdvanceSound.prototype.audioPSGJIT = function () {
    //Clock PCM timer logic:
    this.IOCore.updateTimerClocking();
    //Clock audio state machine:
    this.audioJIT();
}
GameBoyAdvanceSound.prototype.computeNextPWMInterval = function () {
    //Clock down the PSG system:
    for (var numSamples = this.PWMWidthOld | 0, clockUpTo = 0; (numSamples | 0) > 0; numSamples = ((numSamples | 0) - 1) | 0) {
        clockUpTo = Math.min(this.audioClocksUntilNextEventCounter | 0, this.sequencerClocks | 0, numSamples | 0) | 0;
        this.audioClocksUntilNextEventCounter = ((this.audioClocksUntilNextEventCounter | 0) - (clockUpTo | 0)) | 0;
        this.sequencerClocks = ((this.sequencerClocks | 0) - (clockUpTo | 0)) | 0;
        numSamples = ((numSamples | 0) - (clockUpTo | 0)) | 0;
        if ((this.sequencerClocks | 0) == 0) {
            this.audioComputeSequencer();
            this.sequencerClocks = 0x8000;
        }
        if ((this.audioClocksUntilNextEventCounter | 0) == 0) {
            this.computeAudioChannels();
        }
    }
    //Copy the new bit-depth mask for the next counter interval:
    this.PWMBitDepthMask = this.PWMBitDepthMaskShadow | 0;
    //Compute next sample for the PWM output:
    this.channel1.outputLevelCache();
    this.channel2.outputLevelCache();
    this.channel3.updateCache();
    this.channel4.updateCache();
    this.CGBMixerOutputLevelCache();
    this.mixerOutputLevelCache();
}
GameBoyAdvanceSound.prototype.audioComputeSequencer = function () {
    switch (this.sequencePosition++) {
        case 0:
            this.clockAudioLength();
            break;
        case 2:
            this.clockAudioLength();
            this.channel1.clockAudioSweep();
            break;
        case 4:
            this.clockAudioLength();
            break;
        case 6:
            this.clockAudioLength();
            this.channel1.clockAudioSweep();
            break;
        case 7:
            this.clockAudioEnvelope();
            this.sequencePosition = 0;
    }
}
GameBoyAdvanceSound.prototype.clockAudioLength = function () {
    //Channel 1:
    this.channel1.clockAudioLength();
    //Channel 2:
    this.channel2.clockAudioLength();
    //Channel 3:
    this.channel3.clockAudioLength();
    //Channel 4:
    this.channel4.clockAudioLength();
}
GameBoyAdvanceSound.prototype.clockAudioEnvelope = function () {
    //Channel 1:
    this.channel1.clockAudioEnvelope();
    //Channel 2:
    this.channel2.clockAudioEnvelope();
    //Channel 4:
    this.channel4.clockAudioEnvelope();
}
GameBoyAdvanceSound.prototype.computeAudioChannels = function () {
    //Clock down the four audio channels to the next closest audio event:
    this.channel1.FrequencyCounter = ((this.channel1.FrequencyCounter | 0) - (this.audioClocksUntilNextEvent | 0)) | 0;
    this.channel2.FrequencyCounter = ((this.channel2.FrequencyCounter | 0) - (this.audioClocksUntilNextEvent | 0)) | 0;
    this.channel3.counter = ((this.channel3.counter | 0) - (this.audioClocksUntilNextEvent | 0)) | 0;
    this.channel4.counter = ((this.channel4.counter | 0) - (this.audioClocksUntilNextEvent | 0)) | 0;
    //Channel 1 counter:
    this.channel1.computeAudioChannel();
    //Channel 2 counter:
    this.channel2.computeAudioChannel();
    //Channel 3 counter:
    this.channel3.computeAudioChannel();
    //Channel 4 counter:
    this.channel4.computeAudioChannel();
    //Find the number of clocks to next closest counter event:
    this.audioClocksUntilNextEventCounter = this.audioClocksUntilNextEvent = Math.min(this.channel1.FrequencyCounter | 0, this.channel2.FrequencyCounter | 0, this.channel3.counter | 0, this.channel4.counter | 0) | 0;
}
if (typeof Math.imul == "function") {
    //Math.imul found, insert the optimized path in:
    GameBoyAdvanceSound.prototype.CGBMixerOutputLevelCache = function () {
        this.CGBMixerOutputCacheLeft = Math.imul(((this.channel1.currentSampleLeft | 0) + (this.channel2.currentSampleLeft | 0) + (this.channel3.currentSampleLeft | 0) + (this.channel4.currentSampleLeft | 0)) | 0, this.VinLeftChannelMasterVolume | 0) | 0;
        this.CGBMixerOutputCacheRight = Math.imul(((this.channel1.currentSampleRight | 0) + (this.channel2.currentSampleRight | 0) + (this.channel3.currentSampleRight | 0) + (this.channel4.currentSampleRight | 0)) | 0, this.VinRightChannelMasterVolume | 0) | 0;
        this.CGBFolder();
    }
}
else {
    //Math.imul not found, use the compatibility method:
    GameBoyAdvanceSound.prototype.CGBMixerOutputLevelCache = function () {
        this.CGBMixerOutputCacheLeft = (this.channel1.currentSampleLeft + this.channel2.currentSampleLeft + this.channel3.currentSampleLeft + this.channel4.currentSampleLeft) * this.VinLeftChannelMasterVolume;
        this.CGBMixerOutputCacheRight = (this.channel1.currentSampleRight + this.channel2.currentSampleRight + this.channel3.currentSampleRight + this.channel4.currentSampleRight) * this.VinRightChannelMasterVolume;
        this.CGBFolder();
    }
}
GameBoyAdvanceSound.prototype.writeWAVE8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.audioPSGJIT();
    this.channel3.writeWAVE8(address | 0, data | 0);
}
GameBoyAdvanceSound.prototype.readWAVE8 = function (address) {
    address = address | 0;
    this.audioPSGJIT();
    return this.channel3.readWAVE8(address | 0) | 0;
}
GameBoyAdvanceSound.prototype.writeWAVE16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.audioPSGJIT();
    this.channel3.writeWAVE16(address >> 1, data | 0);
}
GameBoyAdvanceSound.prototype.readWAVE16 = function (address) {
    address = address | 0;
    this.audioPSGJIT();
    return this.channel3.readWAVE16(address >> 1) | 0;
}
GameBoyAdvanceSound.prototype.writeWAVE32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    this.audioPSGJIT();
    this.channel3.writeWAVE32(address >> 2, data | 0);
}
GameBoyAdvanceSound.prototype.readWAVE32 = function (address) {
    address = address | 0;
    this.audioPSGJIT();
    return this.channel3.readWAVE32(address >> 2) | 0;
}
GameBoyAdvanceSound.prototype.writeFIFOA8 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.FIFOABuffer.push8(data | 0);
    this.checkFIFOAPendingSignal();
}
GameBoyAdvanceSound.prototype.writeFIFOB8 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.FIFOBBuffer.push8(data | 0);
    this.checkFIFOBPendingSignal();
}
GameBoyAdvanceSound.prototype.writeFIFOA16 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.FIFOABuffer.push16(data | 0);
    this.checkFIFOAPendingSignal();
}
GameBoyAdvanceSound.prototype.writeFIFOB16 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.FIFOBBuffer.push16(data | 0);
    this.checkFIFOBPendingSignal();
}
GameBoyAdvanceSound.prototype.writeFIFOA32 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.FIFOABuffer.push32(data | 0);
    this.checkFIFOAPendingSignal();
}
GameBoyAdvanceSound.prototype.writeFIFOB32 = function (data) {
    data = data | 0;
    this.IOCore.updateTimerClocking();
    this.FIFOBBuffer.push32(data | 0);
    this.checkFIFOBPendingSignal();
}
GameBoyAdvanceSound.prototype.checkFIFOAPendingSignal = function () {
    if (this.FIFOABuffer.requestingDMA()) {
        this.dmaChannel1.soundFIFOARequest();
    }
}
GameBoyAdvanceSound.prototype.checkFIFOBPendingSignal = function () {
    if (this.FIFOBBuffer.requestingDMA()) {
        this.dmaChannel2.soundFIFOBRequest();
    }
}
GameBoyAdvanceSound.prototype.AGBDirectSoundAFIFOClear = function () {
    this.FIFOABuffer.clear();
    this.AGBDirectSoundATimerIncrement();
}
GameBoyAdvanceSound.prototype.AGBDirectSoundBFIFOClear = function () {
    this.FIFOBBuffer.clear();
    this.AGBDirectSoundBTimerIncrement();
}
GameBoyAdvanceSound.prototype.AGBDirectSoundTimer0ClockTick = function () {
    this.audioJIT();
    if (this.soundMasterEnabled) {
        if ((this.AGBDirectSoundATimer | 0) == 0) {
            this.AGBDirectSoundATimerIncrement();
        }
        if ((this.AGBDirectSoundBTimer | 0) == 0) {
            this.AGBDirectSoundBTimerIncrement();
        }
    }
}
GameBoyAdvanceSound.prototype.AGBDirectSoundTimer1ClockTick = function () {
    this.audioJIT();
    if (this.soundMasterEnabled) {
        if ((this.AGBDirectSoundATimer | 0) == 1) {
            this.AGBDirectSoundATimerIncrement();
        }
        if ((this.AGBDirectSoundBTimer | 0) == 1) {
            this.AGBDirectSoundBTimerIncrement();
        }
    }
}
GameBoyAdvanceSound.prototype.nextFIFOAEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if (this.soundMasterEnabled) {
        if (!this.FIFOABuffer.requestingDMA()) {
            var samplesUntilDMA = this.FIFOABuffer.samplesUntilDMATrigger() | 0;
            if ((this.AGBDirectSoundATimer | 0) == 0) {
                nextEventTime = this.IOCore.timer.nextTimer0Overflow(samplesUntilDMA | 0) | 0;
            }
            else {
                nextEventTime = this.IOCore.timer.nextTimer1Overflow(samplesUntilDMA | 0) | 0;
            }
        }
        else {
            nextEventTime = 0;
        }
    }
    return nextEventTime | 0;
}
GameBoyAdvanceSound.prototype.nextFIFOBEventTime = function () {
    var nextEventTime = 0x7FFFFFFF;
    if (this.soundMasterEnabled) {
        if (!this.FIFOBBuffer.requestingDMA()) {
            var samplesUntilDMA = this.FIFOBBuffer.samplesUntilDMATrigger() | 0;
            if ((this.AGBDirectSoundBTimer | 0) == 0) {
                nextEventTime = this.IOCore.timer.nextTimer0Overflow(samplesUntilDMA | 0) | 0;
            }
            else {
                nextEventTime = this.IOCore.timer.nextTimer1Overflow(samplesUntilDMA | 0) | 0;
            }
        }
        else {
            nextEventTime = 0;
        }
    }
    return nextEventTime | 0;
}
GameBoyAdvanceSound.prototype.AGBDirectSoundATimerIncrement = function () {
    this.AGBDirectSoundA = this.FIFOABuffer.shift() | 0;
    this.checkFIFOAPendingSignal();
    this.AGBFIFOAFolder();
}
GameBoyAdvanceSound.prototype.AGBDirectSoundBTimerIncrement = function () {
    this.AGBDirectSoundB = this.FIFOBBuffer.shift() | 0;
    this.checkFIFOBPendingSignal();
    this.AGBFIFOBFolder();
}
GameBoyAdvanceSound.prototype.AGBFIFOAFolder = function () {
    this.AGBDirectSoundAFolded = this.AGBDirectSoundA >> (this.AGBDirectSoundAShifter | 0);
}
GameBoyAdvanceSound.prototype.AGBFIFOBFolder = function () {
    this.AGBDirectSoundBFolded = this.AGBDirectSoundB >> (this.AGBDirectSoundBShifter | 0);
}
GameBoyAdvanceSound.prototype.CGBFolder = function () {
    this.CGBMixerOutputCacheLeftFolded = (this.CGBMixerOutputCacheLeft << (this.CGBOutputRatio | 0)) >> 1;
    this.CGBMixerOutputCacheRightFolded = (this.CGBMixerOutputCacheRight << (this.CGBOutputRatio | 0)) >> 1;
}
GameBoyAdvanceSound.prototype.mixerOutputLevelCache = function () {
    this.mixerOutputCacheLeft = Math.min(Math.max((((this.AGBDirectSoundALeftCanPlay) ? (this.AGBDirectSoundAFolded | 0) : 0) +
    ((this.AGBDirectSoundBLeftCanPlay) ? (this.AGBDirectSoundBFolded | 0) : 0) +
    (this.CGBMixerOutputCacheLeftFolded | 0) + (this.mixerSoundBIAS | 0)) | 0, 0) | 0, 0x3FF) & this.PWMBitDepthMask;
    this.mixerOutputCacheRight = Math.min(Math.max((((this.AGBDirectSoundARightCanPlay) ? (this.AGBDirectSoundAFolded | 0) : 0) +
    ((this.AGBDirectSoundBRightCanPlay) ? (this.AGBDirectSoundBFolded | 0) : 0) +
    (this.CGBMixerOutputCacheRightFolded | 0) + (this.mixerSoundBIAS | 0)) | 0, 0) | 0, 0x3FF) & this.PWMBitDepthMask;
}
GameBoyAdvanceSound.prototype.setNR52 = function (data) {
    data = data | 0;
    this.nr52 = data | this.nr52;
}
GameBoyAdvanceSound.prototype.unsetNR52 = function (data) {
    data = data | 0;
    this.nr52 = data & this.nr52;
}
GameBoyAdvanceSound.prototype.readSOUND1CNT8_0 = function () {
    //NR10:
    return this.channel1.readSOUND1CNT8_0() | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND1CNT8_0 = function (data) {
    //NR10:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel1.writeSOUND1CNT8_0(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND1CNT8_2 = function () {
    //NR11:
    return this.channel1.readSOUND1CNT8_2() | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND1CNT8_2 = function (data) {
    //NR11:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel1.writeSOUND1CNT8_2(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND1CNT8_3 = function () {
    //NR12:
    return this.channel1.readSOUND1CNT8_3() | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND1CNT8_3 = function (data) {
    //NR12:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel1.writeSOUND1CNT8_3(data | 0);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND1CNT16 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR11:
        this.channel1.writeSOUND1CNT8_2(data | 0);
        //NR12:
        this.channel1.writeSOUND1CNT8_3(data >> 8);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND1CNT32 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR10:
        this.channel1.writeSOUND1CNT8_0(data | 0);
        //NR11:
        this.channel1.writeSOUND1CNT8_2(data >> 16);
        //NR12:
        this.channel1.writeSOUND1CNT8_3(data >> 24);
    }
}
GameBoyAdvanceSound.prototype.readSOUND1CNT32 = function () {
    return this.channel1.readSOUND1CNT8_0() |
    (this.channel1.readSOUND1CNT8_2() << 16) |
    (this.channel1.readSOUND1CNT8_3() << 24);
}
GameBoyAdvanceSound.prototype.writeSOUND1CNTX8_0 = function (data) {
    //NR13:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel1.writeSOUND1CNT_X0(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND1CNTX8 = function () {
    //NR14:
    return this.channel1.readSOUND1CNTX8() | 0;
}
GameBoyAdvanceSound.prototype.readSOUND1CNTX16 = function () {
    //NR14:
    return this.channel1.readSOUND1CNTX8() << 8;
}
GameBoyAdvanceSound.prototype.writeSOUND1CNTX8_1 = function (data) {
    //NR14:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel1.writeSOUND1CNT_X1(data | 0);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND1CNTX16 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR13:
        this.channel1.writeSOUND1CNT_X0(data | 0);
        //NR14:
        this.channel1.writeSOUND1CNT_X1(data >> 8);
    }
}
GameBoyAdvanceSound.prototype.readSOUND2CNTL8_0 = function () {
    //NR21:
    return this.channel2.readSOUND2CNT_L0() | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND2CNTL8_0 = function (data) {
    data = data | 0;
    //NR21:
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel2.writeSOUND2CNT_L0(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND2CNTL8_1 = function () {
    //NR22:
    return this.channel2.readSOUND2CNT_L1() | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND2CNTL8_1 = function (data) {
    data = data | 0;
    //NR22:
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel2.writeSOUND2CNT_L1(data | 0);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND2CNTL16 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR21:
        this.channel2.writeSOUND2CNT_L0(data | 0);
        //NR22:
        this.channel2.writeSOUND2CNT_L1(data >> 8);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND2CNTH8_0 = function (data) {
    data = data | 0;
    //NR23:
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel2.writeSOUND2CNT_H0(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND2CNTH8 = function () {
    //NR24:
    return this.channel2.readSOUND2CNT_H() | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND2CNTH8_1 = function (data) {
    data = data | 0;
    //NR24:
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel2.writeSOUND2CNT_H1(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND2CNTL16 = function () {
    //NR21:
    //NR22:
    var data = this.channel2.readSOUND2CNT_L0() | 0;
    data = data | (this.channel2.readSOUND2CNT_L1() << 8);
    return data | 0;
}
GameBoyAdvanceSound.prototype.readSOUND2CNTH16 = function () {
    //NR24:
    return this.channel2.readSOUND2CNT_H() << 8;
}
GameBoyAdvanceSound.prototype.writeSOUND2CNTH16 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR23:
        this.channel2.writeSOUND2CNT_H0(data | 0);
        //NR24:
        this.channel2.writeSOUND2CNT_H1(data >> 8);
    }
}
GameBoyAdvanceSound.prototype.readSOUND3CNT8_0 = function () {
    //NR30:
    return this.channel3.readSOUND3CNT_L() | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND3CNT8_0 = function (data) {
    //NR30:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel3.writeSOUND3CNT_L(data | 0);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND3CNT8_2 = function (data) {
    //NR31:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel3.writeSOUND3CNT_H0(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND3CNT8_3 = function () {
    //NR32:
    return this.channel3.readSOUND3CNT_H() | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND3CNT8_3 = function (data) {
    //NR32:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel3.writeSOUND3CNT_H1(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND3CNT16_1 = function () {
    //NR30:
    return this.channel3.readSOUND3CNT_H() << 8;
}
GameBoyAdvanceSound.prototype.readSOUND3CNT32 = function () {
    //NR30:
    var data = this.channel3.readSOUND3CNT_L() | 0;
    //NR32:
    data = data | (this.channel3.readSOUND3CNT_H() << 24);
    return data | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND3CNT16 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR31:
        this.channel3.writeSOUND3CNT_H0(data | 0);
        //NR32:
        this.channel3.writeSOUND3CNT_H1(data >> 8);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND3CNT32 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR30:
        this.channel3.writeSOUND3CNT_L(data | 0);
        //NR31:
        this.channel3.writeSOUND3CNT_H0(data >> 16);
        //NR32:
        this.channel3.writeSOUND3CNT_H1(data >> 24);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND3CNTX8_0 = function (data) {
    //NR33:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel3.writeSOUND3CNT_X0(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND3CNTX8 = function () {
    //NR34:
    return this.channel3.readSOUND3CNT_X() | 0;
}
GameBoyAdvanceSound.prototype.readSOUND3CNTX16 = function () {
    //NR34:
    return this.channel3.readSOUND3CNT_X() << 8;
}
GameBoyAdvanceSound.prototype.writeSOUND3CNTX8_1 = function (data) {
    //NR34:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel3.writeSOUND3CNT_X1(data | 0);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND3CNTX16 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR33:
        this.channel3.writeSOUND3CNT_X0(data | 0);
        //NR34:
        this.channel3.writeSOUND3CNT_X1(data >> 8);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND4CNTL8_0 = function (data) {
    //NR41:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel4.writeSOUND4CNT_L0(data | 0);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND4CNTL8_1 = function (data) {
    //NR42:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel4.writeSOUND4CNT_L1(data | 0);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND4CNTL16 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR41:
        this.channel4.writeSOUND4CNT_L0(data | 0);
        //NR42:
        this.channel4.writeSOUND4CNT_L1(data >> 8);
    }
}
GameBoyAdvanceSound.prototype.readSOUND4CNTL8 = function () {
    //NR42:
    return this.channel4.readSOUND4CNT_L() | 0;
}
GameBoyAdvanceSound.prototype.readSOUND4CNTL16 = function () {
    //NR42:
    return this.channel4.readSOUND4CNT_L() << 8;
}
GameBoyAdvanceSound.prototype.writeSOUND4CNTH8_0 = function (data) {
    //NR43:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel4.writeSOUND4CNT_H0(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUND4CNTH8_0 = function () {
    //NR43:
    return this.channel4.readSOUND4CNT_H0() | 0;
}
GameBoyAdvanceSound.prototype.writeSOUND4CNTH8_1 = function (data) {
    //NR44:
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        this.channel4.writeSOUND4CNT_H1(data | 0);
    }
}
GameBoyAdvanceSound.prototype.writeSOUND4CNTH16 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR43:
        this.channel4.writeSOUND4CNT_H0(data | 0);
        //NR44:
        this.channel4.writeSOUND4CNT_H1(data >> 8);
    }
}
GameBoyAdvanceSound.prototype.readSOUND4CNTH8_1 = function () {
    //NR44:
    return this.channel4.readSOUND4CNT_H1() | 0;
}
GameBoyAdvanceSound.prototype.readSOUND4CNTH16 = function () {
    //NR43:
    var data = this.channel4.readSOUND4CNT_H0() | 0;
    //NR44:
    data = data | (this.channel4.readSOUND4CNT_H1() << 8);
    return data | 0;
}
GameBoyAdvanceSound.prototype.writeSOUNDCNTL8_0 = function (data) {
    //NR50:
    data = data | 0;
    data = data & 0xFF;
    if (this.soundMasterEnabled && (this.nr50 | 0) != (data | 0)) {
        this.audioPSGJIT();
        this.nr50 = data | 0;
        this.VinLeftChannelMasterVolume = (((data >> 4) & 0x07) + 1) | 0;
        this.VinRightChannelMasterVolume = ((data & 0x07) + 1) | 0;
    }
}
GameBoyAdvanceSound.prototype.readSOUNDCNTL8_0 = function () {
    //NR50:
    return 0x88 | this.nr50;
}
GameBoyAdvanceSound.prototype.writeSOUNDCNTL8_1 = function (data) {
    //NR51:
    data = data | 0;
    data = data & 0xFF;
    if (this.soundMasterEnabled && (this.nr51 | 0) != (data | 0)) {
        this.audioPSGJIT();
        this.nr51 = data | 0;
        this.channel1.setChannelOutputEnable(data | 0);
        this.channel2.setChannelOutputEnable(data | 0);
        this.channel3.setChannelOutputEnable(data | 0);
        this.channel4.setChannelOutputEnable(data | 0);
    }
}
GameBoyAdvanceSound.prototype.readSOUNDCNTL8_1 = function () {
    //NR51:
    return this.nr51 | 0;
}
GameBoyAdvanceSound.prototype.writeSOUNDCNTL16 = function (data) {
    data = data | 0;
    if (this.soundMasterEnabled) {
        this.audioPSGJIT();
        //NR50:
        if ((this.nr50 | 0) != (data & 0xFF)) {
            this.nr50 = data & 0xFF;
            this.VinLeftChannelMasterVolume = (((data >> 4) & 0x07) + 1) | 0;
            this.VinRightChannelMasterVolume = ((data & 0x07) + 1) | 0;
        }
        data = (data >> 8) & 0xFF;
        //NR51:
        if ((this.nr51 | 0) != (data | 0)) {
            this.nr51 = data | 0;
            this.channel1.setChannelOutputEnable(data | 0);
            this.channel2.setChannelOutputEnable(data | 0);
            this.channel3.setChannelOutputEnable(data | 0);
            this.channel4.setChannelOutputEnable(data | 0);
        }
    }
}
GameBoyAdvanceSound.prototype.readSOUNDCNTL16 = function () {
    //NR50:
    var data = 0x88 | this.nr50;
    //NR51:
    data = data | (this.nr51 << 8);
    return data | 0;
}
GameBoyAdvanceSound.prototype.writeSOUNDCNTH8_0 = function (data) {
    //NR60:
    data = data | 0;
    this.audioPSGJIT();
    this.CGBOutputRatio = data & 0x3;
    this.AGBDirectSoundAShifter = (data & 0x04) >> 2;
    this.AGBDirectSoundBShifter = (data & 0x08) >> 3;
    this.nr60 = data & 0xFF;
}
GameBoyAdvanceSound.prototype.readSOUNDCNTH8_0 = function () {
    //NR60:
    return this.nr60 | 0;
}
GameBoyAdvanceSound.prototype.writeSOUNDCNTH8_1 = function (data) {
    //NR61:
    data = data | 0;
    this.audioPSGJIT();
    this.AGBDirectSoundARightCanPlay = ((data & 0x1) != 0);
    this.AGBDirectSoundALeftCanPlay = ((data & 0x2) != 0);
    this.AGBDirectSoundATimer = (data & 0x4) >> 2;
    if ((data & 0x08) != 0) {
        this.AGBDirectSoundAFIFOClear();
    }
    this.AGBDirectSoundBRightCanPlay = ((data & 0x10) != 0);
    this.AGBDirectSoundBLeftCanPlay = ((data & 0x20) != 0);
    this.AGBDirectSoundBTimer = (data & 0x40) >> 6;
    if ((data & 0x80) != 0) {
        this.AGBDirectSoundBFIFOClear();
    }
    this.nr61 = data & 0xFF;
    this.IOCore.updateCoreClocking();
}
GameBoyAdvanceSound.prototype.readSOUNDCNTH8_1 = function () {
    //NR61:
    return this.nr61 | 0;
}
GameBoyAdvanceSound.prototype.writeSOUNDCNTH16 = function (data) {
    //NR60:
    data = data | 0;
    this.audioPSGJIT();
    this.CGBOutputRatio = data & 0x3;
    this.AGBDirectSoundAShifter = (data & 0x04) >> 2;
    this.AGBDirectSoundBShifter = (data & 0x08) >> 3;
    this.nr60 = data & 0xFF;
    //NR61:
    data = data >> 8;
    this.AGBDirectSoundARightCanPlay = ((data & 0x1) != 0);
    this.AGBDirectSoundALeftCanPlay = ((data & 0x2) != 0);
    this.AGBDirectSoundATimer = (data & 0x4) >> 2;
    if ((data & 0x08) != 0) {
        this.AGBDirectSoundAFIFOClear();
    }
    this.AGBDirectSoundBRightCanPlay = ((data & 0x10) != 0);
    this.AGBDirectSoundBLeftCanPlay = ((data & 0x20) != 0);
    this.AGBDirectSoundBTimer = (data & 0x40) >> 6;
    if ((data & 0x80) != 0) {
        this.AGBDirectSoundBFIFOClear();
    }
    this.nr61 = data & 0xFF;
    this.IOCore.updateCoreClocking();
}
GameBoyAdvanceSound.prototype.readSOUNDCNTH16 = function () {
    //NR60:
    var data = this.nr60 | 0;
    //NR61:
    data = data | (this.nr61 << 8);
    return data | 0;
}
GameBoyAdvanceSound.prototype.writeSOUNDCNT32 = function (data) {
    data = data | 0;
    this.audioPSGJIT();
    if (this.soundMasterEnabled) {
        //NR50:
        if ((this.nr50 | 0) != (data & 0xFF)) {
            this.nr50 = data & 0xFF;
            this.VinLeftChannelMasterVolume = (((data >> 4) & 0x07) + 1) | 0;
            this.VinRightChannelMasterVolume = ((data & 0x07) + 1) | 0;
        }
        var data2 = (data >> 8) & 0xFF;
        //NR51:
        if ((this.nr51 | 0) != (data2 | 0)) {
            this.nr51 = data2 | 0;
            this.channel1.setChannelOutputEnable(data2 | 0);
            this.channel2.setChannelOutputEnable(data2 | 0);
            this.channel3.setChannelOutputEnable(data2 | 0);
            this.channel4.setChannelOutputEnable(data2 | 0);
        }
    }
    //NR60:
    data = data >> 16;
    this.CGBOutputRatio = data & 0x3;
    this.AGBDirectSoundAShifter = (data & 0x04) >> 2;
    this.AGBDirectSoundBShifter = (data & 0x08) >> 3;
    this.nr60 = data & 0xFF;
    //NR61:
    data = data >> 8;
    this.AGBDirectSoundARightCanPlay = ((data & 0x1) != 0);
    this.AGBDirectSoundALeftCanPlay = ((data & 0x2) != 0);
    this.AGBDirectSoundATimer = (data & 0x4) >> 2;
    if ((data & 0x08) != 0) {
        this.AGBDirectSoundAFIFOClear();
    }
    this.AGBDirectSoundBRightCanPlay = ((data & 0x10) != 0);
    this.AGBDirectSoundBLeftCanPlay = ((data & 0x20) != 0);
    this.AGBDirectSoundBTimer = (data & 0x40) >> 6;
    if ((data & 0x80) != 0) {
        this.AGBDirectSoundBFIFOClear();
    }
    this.nr61 = data & 0xFF;
    this.IOCore.updateCoreClocking();
}
GameBoyAdvanceSound.prototype.readSOUNDCNT32 = function () {
    //NR50:
    var data = 0x88 | this.nr50;
    //NR51:
    data = data | (this.nr51 << 8);
    //NR60:
    data = data | (this.nr60 << 16);
    //NR61:
    data = data | (this.nr61 << 24);
    return data | 0;
}
GameBoyAdvanceSound.prototype.writeSOUNDCNTX8 = function (data) {
    //NR52:
    data = data | 0;
    if (!this.soundMasterEnabled && (data & 0x80) != 0) {
        this.audioPSGJIT();
        this.audioEnabled();
        this.IOCore.updateCoreClocking();
    }
    else if (this.soundMasterEnabled && (data & 0x80) == 0) {
        this.audioPSGJIT();
        this.audioDisabled();
        this.IOCore.updateCoreClocking();
    }
}
GameBoyAdvanceSound.prototype.readSOUNDCNTX8 = function () {
    //NR52:
    this.audioPSGJIT();
    return this.nr52 | 0;
}
GameBoyAdvanceSound.prototype.writeSOUNDBIAS8_0 = function (data) {
    //NR62:
    data = data | 0;
    this.audioPSGJIT();
    this.mixerSoundBIAS = this.mixerSoundBIAS & 0x300;
    this.mixerSoundBIAS = this.mixerSoundBIAS | (data & 0xFF);
    this.nr62 = data & 0xFF;
}
GameBoyAdvanceSound.prototype.readSOUNDBIAS8_0 = function () {
    //NR62:
    return this.nr62 | 0;
}
GameBoyAdvanceSound.prototype.writeSOUNDBIAS8_1 = function (data) {
    //NR63:
    data = data | 0;
    this.audioPSGJIT();
    this.mixerSoundBIAS = this.mixerSoundBIAS & 0xFF;
    this.mixerSoundBIAS = this.mixerSoundBIAS | ((data & 0x3) << 8);
    this.PWMWidthShadow = 0x200 >> ((data & 0xC0) >> 6);
    this.PWMBitDepthMaskShadow = ((this.PWMWidthShadow | 0) - 1) << (1 + ((data & 0xC0) >> 6));
    this.nr63 = data & 0xFF;
}
GameBoyAdvanceSound.prototype.writeSOUNDBIAS16 = function (data) {
    //NR62:
    data = data | 0;
    this.audioPSGJIT();
    this.mixerSoundBIAS = data & 0x3FF;
    this.nr62 = data & 0xFF;
    //NR63:
    this.PWMWidthShadow = 0x200 >> ((data & 0xC000) >> 14);
    this.PWMBitDepthMaskShadow = ((this.PWMWidthShadow | 0) - 1) << (1 + ((data & 0xC000) >> 14));
    this.nr63 = (data >> 8) & 0xFF;
}
GameBoyAdvanceSound.prototype.readSOUNDBIAS8_1 = function () {
    //NR63:
    return this.nr63 | 0;
}
GameBoyAdvanceSound.prototype.readSOUNDBIAS16 = function () {
    //NR62:
    var data = this.nr62 | 0;
    //NR63:
    data = data | (this.nr63 << 8);
    return data | 0;
}
//saves----------------------------------

"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceSaves(IOCore) {
    this.cartridge = IOCore.cartridge;
}
GameBoyAdvanceSaves.prototype.initialize = function () {
    this.saveType = 0;
    this.GPIOChip = new GameBoyAdvanceGPIOChip();
    this.UNDETERMINED = new GameBoyAdvanceSaveDeterminer(this);
    this.SRAMChip = new GameBoyAdvanceSRAMChip();
    this.FLASHChip = new GameBoyAdvanceFLASHChip(this.cartridge.flash_is128, this.cartridge.flash_isAtmel);
    this.EEPROMChip = new GameBoyAdvanceEEPROMChip(this.cartridge.IOCore);
    this.currentChip = this.UNDETERMINED;
    this.referenceSave(this.saveType);
}
GameBoyAdvanceSaves.prototype.referenceSave = function (saveType) {
    saveType = saveType | 0;
    switch (saveType | 0) {
        case 0:
            this.currentChip = this.UNDETERMINED;
            break;
        case 1:
            this.currentChip = this.SRAMChip;
            break;
        case 2:
            this.currentChip = this.FLASHChip;
            break;
        case 3:
            this.currentChip = this.EEPROMChip;
    }
    this.currentChip.initialize();
    this.saveType = saveType | 0;
}
GameBoyAdvanceSaves.prototype.importSave = function (saves, saveType) {
    saveType = saveType | 0;
    this.UNDETERMINED.load(saves);
    this.SRAMChip.load(saves);
    this.FLASHChip.load(saves);
    this.EEPROMChip.load(saves);
    this.referenceSave(saveType | 0);
}
GameBoyAdvanceSaves.prototype.importRTC = function (saves) {
    this.GPIOChip.loadRTC(saves);
}
GameBoyAdvanceSaves.prototype.importGPIOType = function (gpioType) {
    gpioType = gpioType | 0;
    this.GPIOChip.loadType(gpioType | 0);
}
GameBoyAdvanceSaves.prototype.exportSave = function () {
    return this.currentChip.saves;
}
GameBoyAdvanceSaves.prototype.exportSaveType = function () {
    return this.saveType | 0;
}
GameBoyAdvanceSaves.prototype.readGPIO8 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.GPIOChip.getType() | 0) > 0) {
        //GPIO:
        data = this.GPIOChip.read8(address | 0) | 0;
    }
    else {
        //ROM:
        data = this.cartridge.readROMOnly8(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readEEPROM8 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.saveType | 0) == 3) {
        //EEPROM:
        data = this.EEPROMChip.read8() | 0;
    }
    else {
        //UNKNOWN:
        data = this.UNDETERMINED.readEEPROM8(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readGPIO16 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.GPIOChip.getType() | 0) > 0) {
        //GPIO:
        data = this.GPIOChip.read16(address | 0) | 0;
    }
    else {
        //ROM:
        data = this.cartridge.readROMOnly16(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readEEPROM16 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.saveType | 0) == 3) {
        //EEPROM:
        data = this.EEPROMChip.read16() | 0;
    }
    else {
        //UNKNOWN:
        data = this.UNDETERMINED.readEEPROM16(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readGPIO32 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.GPIOChip.getType() | 0) > 0) {
        //GPIO:
        data = this.GPIOChip.read32(address | 0) | 0;
    }
    else {
        //ROM:
        data = this.cartridge.readROMOnly32(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readEEPROM32 = function (address) {
    address = address | 0;
    var data = 0;
    if ((this.saveType | 0) == 3) {
        //EEPROM:
        data = this.EEPROMChip.read32() | 0;
    }
    else {
        //UNKNOWN:
        data = this.UNDETERMINED.readEEPROM32(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.readSRAM = function (address) {
    address = address | 0;
    var data = 0;
    switch (this.saveType | 0) {
        case 0:
            //UNKNOWN:
            data = this.UNDETERMINED.readSRAM(address | 0) | 0;
            break;
        case 1:
            //SRAM:
            data = this.SRAMChip.read(address | 0) | 0;
            break;
        case 2:
            //FLASH:
            data = this.FLASHChip.read(address | 0) | 0;
    }
    return data | 0;
}
GameBoyAdvanceSaves.prototype.writeGPIO8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((this.GPIOChip.getType() | 0) > 0) {
        //GPIO:
        this.GPIOChip.write8(address | 0, data | 0);
    }
    else {
        //Unknown:
        this.UNDETERMINED.writeGPIO8(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeGPIO16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((this.GPIOChip.getType() | 0) > 0) {
        //GPIO:
        this.GPIOChip.write16(address | 0, data | 0);
    }
    else {
        //Unknown:
        this.UNDETERMINED.writeGPIO16(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeEEPROM16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((this.saveType | 0) == 3) {
        //EEPROM:
        this.EEPROMChip.write16(data | 0);
    }
    else {
        //Unknown:
        this.UNDETERMINED.writeEEPROM16(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeGPIO32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    if ((this.GPIOChip.getType() | 0) > 0) {
        //GPIO:
        this.GPIOChip.write32(address | 0, data | 0);
    }
    else {
        //Unknown:
        this.UNDETERMINED.writeGPIO32(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeSRAM = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (this.saveType | 0) {
        case 0:
            //Unknown:
            this.UNDETERMINED.writeSRAM(address | 0, data | 0);
            break;
        case 1:
            //SRAM:
            this.SRAMChip.write(address | 0, data | 0);
            break;
        case 2:
            //FLASH:
            this.FLASHChip.write(address | 0, data | 0);
    }
}
GameBoyAdvanceSaves.prototype.writeSRAMIfDefined = function (address, data) {
    address = address | 0;
    data = data | 0;
    switch (this.saveType | 0) {
        case 0:
            //UNKNOWN:
            this.SRAMChip.initialize();
        case 1:
            //SRAM:
            this.SRAMChip.write(address | 0, data | 0);
            break;
        case 2:
            //FLASH:
            this.FLASHChip.write(address | 0, data | 0);
    }
}
//cpu---------------------------------
"use strict";
/*
 Copyright (C) 2012-2015 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceCPU(IOCore) {
    this.IOCore = IOCore;
}
GameBoyAdvanceCPU.prototype.initialize = function () {
    this.memory = this.IOCore.memory;
    this.wait = this.IOCore.wait;
    this.mul64ResultHigh = 0;    //Scratch MUL64.
    this.mul64ResultLow = 0;    //Scratch MUL64.
    this.initializeRegisters();
    this.ARM = new ARMInstructionSet(this);
    this.THUMB = new THUMBInstructionSet(this);
    //this.swi = new GameBoyAdvanceSWI(this);
    this.IOCore.assignInstructionCoreReferences(this.ARM, this.THUMB);
}
GameBoyAdvanceCPU.prototype.initializeRegisters = function () {
    /*
        R0-R7 Are known as the low registers.
        R8-R12 Are the high registers.
        R13 is the stack pointer.
        R14 is the link register.
        R15 is the program counter.
        CPSR is the program status register.
        SPSR is the saved program status register.
    */
    //Normal R0-R15 Registers:
    this.registers = getInt32Array(16);
    //Used to copy back the R8-R14 state for normal operations:
    this.registersUSR = getInt32Array(7);
    //Fast IRQ mode registers (R8-R14):
    this.registersFIQ = getInt32Array(7);
    //Supervisor mode registers (R13-R14):
    this.registersSVC = getInt32Array(2);
    //Abort mode registers (R13-R14):
    this.registersABT = getInt32Array(2);
    //IRQ mode registers (R13-R14):
    this.registersIRQ = getInt32Array(2);
    //Undefined mode registers (R13-R14):
    this.registersUND = getInt32Array(2);
    //CPSR Register:
    this.branchFlags = ARMCPSRAttributeTable();
    this.modeFlags = 0xD3;
    //Banked SPSR Registers:
    this.SPSR = getUint16Array(5);
    this.SPSR[0] = 0xD3; //FIQ
    this.SPSR[1] = 0xD3; //IRQ
    this.SPSR[2] = 0xD3; //Supervisor
    this.SPSR[3] = 0xD3; //Abort
    this.SPSR[4] = 0xD3; //Undefined
    this.triggeredIRQ = 0;        //Pending IRQ found.
    //Pre-initialize stack pointers if no BIOS loaded:
    if (this.IOCore.SKIPBoot) {
        this.HLEReset();
    }
    //Start in fully bubbled pipeline mode:
    this.IOCore.flagBubble();
}
GameBoyAdvanceCPU.prototype.HLEReset = function () {
    this.registersSVC[0] = 0x3007FE0;
    this.registersIRQ[0] = 0x3007FA0;
    this.registers[13] = 0x3007F00;
    this.registers[15] = 0x8000000;
    this.modeFlags = this.modeFlags | 0x1f;
}
GameBoyAdvanceCPU.prototype.branch = function (branchTo) {
    branchTo = branchTo | 0;
    //if ((branchTo | 0) > 0x3FFF || this.IOCore.BIOSFound) {
        //Branch to new address:
        this.registers[15] = branchTo | 0;
        //Mark pipeline as invalid:
        this.IOCore.flagBubble();
        //Next PC fetch has to update the address bus:
        this.wait.NonSequentialBroadcastClear();
    /*}
    else {
        //We're branching into BIOS, handle specially:
        if ((branchTo | 0) == 0x130) {
            //IRQ mode exit handling:
            //ROM IRQ handling returns back from its own subroutine back to BIOS at this address.
            this.HLEIRQExit();
        }
        else {
            //Reset to start of ROM if no BIOS ROM found:
            this.HLEReset();
        }
    }*/
}
GameBoyAdvanceCPU.prototype.triggerIRQ = function (didFire) {
    this.triggeredIRQ = didFire | 0;
    this.assertIRQ();
}
GameBoyAdvanceCPU.prototype.assertIRQ = function () {
    if ((this.triggeredIRQ | 0) != 0 && (this.modeFlags & 0x80) == 0) {
        this.IOCore.flagIRQ();
    }
}
GameBoyAdvanceCPU.prototype.getCurrentFetchValue = function () {
    if ((this.modeFlags & 0x20) != 0) {
        return this.THUMB.getCurrentFetchValue() | 0;
    }
    else {
        return this.ARM.getCurrentFetchValue() | 0;
    }
}
GameBoyAdvanceCPU.prototype.enterARM = function () {
    this.modeFlags = this.modeFlags & 0xdf;
    this.THUMBBitModify(false);
}
GameBoyAdvanceCPU.prototype.enterTHUMB = function () {
    this.modeFlags = this.modeFlags | 0x20;
    this.THUMBBitModify(true);
}
GameBoyAdvanceCPU.prototype.getLR = function () {
    //Get the previous instruction address:
    if ((this.modeFlags & 0x20) != 0) {
        return this.THUMB.getLR() | 0;
    }
    else {
        return this.ARM.getLR() | 0;
    }
}
GameBoyAdvanceCPU.prototype.THUMBBitModify = function (isThumb) {
    if (isThumb) {
        this.IOCore.flagTHUMB();
    }
    else {
        this.IOCore.deflagTHUMB();
    }
}
GameBoyAdvanceCPU.prototype.IRQinARM = function () {
    //Mode bits are set to IRQ:
    this.switchMode(0x12);
    //Save link register:
    this.registers[14] = this.ARM.getIRQLR() | 0;
    //Disable IRQ:
    this.modeFlags = this.modeFlags | 0x80;
    //if (this.IOCore.BIOSFound) {
        //IRQ exception vector:
        this.branch(0x18);
    /*}
    else {
        //HLE the IRQ entrance:
        this.HLEIRQEnter();
    }*/
    //Deflag IRQ from state:
    this.IOCore.deflagIRQ();
}
GameBoyAdvanceCPU.prototype.IRQinTHUMB = function () {
    //Mode bits are set to IRQ:
    this.switchMode(0x12);
    //Save link register:
    this.registers[14] = this.THUMB.getIRQLR() | 0;
    //Disable IRQ:
    this.modeFlags = this.modeFlags | 0x80;
    //Exception always enter ARM mode:
    this.enterARM();
    //if (this.IOCore.BIOSFound) {
        //IRQ exception vector:
        this.branch(0x18);
    /*}
    else {
        //HLE the IRQ entrance:
        this.HLEIRQEnter();
    }*/
    //Deflag IRQ from state:
    this.IOCore.deflagIRQ();
}
GameBoyAdvanceCPU.prototype.HLEIRQEnter = function () {
    //Get the base address:
    var currentAddress = this.registers[0xD] | 0;
    //Updating the address bus away from PC fetch:
    this.wait.NonSequentialBroadcast();
    //Push register(s) into memory:
    for (var rListPosition = 0xF; (rListPosition | 0) > -1; rListPosition = ((rListPosition | 0) - 1) | 0) {
            if ((0x500F & (1 << (rListPosition | 0))) != 0) {
                //Push a register into memory:
                currentAddress = ((currentAddress | 0) - 4) | 0;
                this.memory.memoryWrite32(currentAddress | 0, this.registers[rListPosition | 0] | 0);
            }
    }
    //Store the updated base address back into register:
    this.registers[0xD] = currentAddress | 0;
    //Updating the address bus back to PC fetch:
    this.wait.NonSequentialBroadcast();
    this.registers[0] = 0x4000000;
    //Save link register:
    this.registers[14] = 0x130;
    //Skip BIOS ROM processing:
    this.branch(this.read32(0x3FFFFFC) & -0x4);
}
GameBoyAdvanceCPU.prototype.HLEIRQExit = function () {
    //Get the base address:
    var currentAddress = this.registers[0xD] | 0;
    //Updating the address bus away from PC fetch:
    this.wait.NonSequentialBroadcast();
    //Load register(s) from memory:
    for (var rListPosition = 0; (rListPosition | 0) < 0x10;  rListPosition = ((rListPosition | 0) + 1) | 0) {
        if ((0x500F & (1 << (rListPosition | 0))) != 0) {
            //Load a register from memory:
            this.registers[rListPosition & 0xF] = this.memory.memoryRead32(currentAddress | 0) | 0;
            currentAddress = ((currentAddress | 0) + 4) | 0;
        }
    }
    //Store the updated base address back into register:
    this.registers[0xD] = currentAddress | 0;
    //Updating the address bus back to PC fetch:
    this.wait.NonSequentialBroadcast();
    //Return from an exception mode:
    var data = this.branchFlags.setSUBFlags(this.registers[0xE] | 0, 4) | 0;
    //Restore SPSR to CPSR:
    data = data & (-4 >> (this.SPSRtoCPSR() >> 5));
    //We performed a branch:
    this.branch(data | 0);
}
GameBoyAdvanceCPU.prototype.SWI = function () {
    //if (this.IOCore.BIOSFound) {
        //Mode bits are set to SWI:
        this.switchMode(0x13);
        //Save link register:
        this.registers[14] = this.getLR() | 0;
        //Disable IRQ:
        this.modeFlags = this.modeFlags | 0x80;
        //Exception always enter ARM mode:
        this.enterARM();
        //SWI exception vector:
        this.branch(0x8);
    /*}
    else {
        if ((this.modeFlags & 0x20) != 0) {
            this.THUMB.incrementProgramCounter();
            //HLE the SWI command:
            this.swi.execute(this.THUMB.getSWICode() | 0);
        }
        else {
            this.ARM.incrementProgramCounter();
            //HLE the SWI command:
            this.swi.execute(this.ARM.getSWICode() | 0);
        }
    }*/
}
GameBoyAdvanceCPU.prototype.UNDEFINED = function () {
    //Only process undefined instruction if BIOS loaded:
    //if (this.IOCore.BIOSFound) {
        //Mode bits are set to SWI:
        this.switchMode(0x1B);
        //Save link register:
        this.registers[14] = this.getLR() | 0;
        //Disable IRQ:
        this.modeFlags = this.modeFlags | 0x80;
        //Exception always enter ARM mode:
        this.enterARM();
        //Undefined exception vector:
        this.branch(0x4);
    /*}
    else {
        //Pretend we didn't execute the bad instruction then:
        if ((this.modeFlags & 0x20) != 0) {
            this.THUMB.incrementProgramCounter();
        }
        else {
            this.ARM.incrementProgramCounter();
        }
    }*/
}
GameBoyAdvanceCPU.prototype.SPSRtoCPSR = function () {
    //Used for leaving an exception and returning to the previous state:
    var bank = 1;
    switch (this.modeFlags & 0x1f) {
        case 0x12:    //IRQ
            break;
        case 0x13:    //Supervisor
            bank = 2;
            break;
        case 0x11:    //FIQ
            bank = 0;
            break;
        case 0x17:    //Abort
            bank = 3;
            break;
        case 0x1B:    //Undefined
            bank = 4;
            break;
        default:      //User & system lacks SPSR
            return this.modeFlags & 0x20;
    }
    var spsr = this.SPSR[bank | 0] | 0;
    this.branchFlags.setNZCV(spsr << 20);
    this.switchRegisterBank(spsr & 0x1F);
    this.modeFlags = spsr & 0xFF;
    this.assertIRQ();
    this.THUMBBitModify((spsr & 0x20) != 0);
    return spsr & 0x20;
}
GameBoyAdvanceCPU.prototype.switchMode = function (newMode) {
    newMode = newMode | 0;
    this.CPSRtoSPSR(newMode | 0);
    this.switchRegisterBank(newMode | 0);
    this.modeFlags = (this.modeFlags & 0xe0) | (newMode | 0);
}
GameBoyAdvanceCPU.prototype.CPSRtoSPSR = function (newMode) {
    //Used for entering an exception and saving the previous state:
    var spsr = this.modeFlags & 0xFF;
    spsr = spsr | (this.branchFlags.getNZCV() >> 20);
    switch (newMode | 0) {
        case 0x12:    //IRQ
            this.SPSR[1] = spsr | 0;
            break;
        case 0x13:    //Supervisor
            this.SPSR[2] = spsr | 0;
            break;
        case 0x11:    //FIQ
            this.SPSR[0] = spsr | 0;
            break;
        case 0x17:    //Abort
            this.SPSR[3] = spsr | 0;
            break;
        case 0x1B:    //Undefined
            this.SPSR[4] = spsr | 0;
    }
}
GameBoyAdvanceCPU.prototype.switchRegisterBank = function (newMode) {
    newMode = newMode | 0;
    switch (this.modeFlags & 0x1F) {
        case 0x10:
        case 0x1F:
            this.registersUSR[0] = this.registers[8] | 0;
            this.registersUSR[1] = this.registers[9] | 0;
            this.registersUSR[2] = this.registers[10] | 0;
            this.registersUSR[3] = this.registers[11] | 0;
            this.registersUSR[4] = this.registers[12] | 0;
            this.registersUSR[5] = this.registers[13] | 0;
            this.registersUSR[6] = this.registers[14] | 0;
            break;
        case 0x11:
            this.registersFIQ[0] = this.registers[8] | 0;
            this.registersFIQ[1] = this.registers[9] | 0;
            this.registersFIQ[2] = this.registers[10] | 0;
            this.registersFIQ[3] = this.registers[11] | 0;
            this.registersFIQ[4] = this.registers[12] | 0;
            this.registersFIQ[5] = this.registers[13] | 0;
            this.registersFIQ[6] = this.registers[14] | 0;
            break;
        case 0x12:
            this.registersUSR[0] = this.registers[8] | 0;
            this.registersUSR[1] = this.registers[9] | 0;
            this.registersUSR[2] = this.registers[10] | 0;
            this.registersUSR[3] = this.registers[11] | 0;
            this.registersUSR[4] = this.registers[12] | 0;
            this.registersIRQ[0] = this.registers[13] | 0;
            this.registersIRQ[1] = this.registers[14] | 0;
            break;
        case 0x13:
            this.registersUSR[0] = this.registers[8] | 0;
            this.registersUSR[1] = this.registers[9] | 0;
            this.registersUSR[2] = this.registers[10] | 0;
            this.registersUSR[3] = this.registers[11] | 0;
            this.registersUSR[4] = this.registers[12] | 0;
            this.registersSVC[0] = this.registers[13] | 0;
            this.registersSVC[1] = this.registers[14] | 0;
            break;
        case 0x17:
            this.registersUSR[0] = this.registers[8] | 0;
            this.registersUSR[1] = this.registers[9] | 0;
            this.registersUSR[2] = this.registers[10] | 0;
            this.registersUSR[3] = this.registers[11] | 0;
            this.registersUSR[4] = this.registers[12] | 0;
            this.registersABT[0] = this.registers[13] | 0;
            this.registersABT[1] = this.registers[14] | 0;
            break;
        case 0x1B:
            this.registersUSR[0] = this.registers[8] | 0;
            this.registersUSR[1] = this.registers[9] | 0;
            this.registersUSR[2] = this.registers[10] | 0;
            this.registersUSR[3] = this.registers[11] | 0;
            this.registersUSR[4] = this.registers[12] | 0;
            this.registersUND[0] = this.registers[13] | 0;
            this.registersUND[1] = this.registers[14] | 0;
    }
    switch (newMode | 0) {
        case 0x10:
        case 0x1F:
            this.registers[8] = this.registersUSR[0] | 0;
            this.registers[9] = this.registersUSR[1] | 0;
            this.registers[10] = this.registersUSR[2] | 0;
            this.registers[11] = this.registersUSR[3] | 0;
            this.registers[12] = this.registersUSR[4] | 0;
            this.registers[13] = this.registersUSR[5] | 0;
            this.registers[14] = this.registersUSR[6] | 0;
            break;
        case 0x11:
            this.registers[8] = this.registersFIQ[0] | 0;
            this.registers[9] = this.registersFIQ[1] | 0;
            this.registers[10] = this.registersFIQ[2] | 0;
            this.registers[11] = this.registersFIQ[3] | 0;
            this.registers[12] = this.registersFIQ[4] | 0;
            this.registers[13] = this.registersFIQ[5] | 0;
            this.registers[14] = this.registersFIQ[6] | 0;
            break;
        case 0x12:
            this.registers[8] = this.registersUSR[0] | 0;
            this.registers[9] = this.registersUSR[1] | 0;
            this.registers[10] = this.registersUSR[2] | 0;
            this.registers[11] = this.registersUSR[3] | 0;
            this.registers[12] = this.registersUSR[4] | 0;
            this.registers[13] = this.registersIRQ[0] | 0;
            this.registers[14] = this.registersIRQ[1] | 0;
            break;
        case 0x13:
            this.registers[8] = this.registersUSR[0] | 0;
            this.registers[9] = this.registersUSR[1] | 0;
            this.registers[10] = this.registersUSR[2] | 0;
            this.registers[11] = this.registersUSR[3] | 0;
            this.registers[12] = this.registersUSR[4] | 0;
            this.registers[13] = this.registersSVC[0] | 0;
            this.registers[14] = this.registersSVC[1] | 0;
            break;
        case 0x17:
            this.registers[8] = this.registersUSR[0] | 0;
            this.registers[9] = this.registersUSR[1] | 0;
            this.registers[10] = this.registersUSR[2] | 0;
            this.registers[11] = this.registersUSR[3] | 0;
            this.registers[12] = this.registersUSR[4] | 0;
            this.registers[13] = this.registersABT[0] | 0;
            this.registers[14] = this.registersABT[1] | 0;
            break;
        case 0x1B:
            this.registers[8] = this.registersUSR[0] | 0;
            this.registers[9] = this.registersUSR[1] | 0;
            this.registers[10] = this.registersUSR[2] | 0;
            this.registers[11] = this.registersUSR[3] | 0;
            this.registers[12] = this.registersUSR[4] | 0;
            this.registers[13] = this.registersUND[0] | 0;
            this.registers[14] = this.registersUND[1] | 0;
    }
}
if (typeof Math.imul == "function") {
    //Math.imul found, insert the optimized path in:
    GameBoyAdvanceCPU.prototype.calculateMUL32 = Math.imul;
}
else {
    //Math.imul not found, use the compatibility method:
    GameBoyAdvanceCPU.prototype.calculateMUL32 = function (rs, rd) {
        rs = rs | 0;
        rd = rd | 0;
        /*
         We have to split up the 32 bit multiplication,
         as JavaScript does multiplication on the FPU
         as double floats, which drops the low bits
         rather than the high bits.
         */
        var lowMul = (rs & 0xFFFF) * rd;
        var highMul = (rs >> 16) * rd;
        //Cut off bits above bit 31 and return with proper sign:
        return ((highMul << 16) + lowMul) | 0;
    }
}
GameBoyAdvanceCPU.prototype.performMUL32 = function (rs, rd) {
    rs = rs | 0;
    rd = rd | 0;
    //Predict the internal cycle time:
    if ((rd >>> 8) == 0 || (rd >>> 8) == 0xFFFFFF) {
        this.IOCore.wait.CPUInternalSingleCyclePrefetch();
    }
    else if ((rd >>> 16) == 0 || (rd >>> 16) == 0xFFFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(2);
    }
    else if ((rd >>> 24) == 0 || (rd >>> 24) == 0xFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(3);
    }
    else {
        this.IOCore.wait.CPUInternalCyclePrefetch(4);
    }
    return this.calculateMUL32(rs | 0, rd | 0) | 0;
}
GameBoyAdvanceCPU.prototype.performMUL32MLA = function (rs, rd) {
    rs = rs | 0;
    rd = rd | 0;
    //Predict the internal cycle time:
    if ((rd >>> 8) == 0 || (rd >>> 8) == 0xFFFFFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(2);
    }
    else if ((rd >>> 16) == 0 || (rd >>> 16) == 0xFFFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(3);
    }
    else if ((rd >>> 24) == 0 || (rd >>> 24) == 0xFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(4);
    }
    else {
        this.IOCore.wait.CPUInternalCyclePrefetch(5);
    }
    return this.calculateMUL32(rs | 0, rd | 0) | 0;
}
GameBoyAdvanceCPU.prototype.performMUL64 = function (rs, rd) {
    rs = rs | 0;
    rd = rd | 0;
    //Predict the internal cycle time:
    if ((rd >>> 8) == 0 || (rd >>> 8) == 0xFFFFFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(2);
    }
    else if ((rd >>> 16) == 0 || (rd >>> 16) == 0xFFFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(3);
    }
    else if ((rd >>> 24) == 0 || (rd >>> 24) == 0xFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(4);
    }
    else {
        this.IOCore.wait.CPUInternalCyclePrefetch(5);
    }
    //Solve for the high word (Do FPU double divide to bring down high word into the low word):
    this.mul64ResultHigh = Math.floor((rs * rd) / 0x100000000) | 0;
    this.mul64ResultLow = this.calculateMUL32(rs | 0, rd | 0) | 0;
}
GameBoyAdvanceCPU.prototype.performMLA64 = function (rs, rd, mlaHigh, mlaLow) {
    rs = rs | 0;
    rd = rd | 0;
    mlaHigh = mlaHigh | 0;
    mlaLow = mlaLow | 0;
    //Predict the internal cycle time:
    if ((rd >>> 8) == 0 || (rd >>> 8) == 0xFFFFFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(3);
    }
    else if ((rd >>> 16) == 0 || (rd >>> 16) == 0xFFFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(4);
    }
    else if ((rd >>> 24) == 0 || (rd >>> 24) == 0xFF) {
        this.IOCore.wait.CPUInternalCyclePrefetch(5);
    }
    else {
        this.IOCore.wait.CPUInternalCyclePrefetch(6);
    }
    //Solve for the high word (Do FPU double divide to bring down high word into the low word):
    var mulTop = Math.floor((rs * rd) / 0x100000000) | 0;
    var dirty = (this.calculateMUL32(rs | 0, rd | 0) >>> 0) + (mlaLow >>> 0);
    this.mul64ResultHigh = ((mulTop | 0) + (mlaHigh | 0) + Math.floor(dirty / 0x100000000)) | 0;
    this.mul64ResultLow = dirty | 0;
}
GameBoyAdvanceCPU.prototype.performUMUL64 = function (rs, rd) {
    rs = rs | 0;
    rd = rd | 0;
    //Predict the internal cycle time:
    if ((rd >>> 8) == 0) {
        this.IOCore.wait.CPUInternalCyclePrefetch(2);
    }
    else if ((rd >>> 16) == 0) {
        this.IOCore.wait.CPUInternalCyclePrefetch(3);
    }
    else if ((rd >>> 24) == 0) {
        this.IOCore.wait.CPUInternalCyclePrefetch(4);
    }
    else {
        this.IOCore.wait.CPUInternalCyclePrefetch(5);
    }
    //Solve for the high word (Do FPU double divide to bring down high word into the low word):
    this.mul64ResultHigh = (((rs >>> 0) * (rd >>> 0)) / 0x100000000) | 0;
    this.mul64ResultLow = this.calculateMUL32(rs | 0, rd | 0) | 0;
}
GameBoyAdvanceCPU.prototype.performUMLA64 = function (rs, rd, mlaHigh, mlaLow) {
    rs = rs | 0;
    rd = rd | 0;
    mlaHigh = mlaHigh | 0;
    mlaLow = mlaLow | 0;
    //Predict the internal cycle time:
    if ((rd >>> 8) == 0) {
        this.IOCore.wait.CPUInternalCyclePrefetch(3);
    }
    else if ((rd >>> 16) == 0) {
        this.IOCore.wait.CPUInternalCyclePrefetch(4);
    }
    else if ((rd >>> 24) == 0) {
        this.IOCore.wait.CPUInternalCyclePrefetch(5);
    }
    else {
        this.IOCore.wait.CPUInternalCyclePrefetch(6);
    }
    //Solve for the high word (Do FPU double divide to bring down high word into the low word):
    var mulTop = Math.floor(((rs >>> 0) * (rd >>> 0)) / 0x100000000) | 0;
    var dirty = (this.calculateMUL32(rs | 0, rd | 0) >>> 0) + (mlaLow >>> 0);
    this.mul64ResultHigh = ((mulTop | 0) + (mlaHigh | 0) + Math.floor(dirty / 0x100000000)) | 0;
    this.mul64ResultLow = dirty | 0;
}
GameBoyAdvanceCPU.prototype.write32 = function (address, data) {
    address = address | 0;
    data = data | 0;
    //Updating the address bus away from PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    this.memory.memoryWrite32(address | 0, data | 0);
    //Updating the address bus back to PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
}
GameBoyAdvanceCPU.prototype.write16 = function (address, data) {
    address = address | 0;
    data = data | 0;
    //Updating the address bus away from PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    this.memory.memoryWrite16(address | 0, data | 0);
    //Updating the address bus back to PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
}
GameBoyAdvanceCPU.prototype.write8 = function (address, data) {
    address = address | 0;
    data = data | 0;
    //Updating the address bus away from PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    this.memory.memoryWrite8(address | 0, data | 0);
    //Updating the address bus back to PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
}
GameBoyAdvanceCPU.prototype.read32 = function (address) {
    address = address | 0;
    //Updating the address bus away from PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    var data = this.memory.memoryRead32(address | 0) | 0;
    //Unaligned access gets data rotated right:
    if ((address & 0x3) != 0) {
        //Rotate word right:
        data = (data << ((4 - (address & 0x3)) << 3)) | (data >>> ((address & 0x3) << 3));
    }
    //Updating the address bus back to PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    return data | 0;
}
GameBoyAdvanceCPU.prototype.read16 = function (address) {
    address = address | 0;
    //Updating the address bus away from PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    var data = this.memory.memoryRead16(address | 0) | 0;
    //Unaligned access gets data rotated right:
    if ((address & 0x1) != 0) {
        //Rotate word right:
        data = (data << 24) | (data >>> 8);
    }
    //Updating the address bus back to PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    return data | 0;
}
GameBoyAdvanceCPU.prototype.readSigned16 = function (address) {
    address = address | 0;
    //Updating the address bus away from PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    var data = this.memory.memoryRead16(address | 0) << 16;
    //Unaligned access gets sign extended:
	data = data >> ((16 + ((address & 0x1) << 3)) | 0);
    //Updating the address bus back to PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    return data | 0;
}
GameBoyAdvanceCPU.prototype.read8 = function (address) {
    address = address | 0;
    //Updating the address bus away from PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    var data = this.memory.memoryRead8(address | 0) | 0;
    //Updating the address bus back to PC fetch:
    this.IOCore.wait.NonSequentialBroadcast();
    return data | 0;
}
//emulator
"use strict";
/*
 Copyright (C) 2012-2019 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function GameBoyAdvanceEmulator() {
    this.settings = {
        SKIPBoot:false,                   //Skip the BIOS boot screen.
        audioBufferUnderrunLimit:100,     //Audio buffer minimum span amount over x milliseconds.
        audioBufferDynamicLimit:32,       //Audio buffer dynamic minimum span amount over x milliseconds.
        audioBufferSize:300,              //Audio buffer maximum span amount over x milliseconds.
        emulatorSpeed:1.0,                //Speed multiplier of the emulator.
        metricCollectionMinimum:500,      //How many milliseconds of cycling to count before determining speed.
        dynamicSpeed:false,               //Whether to actively change the target speed for best user experience.
        overclockBlockLimit:200,          //Whether to throttle clocks in audio adjustment.
        offthreadGfxEnabled:true          //Whether to allow offthread graphics rendering if support is present.
    };
    this.audioFound = 0;                      //Do we have audio output sink found yet?
    this.emulatorStatus = 0x10;               //{paused, saves loaded, fault found, loaded}
    this.BIOS = [];                           //Initialize BIOS as not existing.
    this.ROM = [];                            //Initialize BIOS as not existing.
    this.audioUpdateState = 1;                //Do we need to update the sound core with new info?
    this.saveExportHandler = null;            //Save export handler attached by GUI.
    this.saveImportHandler = null;            //Save import handler attached by GUI.
    this.speedCallback = null;                //Speed report handler attached by GUI.
    this.playStatusCallback = null;           //Play status change handler attached by GUI.
    this.startCallbacks = [];                 //Some jobs to run at iteration head.
    this.endCallbacks = [];                   //Some jobs to run at iteration end.
    this.terminationCallbacks = [];           //Some jobs to run if the emulation core is killed.
    this.timerIntervalRate = 16;              //How often the emulator core is called into (in milliseconds).
    this.lastTimestamp = 0;                   //Track the last time given in milliseconds.
    this.dynamicSpeedRefresh = false;         //Whether speed is allowed to be changed dynamically in the current cycle.
    this.calculateTimings();                  //Calculate some multipliers against the core emulator timer.
    this.generateCoreExposed();               //Generate a limit API for the core to call this shell object.
}
GameBoyAdvanceEmulator.prototype.generateCoreExposed = function () {
    var parentObj = this;
    this.coreExposed = {
        outputAudio:function (l, r) {
            parentObj.outputAudio(l, r);
        },
        graphicsHandle:null,
        appendStartIterationSync:function (callback) {
            parentObj.startCallbacks.push(callback);
        },
        appendEndIterationSync:function (callback) {
            parentObj.endCallbacks.push(callback);
        },
        appendTerminationSync:function (callback) {
            parentObj.terminationCallbacks.push(callback);
        },
        offthreadGfxEnabled:function () {
            return !!parentObj.settings.offthreadGfxEnabled;
        }
    }
}
GameBoyAdvanceEmulator.prototype.play = function () {
    if ((this.emulatorStatus | 0) >= 0x10) {
        this.emulatorStatus = this.emulatorStatus & 0xF;
        if ((this.emulatorStatus & 0x1) == 0 && this.BIOS && this.ROM) {
            if ((this.initializeCore() | 0) == 0) {
                //Failure to initialize:
                this.pause();
                return;
            }
            this.importSave();
        }
        this.invalidateMetrics();
        this.setBufferSpace();
        //Report new status back:
        this.playStatusCallback(1);
    }
}
GameBoyAdvanceEmulator.prototype.pause = function () {
    if ((this.emulatorStatus | 0) < 0x10) {
        this.exportSave();
        this.emulatorStatus = this.emulatorStatus | 0x10;
        //Report new status back:
        this.playStatusCallback(0);
    }
}
GameBoyAdvanceEmulator.prototype.stop = function () {
    this.emulatorStatus = this.emulatorStatus & 0x1C;
    this.audioUpdateState = 1;
    this.pause();
}
GameBoyAdvanceEmulator.prototype.restart = function () {
    if ((this.emulatorStatus & 0x1) == 0x1) {
        this.emulatorStatus = this.emulatorStatus & 0x1D;
        this.exportSave();
        if ((this.initializeCore() | 0) == 0) {
            //Failure to initialize:
            this.pause();
            return;
        }
        this.importSave();
        this.audioUpdateState = 1;
        this.processNewSpeed(1);
        this.setBufferSpace();
    }
}
GameBoyAdvanceEmulator.prototype.timerCallback = function (lastTimestamp) {
    //Callback passes us a reference timestamp:
    this.lastTimestamp = lastTimestamp >>> 0;
    switch (this.emulatorStatus | 0) {
        //Core initialized and saves loaded:
        case 5:
            this.iterationStartSequence();                              //Run start of iteration stuff.
            this.IOCore.enter(this.CPUCyclesTotal | 0);                 //Step through the emulation core loop.
            this.iterationEndSequence();                                //Run end of iteration stuff.
            break;
        //Core initialized, but saves still loading:
        case 1:
            break;
        default:
            //Some pending error is preventing execution, so pause:
            this.pause();
    }
}
GameBoyAdvanceEmulator.prototype.iterationStartSequence = function () {
    this.calculateSpeedPercentage();                                    //Calculate the emulator realtime run speed heuristics.
    this.emulatorStatus = this.emulatorStatus | 0x2;                    //If the end routine doesn't unset this, then we are marked as having crashed.
    this.audioUnderrunAdjustment();                                     //If audio is enabled, look to see how much we should overclock by to maintain the audio buffer.
    this.audioPushNewState();                                           //Check to see if we need to update the audio core for any output changes.
    this.runStartJobs();                                                //Run various callbacks assigned from internal components.
}
GameBoyAdvanceEmulator.prototype.iterationEndSequence = function () {
    this.emulatorStatus = this.emulatorStatus & 0x1D;                   //If core did not throw while running, unset the fatal error flag.
    this.clockCyclesSinceStart = ((this.clockCyclesSinceStart | 0) + (this.CPUCyclesTotal | 0)) | 0;    //Accumulate tracking.
    this.submitAudioBuffer();                                           //Flush audio buffer to output.
    this.runEndJobs();                                                  //Run various callbacks assigned from internal components.
}
GameBoyAdvanceEmulator.prototype.runStartJobs = function () {
    var length = this.startCallbacks.length | 0;
    //Loop through all jobs:
    for (var index = 0; (index | 0) < (length | 0); index = ((index | 0) + 1) | 0) {
        //Run job:
        this.startCallbacks[index | 0]();
    }
}
GameBoyAdvanceEmulator.prototype.runEndJobs = function () {
    var length = this.endCallbacks.length | 0;
    //Loop through all jobs:
    for (var index = 0; (index | 0) < (length | 0); index = ((index | 0) + 1) | 0) {
        //Run job:
        this.endCallbacks[index | 0]();
    }
}
GameBoyAdvanceEmulator.prototype.runTerminationJobs = function () {
    var length = this.terminationCallbacks.length | 0;
    //Loop through all jobs:
    for (var index = 0; (index | 0) < (length | 0); index = ((index | 0) + 1) | 0) {
        //Run job:
        this.terminationCallbacks[index | 0]();
    }
    //Remove old jobs:
    this.startCallbacks = [];
    this.endCallbacks = [];
    this.terminationCallbacks = [];
}
GameBoyAdvanceEmulator.prototype.attachROM = function (ROM) {
    this.stop();
    this.ROM = ROM;
}
GameBoyAdvanceEmulator.prototype.attachBIOS = function (BIOS) {
    this.stop();
    this.BIOS = BIOS;
}
GameBoyAdvanceEmulator.prototype.getGameName = function () {
    if ((this.emulatorStatus & 0x3) == 0x1) {
        return this.IOCore.cartridge.name;
    }
    else {
        return "";
    }
}
GameBoyAdvanceEmulator.prototype.attachSaveExportHandler = function (handler) {
    if (typeof handler == "function") {
        this.saveExportHandler = handler;
    }
}
GameBoyAdvanceEmulator.prototype.attachSaveImportHandler = function (handler) {
    if (typeof handler == "function") {
        this.saveImportHandler = handler;
    }
}
GameBoyAdvanceEmulator.prototype.attachSpeedHandler = function (handler) {
    if (typeof handler == "function") {
        this.speedCallback = handler;
    }
}
GameBoyAdvanceEmulator.prototype.attachPlayStatusHandler = function (handler) {
    if (typeof handler == "function") {
        this.playStatusCallback = handler;
    }
}
GameBoyAdvanceEmulator.prototype.importSave = function () {
    if (this.saveImportHandler) {
        var name = this.getGameName();
        if (name != "") {
            var parentObj = this;
            this.emulatorStatus = this.emulatorStatus & 0x1B;
            this.saveImportHandler(name, function (save) {
                parentObj.emulatorStatus = parentObj.emulatorStatus & 0x1B;
                parentObj.saveImportHandler("TYPE_" + name, function (saveType) {
                    if (save && saveType && (parentObj.emulatorStatus & 0x3) == 0x1) {
                        var length = save.length | 0;
                        var convertedSave = getUint8Array(length | 0);
                        if ((length | 0) > 0) {
                            for (var index = 0; (index | 0) < (length | 0); index = ((index | 0) + 1) | 0) {
                                convertedSave[index | 0] = save[index | 0] & 0xFF;
                            }
                            //We used to save this code wrong, fix the error in old saves:
                            if ((saveType.length | 0) != 1) {
                                //0 is fallthrough "UNKNOWN" aka autodetect type:
                                parentObj.IOCore.saves.importSave(convertedSave, 0);
                            }
                            else {
                                parentObj.IOCore.saves.importSave(convertedSave, saveType[0] & 0xFF);
                            }
                            parentObj.emulatorStatus = parentObj.emulatorStatus | 0x4;
                        }
                    }
                }, function (){parentObj.emulatorStatus = parentObj.emulatorStatus | 0x4;});
            }, function (){parentObj.emulatorStatus = parentObj.emulatorStatus | 0x4;});
            return;
        }
    }
    this.emulatorStatus = this.emulatorStatus | 0x4;
}
GameBoyAdvanceEmulator.prototype.exportSave = function () {
    if (this.saveExportHandler && (this.emulatorStatus & 0x3) == 0x1) {
        var save = this.IOCore.saves.exportSave();
        var saveType = this.IOCore.saves.exportSaveType() | 0;
        if (save != null) {
            this.saveExportHandler(this.IOCore.cartridge.name, save);
            this.saveExportHandler("TYPE_" + this.IOCore.cartridge.name, [saveType | 0]);
        }
    }
}
GameBoyAdvanceEmulator.prototype.setSpeed = function (speed) {
    speed = +speed;
    //Dynamic Speed overrides custom speed levels:
    if (!this.settings.dynamicSpeed) {
        this.processNewSpeed(+speed);
    }
}
GameBoyAdvanceEmulator.prototype.processNewSpeed = function (speed) {
    speed = +speed;
    //0.003 for the integer resampler limitations, 0x3F for int math limitations:
    speed = +Math.min(Math.max(+speed, 0.003), 0x3F);
    if ((+speed) != (+this.settings.emulatorSpeed)) {
        this.settings.emulatorSpeed = +speed;
        this.calculateTimings();
    }
}
GameBoyAdvanceEmulator.prototype.incrementSpeed = function (delta) {
    delta = +delta;
    this.setSpeed((+delta) + (+this.settings.emulatorSpeed));
}
GameBoyAdvanceEmulator.prototype.getSpeed = function () {
    return +this.settings.emulatorSpeed;
}
GameBoyAdvanceEmulator.prototype.invalidateMetrics = function () {
    this.clockCyclesSinceStart = 0;
    this.metricStart = 0;
}
GameBoyAdvanceEmulator.prototype.resetMetrics = function () {
    this.clockCyclesSinceStart = 0;
    this.metricStart = this.lastTimestamp >>> 0;
}
GameBoyAdvanceEmulator.prototype.calculateTimings = function () {
    this.clocksPerSecond = Math.min((+this.settings.emulatorSpeed) * 0x1000000, 0x3F000000) | 0;
    this.clocksPerMilliSecond = +((this.clocksPerSecond | 0) / 1000);
    this.CPUCyclesPerIteration = ((+this.clocksPerMilliSecond) * (+this.timerIntervalRate)) | 0;
    this.CPUCyclesTotal = this.CPUCyclesPerIteration | 0;
    this.initializeAudioLogic();
    this.reinitializeAudio();
    this.invalidateMetrics();
}
GameBoyAdvanceEmulator.prototype.setIntervalRate = function (intervalRate) {
    intervalRate = +intervalRate;
    if ((+intervalRate) > 0 && (+intervalRate) < 1000) {
        if ((+intervalRate) != (+this.timerIntervalRate)) {
            this.timerIntervalRate = +intervalRate;
            this.calculateTimings();
        }
    }
}
GameBoyAdvanceEmulator.prototype.calculateSpeedPercentage = function () {
    if ((this.metricStart >>> 0) != 0) {
        var timeDiff = Math.max(((this.lastTimestamp >>> 0) - (this.metricStart >>> 0)) | 0, 1) >>> 0;
        if ((timeDiff >>> 0) >= (this.settings.metricCollectionMinimum | 0)) {
            if (this.speedCallback) {
                var result = ((this.clockCyclesSinceStart | 0) * 100000) / ((timeDiff >>> 0) * 0x1000000);
                this.speedCallback(+result);
            }
            //Reset counter for speed check:
            this.resetMetrics();
            //Do a computation for dynamic speed this iteration:
            this.dynamicSpeedRefresh = true;
        }
        else {
            //Postpone any dynamic speed changes this iteration:
            this.dynamicSpeedRefresh = false;
        }
    }
    else {
        //Reset counter for speed check:
        this.resetMetrics();
        //Postpone any dynamic speed changes this iteration:
        this.dynamicSpeedRefresh = false;
    }
}
GameBoyAdvanceEmulator.prototype.initializeCore = function () {
    //Wrap up any old internal instance callbacks:
    this.runTerminationJobs();
    //Setup a new instance of the i/o core:
    this.IOCore = new GameBoyAdvanceIO(this.settings.SKIPBoot, this.coreExposed, this.BIOS, this.ROM);
    //Call the initalization procedure and get status code:
    var allowInit = this.IOCore.initialize() | 0;
    //Append status code as play status flag for emulator runtime:
    this.emulatorStatus = this.emulatorStatus | allowInit;
    return allowInit | 0;
}
GameBoyAdvanceEmulator.prototype.keyDown = function (keyPressed) {
    keyPressed = keyPressed | 0;
    if ((this.emulatorStatus | 0) < 0x10 && (keyPressed | 0) >= 0 && (keyPressed | 0) <= 9) {
        this.IOCore.joypad.keyPress(keyPressed | 0);
    }
}
GameBoyAdvanceEmulator.prototype.keyUp = function (keyReleased) {
    keyReleased = keyReleased | 0;
    if ((this.emulatorStatus | 0) < 0x10 && (keyReleased | 0) >= 0 && (keyReleased | 0) <= 9) {
        this.IOCore.joypad.keyRelease(keyReleased | 0);
    }
}
GameBoyAdvanceEmulator.prototype.attachGraphicsFrameHandler = function (handler) {
    if (typeof handler == "object") {
        this.coreExposed.graphicsHandle = handler;
    }
}
GameBoyAdvanceEmulator.prototype.attachAudioHandler = function (mixerInputHandler) {
    if (mixerInputHandler) {
        this.audio = mixerInputHandler;
    }
}
GameBoyAdvanceEmulator.prototype.enableAudio = function () {
    if ((this.audioFound | 0) == 0 && this.audio) {
        this.audioFound = 1;    //Set audio to 'found' by default.
        //Attempt to enable audio:
        var parentObj = this;
        this.audio.initialize(2, (this.clocksPerSecond | 0) / (this.audioResamplerFirstPassFactor | 0), Math.max((+this.clocksPerMilliSecond) * (this.settings.audioBufferSize | 0) / (this.audioResamplerFirstPassFactor | 0), 4) | 0, function () {
                //Not needed
            }, function () {
                //We manually check at the start of each timer interval, so not needed here.
            }, function () {
                //Disable audio in the callback here:
                parentObj.disableAudio();
        });
        this.audio.register();
    }
}
GameBoyAdvanceEmulator.prototype.disableAudio = function () {
    if ((this.audioFound | 0) != 0) {
        this.audio.unregister();
        this.audioFound = 0;
    }
}
GameBoyAdvanceEmulator.prototype.reinitializeAudio = function () {
    if ((this.audioFound | 0) != 0) {
        this.disableAudio();
        this.enableAudio();
    }
}
GameBoyAdvanceEmulator.prototype.initializeAudioLogic = function () {
    //Calculate the variables for the preliminary downsampler first:
    this.audioResamplerFirstPassFactor = Math.min(Math.floor((this.clocksPerSecond | 0) / 44100), Math.floor(0x7FFFFFFF / 0x3FF)) | 0;
    this.audioDownSampleInputDivider = +((2 / 0x3FF) / (this.audioResamplerFirstPassFactor | 0));
    this.initializeAudioBuffering();
    //Need to push the new resample factor:
    this.audioUpdateState = 1;
}
GameBoyAdvanceEmulator.prototype.initializeAudioBuffering = function () {
    this.audioDestinationPosition = 0;
    this.audioBufferContainAmount = Math.max((+this.clocksPerMilliSecond) * (this.settings.audioBufferUnderrunLimit | 0) / (this.audioResamplerFirstPassFactor | 0), 3) << 1;
    this.audioBufferOverclockBlockAmount = Math.max((+this.clocksPerMilliSecond) * (this.settings.overclockBlockLimit | 0) / (this.audioResamplerFirstPassFactor | 0), 3) << 1;
    this.audioBufferDynamicContainAmount = Math.max((+this.clocksPerMilliSecond) * (this.settings.audioBufferDynamicLimit | 0) / (this.audioResamplerFirstPassFactor | 0), 2) << 1;
    //Underrun logic will request at most 32 milliseconds of runtime per iteration, so set buffer size to 64 ms:
    var audioNumSamplesTotal = Math.max(((+this.clocksPerMilliSecond) / (this.audioResamplerFirstPassFactor | 0)) << 6, 4) << 1;
    if (!this.audioBuffer || ((audioNumSamplesTotal | 0) > (this.audioBuffer.length | 0))) {
        //Only regen buffer if the size is increased:
        this.audioBuffer = getFloat32Array(audioNumSamplesTotal | 0);
    }
}
GameBoyAdvanceEmulator.prototype.outputAudio = function (downsampleInputLeft, downsampleInputRight) {
    downsampleInputLeft = downsampleInputLeft | 0;
    downsampleInputRight = downsampleInputRight | 0;
    this.audioBuffer[this.audioDestinationPosition | 0] = ((downsampleInputLeft | 0) * (+this.audioDownSampleInputDivider)) - 1;
    this.audioDestinationPosition = ((this.audioDestinationPosition | 0) + 1) | 0;
    this.audioBuffer[this.audioDestinationPosition | 0] = ((downsampleInputRight | 0) * (+this.audioDownSampleInputDivider)) - 1;
    this.audioDestinationPosition = ((this.audioDestinationPosition | 0) + 1) | 0;
}
GameBoyAdvanceEmulator.prototype.submitAudioBuffer = function () {
    if ((this.audioFound | 0) != 0) {
        this.audio.push(this.audioBuffer, 0, this.audioDestinationPosition | 0);
    }
    this.audioDestinationPosition = 0;
}
GameBoyAdvanceEmulator.prototype.audioUnderrunAdjustment = function () {
    this.CPUCyclesTotal = this.CPUCyclesPerIteration | 0;
    if ((this.audioFound | 0) != 0) {
        var remainingAmount = this.audio.remainingBuffer();
        if (typeof remainingAmount == "number") {
            remainingAmount = Math.max(remainingAmount | 0, 0) | 0;
            var underrunAmount = ((this.audioBufferContainAmount | 0) - (remainingAmount | 0)) | 0;
            if ((underrunAmount | 0) > 0) {
                if (this.dynamicSpeedRefresh && this.settings.dynamicSpeed) {
                    if (((this.audioBufferDynamicContainAmount | 0) - (remainingAmount | 0)) > 0) {
                        var speed = +this.getSpeed();
                        speed = Math.max((+speed) - 0.1, 0.003);
                        this.processNewSpeed(+speed);
                    }
                }
                this.CPUCyclesTotal = Math.min(((this.CPUCyclesTotal | 0) + ((underrunAmount >> 1) * (this.audioResamplerFirstPassFactor | 0))) | 0, (+this.clocksPerMilliSecond) << 5) | 0;
            }
            else {
                if (this.dynamicSpeedRefresh && this.settings.dynamicSpeed) {
                    var speed = +this.getSpeed();
                    if ((+speed) < 1) {
                        speed = +Math.min((+speed) + 0.01, 1);
                        this.processNewSpeed(+speed);
                    }
                }
                var overrunAmount = ((remainingAmount | 0) - (this.audioBufferOverclockBlockAmount | 0)) | 0;
                if ((overrunAmount | 0) > 0) {
                    this.CPUCyclesTotal = Math.max(((this.CPUCyclesTotal | 0) - ((overrunAmount >> 1) * (this.audioResamplerFirstPassFactor | 0))) | 0, 0) | 0;
                }
            }
        }
    }
}
GameBoyAdvanceEmulator.prototype.audioPushNewState = function () {
    if ((this.audioUpdateState | 0) != 0) {
        this.IOCore.sound.initializeOutput(this.audioResamplerFirstPassFactor | 0);
        this.audioUpdateState = 0;
    }
}
GameBoyAdvanceEmulator.prototype.setBufferSpace = function () {
    if ((this.audioFound | 0) != 0) {
        //Fill the audio system with zeros for buffer stabilization on start:
        this.audio.setBufferSpace(this.audioBufferContainAmount | 0);
    }
}
GameBoyAdvanceEmulator.prototype.toggleSkipBootROM = function (SKIPBoot) {
    this.settings.SKIPBoot = !!SKIPBoot;
}
GameBoyAdvanceEmulator.prototype.toggleDynamicSpeed = function (dynamicSpeed) {
    this.settings.dynamicSpeed = !!dynamicSpeed;
    this.processNewSpeed(1);
}
GameBoyAdvanceEmulator.prototype.toggleOffthreadGraphics = function (offthreadGfxEnabled) {
    this.settings.offthreadGfxEnabled = !!offthreadGfxEnabled;
}


// =====================================================================
// PUENTE DE COMPATIBILIDAD GLOBAL PARA EL MOTOR IODINEGBA
// =====================================================================
if (typeof GameBoyAdvanceEmulator !== "undefined") {
    window.GameBoyAdvanceEmulator = GameBoyAdvanceEmulator;
}

// Vinculación de los canales de hardware DMA críticos para initializeCore()
if (typeof GameBoyAdvanceDMA0 !== "undefined") window.GameBoyAdvanceDMA0 = GameBoyAdvanceDMA0;
if (typeof GameBoyAdvanceDMA1 !== "undefined") window.GameBoyAdvanceDMA1 = GameBoyAdvanceDMA1;
if (typeof GameBoyAdvanceDMA2 !== "undefined") window.GameBoyAdvanceDMA2 = GameBoyAdvanceDMA2;
if (typeof GameBoyAdvanceDMA3 !== "undefined") window.GameBoyAdvanceDMA3 = GameBoyAdvanceDMA3;

// Vinculación de periféricos adicionales y subsistemas de control
if (typeof GameBoyAdvanceCore !== "undefined") window.GameBoyAdvanceCore = GameBoyAdvanceCore;
if (typeof GameBoyAdvanceMemory !== "undefined") window.GameBoyAdvanceMemory = GameBoyAdvanceMemory;
if (typeof GameBoyAdvanceGraphics !== "undefined") window.GameBoyAdvanceGraphics = GameBoyAdvanceGraphics;
if (typeof GameBoyAdvanceSound !== "undefined") window.GameBoyAdvanceSound = GameBoyAdvanceSound;
if (typeof GameBoyAdvanceSaves !== "undefined") window.GameBoyAdvanceSaves = GameBoyAdvanceSaves;


// =====================================================================
// CONSTRUCTORES PUENTE PARA EL SUBSISTEMA DE GRÁFICOS Y RENDER
// =====================================================================
if (typeof GameBoyAdvanceRendererProxy === "undefined") {
    window.GameBoyAdvanceRendererProxy = function(IOCore) {
        this.IOCore = IOCore;
    };
    window.GameBoyAdvanceRendererProxy.prototype.initialize = function() {};
}

if (typeof GameBoyAdvanceRenderer === "undefined") {
    window.GameBoyAdvanceRenderer = function(IOCore) {
        this.IOCore = IOCore;
    };
    window.GameBoyAdvanceRenderer.prototype.initialize = function() {};
}

// =====================================================================
// CONSTRUCTOR PUENTE PARA EL SUBSISTEMA SERIAL (CABLE LINK)
// =====================================================================
if (typeof GameBoyAdvanceSerial === "undefined") {
    window.GameBoyAdvanceSerial = function(IOCore) {
        this.IOCore = IOCore;
    };
    window.GameBoyAdvanceSerial.prototype.initialize = function() {};
}

// =====================================================================
// BLOQUE DE COMPATIBILIDAD FINAL (CARTUCHO Y SUBSISTEMAS RESTANTES)
// =====================================================================

// 1. Lector de Cartucho (Soluciona el error actual)
if (typeof GameBoyAdvanceCartridge === "undefined") {
    window.GameBoyAdvanceCartridge = function(IOCore) {
        this.IOCore = IOCore;
    };
    window.GameBoyAdvanceCartridge.prototype.initialize = function() {};
}

// 2. Sistema de Guardado (Saves / SRAM / Flash / EEPROM)
if (typeof GameBoyAdvanceSaves === "undefined") {
    window.GameBoyAdvanceSaves = function(IOCore) {
        this.IOCore = IOCore;
    };
    window.GameBoyAdvanceSaves.prototype.initialize = function() {};
}

// 3. Manejador de Interrupciones de Hardware (IRQ)
if (typeof GameBoyAdvanceIRQ === "undefined") {
    window.GameBoyAdvanceIRQ = function(IOCore) {
        this.IOCore = IOCore;
    };
    window.GameBoyAdvanceIRQ.prototype.initialize = function() {};
}


// =====================================================================
// CONSTRUCTORES INTEGRALES PARA EL MOTOR DE AUDIO (SINTETIZADORES DE CANAL)
// =====================================================================

function generarCanalSynth() {
    var Canal = function(sound) {
        this.sound = sound;
        this.enabled = false;
        this.playing = false;
    };
    Canal.prototype.initialize = function() {};
    Canal.prototype.reset = function() {};
    Canal.prototype.disabled = function() { return !this.enabled; };
    Canal.prototype.enabledState = function() { return this.enabled; };
    Canal.prototype.outputLevelCache = function() { return 0; }; 
    
    // Soluciona el error actual de actualización de caché de hercios
    Canal.prototype.updateCache = function() {}; 
    Canal.prototype.clock = function() {};
    
    return Canal;
}

if (typeof GameBoyAdvanceChannel1Synth === "undefined") window.GameBoyAdvanceChannel1Synth = generarCanalSynth();
if (typeof GameBoyAdvanceChannel2Synth === "undefined") window.GameBoyAdvanceChannel2Synth = generarCanalSynth();
if (typeof GameBoyAdvanceChannel3Synth === "undefined") window.GameBoyAdvanceChannel3Synth = generarCanalSynth();
if (typeof GameBoyAdvanceChannel4Synth === "undefined") window.GameBoyAdvanceChannel4Synth = generarCanalSynth();
if (typeof GameBoyAdvanceChannel5Synth === "undefined") window.GameBoyAdvanceChannel5Synth = generarCanalSynth();
if (typeof GameBoyAdvanceChannel6Synth === "undefined") window.GameBoyAdvanceChannel6Synth = generarCanalSynth();

// =====================================================================
// CONSTRUCTOR PARA EL CHIP GPIO Y RELOJ DE TIEMPO REAL (RTC)
// =====================================================================
if (typeof GameBoyAdvanceGPIOChip === "undefined") {
    window.GameBoyAdvanceGPIOChip = function(IOCore) {
        this.IOCore = IOCore;
        this.direction = 0;
        this.device = null;
    };
    
    window.GameBoyAdvanceGPIOChip.prototype.initialize = function() {
        this.direction = 0;
        // Simulamos un dispositivo RTC básico para que el juego lea la hora del sistema
        this.device = {
            status: 0,
            command: 0,
            index: 0,
            read: function() { return 0; },
            write: function(val) {}
        };
    };

    window.GameBoyAdvanceGPIOChip.prototype.read = function(address) { return 0; };
    window.GameBoyAdvanceGPIOChip.prototype.write = function(address, val) {};
    window.GameBoyAdvanceGPIOChip.prototype.updateClock = function() {};
}

// =====================================================================
// SUBSISTEMA DE AUDIO FIFO - BLINDAJE ABSOLUTO DE MEMORIA
// =====================================================================
if (typeof GameBoyAdvanceFIFO === "undefined") {
    window.GameBoyAdvanceFIFO = function(IOCore) {
        this.IOCore = IOCore;
        
        // Creamos almacenes privados ocultos que sí son Arrays reales
        this._rawBufferA = [];
        this._rawBufferB = [];
        
        // Inicializamos las funciones necesarias directamente en los arrays privados
        this._rawBufferA.requestingDMA = function() { return false; };
        this._rawBufferB.requestingDMA = function() { return false; };
        this._rawBufferA.count = 0;
        this._rawBufferB.count = 0;

        // BINDING SEGURO: No importa qué haga el emulador, "FIFOABuffer" siempre devolverá un Array
        Object.defineProperty(this, 'FIFOABuffer', {
            get: function() { return this._rawBufferA; },
            set: function(val) { 
                // Si el emulador intenta pisar el buffer con un objeto plano {}, lo ignoramos
                // y mantenemos nuestro array intacto para evitar el crash.
                if (val && typeof val === 'object' && !Array.isArray(val)) {
                    return; 
                }
                this._rawBufferA = val || [];
            },
            configurable: true,
            enumerable: true
        });

        Object.defineProperty(this, 'FIFOBBuffer', {
            get: function() { return this._rawBufferB; },
            set: function(val) { 
                if (val && typeof val === 'object' && !Array.isArray(val)) {
                    return; 
                }
                this._rawBufferB = val || [];
            },
            configurable: true,
            enumerable: true
        });
    };
    
    window.GameBoyAdvanceFIFO.prototype.initialize = function() {
        this._rawBufferA = [];
        this._rawBufferB = [];
        this._rawBufferA.requestingDMA = function() { return false; };
        this._rawBufferB.requestingDMA = function() { return false; };
        this._rawBufferA.count = 0;
        this._rawBufferB.count = 0;
    };
    
    window.GameBoyAdvanceFIFO.prototype.clear = function() {
        this._rawBufferA = [];
        this._rawBufferB = [];
        this._rawBufferA.count = 0;
        this._rawBufferB.count = 0;
    };
}

// =====================================================================
// DETECTOR DE TIPO DE GUARDADO DE LA ROM (SAVE DETERMINER)
// =====================================================================
if (typeof GameBoyAdvanceSaveDeterminer === "undefined") {
    window.GameBoyAdvanceSaveDeterminer = function(IOCore) {
        this.IOCore = IOCore;
    };
    
    window.GameBoyAdvanceSaveDeterminer.prototype.initialize = function() {};
    
    // Método vital: Escanea la ROM en busca de cadenas como "FLASH_", "SRAM_" o "EEPROM_"
    // Retorna un código de tipo de guardado. Forzamos un retorno seguro o neutro (0)
    window.GameBoyAdvanceSaveDeterminer.prototype.determineSaveType = function() {
        // 0 por defecto delega la autodetección al archivo de guardado principal
        // Si Pokémon Rojo Fuego se queda en pantalla blanca al guardar, cambiaremos este return a 3 (Flash 128K)
        return 0; 
    };
}

// =====================================================================
// SUBSISTEMA DE CHIPS DE GUARDADO (SRAM / FLASH / EEPROM)
// =====================================================================

// 1. Chip SRAM (Soluciona el error actual)
if (typeof GameBoyAdvanceSRAMChip === "undefined") {
    window.GameBoyAdvanceSRAMChip = function(IOCore, size) {
        this.IOCore = IOCore;
        this.buffer = new Uint8Array(size || 0x10000); // 64KB estándar
    };
    window.GameBoyAdvanceSRAMChip.prototype.initialize = function() {};
    window.GameBoyAdvanceSRAMChip.prototype.read = function(address) { return this.buffer[address] || 0; };
    window.GameBoyAdvanceSRAMChip.prototype.write = function(address, val) { this.buffer[address] = val; };
}

// 2. Chip FLASH (Por si el core conmuta a Flash de 128KB para Pokémon)
if (typeof GameBoyAdvanceFLASHChip === "undefined") {
    window.GameBoyAdvanceFLASHChip = function(IOCore, size) {
        this.IOCore = IOCore;
        this.buffer = new Uint8Array(size || 0x20000); // 128KB para Rojo Fuego
    };
    window.GameBoyAdvanceFLASHChip.prototype.initialize = function() {};
    window.GameBoyAdvanceFLASHChip.prototype.read = function(address) { return this.buffer[address] || 0; };
    window.GameBoyAdvanceFLASHChip.prototype.write = function(address, val) { this.buffer[address] = val; };
}

// 3. Chip EEPROM
if (typeof GameBoyAdvanceEEPROMChip === "undefined") {
    window.GameBoyAdvanceEEPROMChip = function(IOCore) {
        this.IOCore = IOCore;
    };
    window.GameBoyAdvanceEEPROMChip.prototype.initialize = function() {};
    window.GameBoyAdvanceEEPROMChip.prototype.read = function() { return 0; };
    window.GameBoyAdvanceEEPROMChip.prototype.write = function(val) {};
}

// =====================================================================
// FUNCIÓN DE ATRIBUTOS DEL PROCESADOR CPU (ARM CPSR ATTRIBUTE TABLE)
// =====================================================================
// Cambiamos la matriz por una función de consulta directa para corregir 
// el error "is not a function" en el núcleo del intérprete de la CPU.
window.ARMCPSRAttributeTable = function(cpsrByte) {
    var mode = cpsrByte & 0x1F;
    // Validamos los modos nativos de la arquitectura ARM7TDMI
    if (mode === 0x10 || mode === 0x11 || mode === 0x12 || mode === 0x13 || mode === 0x17 || mode === 0x1B || mode === 0x1F) {
        return mode;
    }
    return 0x10; // Modo usuario por defecto ante flags corruptas o de arranque
};

// =====================================================================
// CONSTRUCTOR DEL CONJUNTO DE INSTRUCCIONES DE LA CPU (ARM INSTRUCTION SET)
// =====================================================================
if (typeof ARMInstructionSet === "undefined") {
    window.ARMInstructionSet = function(armCPU) {
        this.armCPU = armCPU;
        
        // Creamos la tabla real de ejecución dentro de la instancia
        this.table = new Array(4096);
        
        var funcionNOP = function(cpu, opcode) {
            cpu.nextInstructionType = 0;
        };
        
        for (var i = 0; i < 4096; i++) {
            this.table[i] = funcionNOP;
        }
    };
    
    // Inyectamos el método de ejecución por si la CPU lo invoca desde el prototipo
    window.ARMInstructionSet.prototype.execute = function(opcode) {
        if (this.table[opcode]) {
            this.table[opcode](this.armCPU, opcode);
        }
    };
}

// =====================================================================
// CONSTRUCTOR DEL CONJUNTO DE INSTRUCCIONES THUMB (THUMB INSTRUCTION SET)
// =====================================================================
if (typeof THUMBInstructionSet === "undefined") {
    window.THUMBInstructionSet = function(armCPU) {
        this.armCPU = armCPU;
        
        // El set THUMB utiliza un mapeo de 1024 combinaciones de opcodes (16-bits)
        this.table = new Array(1024);
        
        var funcionNOP = function(cpu, opcode) {
            cpu.nextInstructionType = 0;
        };
        
        for (var i = 0; i < 1024; i++) {
            this.table[i] = funcionNOP;
        }
    };
    
    // Método de ejecución por si el core del intérprete hace llamadas directas
    window.THUMBInstructionSet.prototype.execute = function(opcode) {
        if (this.table[opcode]) {
            this.table[opcode](this.armCPU, opcode);
        }
    };
}

// =====================================================================
// INYECCIÓN DIRECTA DE CALLBACKS DE CONTROL (PLAY STATUS)
// =====================================================================

// Intentamos inyectarlo directamente en los posibles constructores del Core
if (typeof GameBoyAdvance !== "undefined" && GameBoyAdvance.prototype) {
    GameBoyAdvance.prototype.playStatusCallback = function(status) {};
}

if (typeof IodineGBACore !== "undefined" && IodineGBACore.prototype) {
    IodineGBACore.prototype.playStatusCallback = function(status) {};
}

if (typeof IodineGBA !== "undefined" && IodineGBA.prototype) {
    IodineGBA.prototype.playStatusCallback = function(status) {};
}

// Por si acaso el core ejecuta en un contexto plano de objeto de control
if (!Object.prototype.playStatusCallback) {
    Object.defineProperty(Object.prototype, 'playStatusCallback', {
        value: function(status) {},
        writable: true, configurable: true
    });
}