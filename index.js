
const sharp = require('sharp');

/**
* 拼接图片
* @param  { Array<Sharp> } imgList
*/
async function joinImage(imgList) {
    let maxWidth = 0
    let maxHeight = 0
    const imgMetadataList = []
    // 获取所有图片的宽和高，计算和及最大值
    for (let i = 0; i < imgList.length; i++) {
        const { width, height } = await imgList[i].metadata()
        imgMetadataList.push({ width, height })
        maxHeight = Math.max(maxHeight, height)
        maxWidth = Math.max(maxWidth, width)
    }

    const baseOpt = {
        width: maxWidth,
        height: maxHeight,
        channels: 4,
        background: {
            r: 255, g: 255, b: 255, alpha: 1,
        },
    }

    const base = await sharp({
        create: baseOpt,
    }).jpeg().toBuffer()


    let top = (imgMetadataList[0].height - imgMetadataList[1].height) / 2 // 头像顶部距离
    let left = (imgMetadataList[0].width - imgMetadataList[1].width) / 2 // 头像左边距离

    let input1 = await imgList[0].toBuffer() // 二维码
    let input2 = await imgList[1].toBuffer() // 头像

    return sharp(base)
        .flatten({ background: '#ff6600' })
        .composite([
            { input: input1, width: 280, height: 280, channels: 4 }, // 二维码
            { input: input2, top, left, width: 126, height: 126, channels: 4 } // 头像
        ])
        .sharpen() // 锐化
        .withMetadata() // 带有元数据
}


void async function qc() {
    let qc = sharp('./images/小程序二维码.jpg')
        .resize(280, 280)

    const width = 126
    const r = width / 2
    const circleShape = Buffer.from(`<svg><circle cx="${r}" cy="${r}" r="${r}" /></svg>`)

    let avator = await sharp('./images/风景.jpg')
        .composite([{
            input: circleShape,
            blend: 'dest-in'
        }])
        .resize(width, width)
        .png()
        .toBuffer()
    avator = sharp(avator)

    let result = (await joinImage([qc, avator])).jpeg()
    result.toFile('qc.jpg', (err, info) => err ?
        console.error(err.message, 'err.message') :
        console.log(info)
    );

}()




// const width = 128,
//     r = width / 2,
//     circleShape = Buffer.from(`<svg><circle cx="${r}" cy="${r}" r="${r}" /></svg>`);

// sharp('./images/头像.jpg')
//     .resize(width, width)
//     .composite([{
//         input: circleShape,
//         blend: 'dest-in'
//     }])
//     .png()
//     .toFile('output.png', (err, info) => err ?
//         console.error(err.message) :
//         console.log(info)
//     );
