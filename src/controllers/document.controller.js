const { documentList, document } = require("./../models");
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require('path');
const { request } = require("http");

// const base64ToImage = require("base64-to-image");
// const { calculateGoogleMapDistance } = require("./../utils/common.utils");
module.exports = {
    async getDocument(ctx, _next) {
        try {
            const documentData = await document.findAll({
                where: {
                    status: "Active",
                }
            })
            ctx.body = documentData;
        } catch (error) {
            ctx.body = error.message;
        }
    },
    async getDocumentDriver(ctx, _next) {
        try {
            const data = ctx.request.params
            console.log(data.id)
            const documentData = await documentList.findAll({
                where: {
                    doc_userid: data.id,
                    status: "Active",
                }
            })
            const docData = documentData.map(data => [{ ...data, iCabRequestId: response.null }]);
            ctx.body = documentData;
        } catch (error) {
            ctx.body = error.message;
        }
    },
    async uploadDocumentFile(ctx, _next) {
        try {
            const req = ctx.request.body
            const tmp = req.path
            const name = req.filename
            const type = req.mime
            let base64Data = tmp.replace(/^data:image\/[a-z]+;base64,/, "")
            let dir = String(req.doc_userid)
            const pathFile = path.join(__basedir, dir)
            fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
            fs.writeFile(path.join(pathFile, name), base64Data, 'base64', function (err) {
                console.log(err)
            })
            const list = {
                doc_masterid: req.doc_masterid, doc_file: `${name}`, doc_userid: req.doc_userid, doc_usertype: "driver", status: "inactive"
            }
            documentList.create(list)
            //         ctx.body = "upload success"
            ctx.body = ctx.request.body
        } catch (error) {
            ctx.body = error.message;
        }
    },

    async deleteDocument(ctx, _next) {

    }
    // async uploadDocument(ctx, _next) {
    //     try {
    //         const document = ctx.request.body
    //         let folder = document.doc_userid
    //         const dir = path.resolve(__dirname, '../../../hubexpress-prod/webimages/upload/documents/driver/' + folder)
    //         console.log({ dir, document })

    //         fs.writeFile(document.path, data.file, (err) => {
    //             if (err) {
    //                 return console.log(err);
    //             }
    //             console.log("The file was saved!");
    //             console.log(data.file)
    //         });
    //         fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
    //         // fs.mkdirSync(dir, { recursive: true });
    //         if (fs.existsSync(dir)) {
    //             console.log('Directory exists!');
    //         } else {
    //             fs.mkdirSync(dir);
    //             console.log('Directory not found.');
    //         }
    //         fs.copyFileSync(document.path, path.join(dir, document.filename))
    //         // fs.copyFileSync(document.path, `${dir}/` + document.filename)
    //         const list = { doc_masterid: document.doc_masterid, doc_file: document.filename, doc_userid: document.doc_userid, doc_usertype: "driver", status: "inactive" }
    //         documentList.create(list)
    //         ctx.body = "upload success"
    //     } catch (error) {
    //         ctx.body = error.message;
    //     }
    // },
};
