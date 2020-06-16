!(()=>{
    const randomNumber = (start, end, fixed=0) => {
        const differ = end - start;
        const random = Math.random();
        return (start + differ * random).toFixed(fixed);
    };
    const waitSecond = randomNumber(0, 30);
    setTimeout(()=>{
        try {
            $notification.post("lxhealth", "", "", "lswearable://");
        } catch (error) {
            console.log("lxhealth.alert.js - error:");
            console.log(error);
        }
    }, waitSecond*1000);
})();