const { postAPI } = require("./axios");

const getrcom = (data)=> postAPI('/getrcom', data)

const sendrp = (data)=> postAPI('/sendrp', data)

const gethash = (data)=> postAPI('/gethash', data)

export {
       getrcom,
       sendrp,
       gethash
}