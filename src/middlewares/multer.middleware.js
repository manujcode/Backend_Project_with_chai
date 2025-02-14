import multer from "multer";


const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,"./Public/temp")
    },
    filename:(req, file, cb) => {
        cb(null, file.originalname)
    }

})

export const upload = multer({
    Storage,
})
