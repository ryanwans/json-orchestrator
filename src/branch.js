"use strict";

// BRANCH.JS COPYRIGHT (C) RYAN WANS 2020. ALL RIGHTS RESERVED. LICENSED UNDER MIT LICENSE.

var fs = require('fs');
var events = require('events');
var log = require('./fancy.ts');
const { METHODS } = require('http');

let GLOBALS = {
    eventHand: new events.EventEmitter(),
    options: new Object(),
    Return: null
};

/*
 * File Layout Design Plan
 * Place the main facade at the bottom of the file
 * Fill top of file with seperate, independent modules.
 * Unit & Module testing functionality at bottom
 * Main event loop goes last
 */

// ---------------- MODULES ----------------
var ModulePack = new Object,
    FacadePack = new Object;
// Plain Event
// 1) plain read
ModulePack['PlainRead'] = (targetFile, encoding, concurrent) => {
    let Time = Date.now();
    fs.readFile(targetFile, encoding, (Err, Data) => {
        if(Err) {
            return [false, Err];
        } else {
            Time = Date.now() - Time;
            GLOBALS.Return = [Data, Time];
            if(concurrent) {
                try {
                    concurrent(GLOBALS.Return);
                } catch(e) {
                    throw new Error("concurrent function passed threw an error: " + e);
                }
            }
        }
    });
    
};
// 2) plain write
ModulePack['PlainWrite'] = (targetFile, Data, encoding, concurrent) => {
    let Time = Date.now();
    if("string" != typeof Data) {Data = JSON.stringify(Data);};
    fs.writeFile(targetFile, Data, {encoding: encoding}, (Err) => {
        if(Err) {
            return [false, Err];
        } else {
            Time = Date.now() - Time;
            GLOBALS.Return = [true, Time];
            if(concurrent) {
                try {
                    concurrent(GLOBALS.Return);
                } catch(e) {
                    throw new Error("concurrent function passed threw an error: " + e);
                }
            }
        }
    });
}
// Syncing Events
// 1) synced read
ModulePack['SyncRead'] = (targetFile, encoding) => {
    let Time = Date.now();
    let data = fs.readFileSync(targetFile, {encoding: encoding});
    return [data, Date.now()-Time];
}
// 2) synced write
ModulePack['SyncWrite'] = (targetFile, Data, encoding) => {
    let Time = Date.now();
    if("string" != typeof Data) {Data = JSON.stringify(Data);};
    fs.writeFileSync(targetFile, Data, {encoding: encoding});
    return [null, Date.now()-Time];
}
// Streaming Events
// 1) streaming read
ModulePack['StreamRead'] = (targetFile, encoding, Alliance, OpenPipe, concurrent) => {
    let Time = Date.now();
    var Stream = fs.createReadStream(targetFile);
    Stream.setEncoding(encoding);
    if(OpenPipe) {Stream.pipe(OpenPipe);};
    Stream.on('data', (DataChunk) => {
        Alliance.ChunkConfig.PUSH(DataChunk);
        Alliance.AfterPush();
    });
    Stream.on('end', () => {
        Alliance.end(Date.now()-Time);
    });
    Stream.on('error', (error) => {
        Alliance.error(error);
        return [false, error];
    })
    if(concurrent) {
        try {
            concurrent();
        } catch(e) {
            throw new Error("concurrent function passed threw an error: " + e);
        }
    }
}
// 2) streaming write
ModulePack['StreamWrite'] = (targetFile, Data, encoding, Alliance, concurrent) => {
    let Time = Date.now();
    var Stream = fs.createWriteStream(targetFile);
    if("string" != typeof Data) {Data = JSON.stringify(Data);};
    Stream.write(Data, encoding);
    Stream.on('finish', () => {
        Alliance.end(Date.now()-Time);
    })
    Stream.on('error', (error) => {
        Alliance.error(error);
        return [false, error];
    })
    if(concurrent) {
        try {
            concurrent();
        } catch(e) {
            throw new Error("concurrent function passed threw an error: " + e);
        }
    }
    Stream.end();
}
// Compression Mechanisms
// Concurrent functions, or 'multithreading' is disabled becuase this should be done as a secondary action.
// 1) Rewrite file, compressed, using chained pipes
ModulePack['ChainCompress'] = (targetFile, CompressionMethod) => {
    fs.createReadStream(targetFile)
      .pipe(CompressionMethod())
      .pipe(targetFile);
}
// 2) Rewrite file, decompress, using chained piped
ModulePack['ChainDecompress'] = (targetFile, CompressionMethod) => {
    fs.createReadStream(targetFile)
      .pipe(CompressionMethod())
      .pipe(targetFile);
}
// Alliances: handling stream chunk data and stream start/stops.
ModulePack['Alliance'] = (Method, FinishEvent, CallbackAfterPush) => {
    this.ChunkArray = new Array();
    this.ChunkParams = new Object();
    this.ChunkConfig = {
        PUSH: (DataChunk) => {
            this.ChunkArray.push(DataChunk);
            return [true];
        },
        PULL: () => {
            return [this.ChunkArray];
        }
    };
    this.AfterPush = () => {CallbackAfterPush();};
    this.error = (ErrorMessage) => {throw new Error(ErrorMessage)};
    this.end = (Time) => {
        this.ChunkParams.Time = Time;
        this.ChunkParams.Now = Date.now();
        GLOBALS.eventHand.emit(FinishEvent);
        if(Method == "read") {
            return !1;
        } else {
            return true;
        }
    }
}
// ---------------- MODULE TESTING ----------------
ModulePack['TestModule'] = (Module) => {
    // fill later
};
// ---------------- FACADE ----------------
FacadePack['read'] = (Method, Target, Encoding, Concurrent, Pipe) => {
    if("plain" == Method || "normal" == Method || null == Method) {
        // Go for a plain read
        if(Concurrent) {
            var release = ModulePack.PlainRead(Target, Encoding, Concurrent);
            // log.info("Read operation took " + release[1] + "ms");
            // return release[0];
        } else {
            log.err("This function requires a callback parameter to receive your data.", 0);
        }
    } else if ("sync" == Method || "Sync" == Method) {
        // Go for synced read
        var release = ModulePack.SyncRead(Target, Encoding);
        log.info("Read operation took " + release[1] + "ms");
        return release[0];
    } else if ("stream" == Method || "Stream" == Method) {
        // Go for a stream
        if(Concurrent) {
            if(Pipe) {
                function TempHandlr() {log.info("Read operation completed");}
                GLOBALS.eventHand.on("FINISHIO", TempHandlr);
                var Alliance = new ModulePack.Alliance("read", "FINISHIO",()=>{return 0;});
                ModulePack.StreamRead(Target, Encoding, Alliance, Pipe, Concurrent);
                return Alliance.ChunkArray;
            } else {
                function TempHandlr() {log.info("Read operation completed");}
                GLOBALS.eventHand.on("FINISHIO", TempHandlr);
                var Alliance = new ModulePack.Alliance("read", "FINISHIO",()=>{return 0;});
                ModulePack.StreamRead(Target, Encoding, Alliance, 0, Concurrent);
                return Alliance.ChunkArray;
            }
        } else {
            if(Pipe) {
                function TempHandlr() {log.info("Read operation completed");}
                GLOBALS.eventHand.on("FINISHIO", TempHandlr);
                var Alliance = new ModulePack.Alliance("read", "FINISHIO",()=>{return 0;});
                ModulePack.StreamRead(Target, Encoding, Alliance, Pipe, 0);
                return Alliance.ChunkArray;
            } else {
                function TempHandlr() {log.info("Read operation completed");}
                GLOBALS.eventHand.on("FINISHIO", TempHandlr);
                var Alliance = new ModulePack.Alliance("read", "FINISHIO",()=>{return 0;});
                ModulePack.StreamRead(Target, Encoding, Alliance, 0, 0);
                return Alliance.ChunkArray;
            }
        }
    } else {
        if(Concurrent) {
            var release = ModulePack.PlainRead(Target, Encoding, Concurrent);
            log.info("Read operation took " + release[1] + "ms");
            return release[0];
        } else {
            var release = ModulePack.PlainRead(Target, Encoding);
            log.info("Read operation took " + release[1] + "ms");
            return release[0];
        }
    }
}
// ---------------- MAIN ----------------
// Include Exporting

/* REMOVE BEFORE FLIGHT */ 
module.exports = {
    modules: ModulePack,
    facade: FacadePack
};
/* REMOVE BEFORE FLIGHT */