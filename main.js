const express = require('express')
const port = 4000;
const app = express();
const fs = require('fs');
const bodyParser = require("body-parser");
const cors = require('cors');
const path = require("path");
const multer = require('multer');
const nodemailer = require('nodemailer')
const db_con=require('./config/database')
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'upload')));
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());
app.get("/upload", (req, res) => {
    res.render("index.html");

})
app.post("/upload", (req, res) => {
    console.log(req.file);
    res.json({ message: "Successfully uploaded files" });
    params = req.body;
});
async function readFile() {
    return new Promise((resolve) => {
        if (fs.existsSync('./dbfile')) {
            fs.readFile('./dbfile', "utf8", (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                resolve(JSON.parse(data));
            });
        } else {
            return resolve([]);
        }
    });
}
//image//
async function readFilephotos() {
    return new Promise((resolve) => {
        fs.readdir('./upload', (err, files) => {
            if (err) {
                console.log('Error reading directory:', err);
                return;
            }
            files.forEach((file) => {
                const imgpath = path.join('./upload', file);
                fs.readFile(imgpath, (err, files) => {
                    if (err) {
                        console.error('Error reading img:', err);
                        return;
                    }
                })
            });
            resolve(files)
        })

    })
}
const filestorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./upload");
    },
    filename: function (req, file, cb) {
        console.log("", file);
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: filestorageEngine });
app.post("/user/add", upload.single("profilename"), async (req, res) => {
    params = req.body;
    console.log("::::::add post", params);
    // return;
    let img = req.file.filename;
    params.phtos = img
    let getUserData = await readFile();
    getUserData.push(params);
    fs.writeFile('./dbfile', JSON.stringify(getUserData), (error) => {
        if (error) {
            console.log("Error:not create file");
            res.json({
                status: false,
                message: "not create file",
            });
        } else {
            console.log("data post");
        }
    })
    res.send(params);
});
//user//
app.get('/user/get', async (req, res) => {
    let getUserData = await readFile();
    let getPhotos = await readFilephotos();
    console.log("Successfully get");
    res.json({
        status: true,
        message: "user get successfully",
        data: getUserData,
        files: getPhotos,
    });
});
app.put("/user/update", upload.single("profilename"), async (req, res) => {
    params = req.body;
    console.log("params", params);
    let oldphoto = params.olduserphoto;
    if (params.profilename == 'undefined') {
        params.profilename = oldphoto;
    } else {
        let files = req.file.filename;
        console.log("files", files);
        params.profilename = files;

    }
    let updateUser = {
        id: params.id,
        UserName: params.UserName,
        Email: params.Email,
        MobileNo: params.MobileNo,
        userImage: params.profilename,
    };
    console.log("updateuser", updateUser);
    let getUserData = await readFile();
    console.log("get user data", getUserData)
    Object.keys(getUserData).forEach((data) => {
        console.log(":::::::id", getUserData[data].id)
        console.log(":::::::idparams", params.id)
        if (getUserData[data].id == params.id) {
            getUserData[data] = updateUser;
        }
    });
    // console.log("::::old new", getUserData)
    fs.writeFile("./dbfile", JSON.stringify(getUserData), (error) => {
        if (error) {
            console.log(error);
            res.json({
                status: false,
                msg: "file not create"
            });
        } else {
            res.json({
                status: true,
                msg: "data update",
                data: getUserData,
            });
        }
    });
    if (params.profilename !== oldphoto) {
        const deleteFile = `./upload/ $(params.olduserphoto)`;
        if (fs.existsSync(deleteFile)) {
            fs.unlink(deleteFile, (err) => {
                if (err) {
                    console.log(err);
                }
                console.log('deletefile');
            });
        }
    }
})
//email//
app.post("/sendmail",function(req,res){
    params=req.body;
    console.log("sendmail params",params);
    const template=fs.readFileSync('./email.html','utf-8');
    const emaildata={
        subject:'Welcome to Our Website!',
        name:'KomalPatel',
        description:'Happy Birthday to Dear...'
    };
    const personalizedContent=template
    .replace('{hiii}',emaildata.subject)
    .replace('{name}',emaildata.name)
    .replace('{description}',emaildata.description);
    let transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'komal.patel@creditt.in',
            pass: 'ilwgplqbzraoqeii',
        }
    })
    const mailoptions = {
        from: 'komal.patel@creditt.in',
        to: 'kartikpatel7892@gmail.com',
        subject: emaildata.subject,
        // cc:'manisha.thorat@creditt.in',
        html: personalizedContent,
    };
    transport.sendMail(mailoptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    })
    

})    
app.get("/sendmail",function(req,res){
    params=req.body;
    console.log(":::::::send mail",params);
    sendMail();
})
app.delete("/user/delete", async (req, res) => {
    let getuserData = await readFile();
    params = req.body;
    console.log(params.files);
    const filteredPeople = getuserData.filter((item) => item.id !== params.id);
    getuserData = filteredPeople;
    fs.writeFile("./dbfile", JSON.stringify(getuserData), (error) => {
        if (error) {
            console.log(error);
            res.json({
                status: false,
                msg: "file not create"
            });
        } else {
            res.json({
                status: true,
                msg: "data update",
                data: getuserData,
            });
        }
    });
    console.log("::::::::::delete", params.files);
    const filePath = `./upload/${params.files}`;
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (error) => {
            if (error) {
                res.status(500).send({
                    message: "Could not delete the file" + error,
                });
            }
        })
    }
})
app.listen(port, function (err) {
    if (err) console.log(err);
    console.log(`server is listening on PORT : //http://localhost:${port}`)
});