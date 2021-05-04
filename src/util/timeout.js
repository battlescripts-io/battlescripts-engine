async function timeoutImplementation(ms,f) {
    let timer = null;
    return new Promise(async(resolve)=>{
        timer = setTimeout(()=>{
            resolve({error:"timeout"});
        },ms);
        try {
            let val = await f();
            clearTimeout(timer);
            resolve(val);
        } catch(e) {
            resolve({error:e.message});
        }
    });
};

async function raceImplementation(ms,f) {
    return Promise.race([
        f(),
        new Promise((resolve) => setTimeout(() => resolve({error: "timeout"}), ms))
    ]);
};


module.exports = raceImplementation;
