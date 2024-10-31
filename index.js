const puppeteer = require('puppeteer')
const sharp = require('sharp')
const axios = require('axios')
const path = require('path')

async function downloadAndConvertImage(url, savePath) {
  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    })

    const buffer = Buffer.from(response.data, 'binary')

    await sharp(buffer).toFormat('webp').toFile(savePath)

    console.log(
      `Image downloaded and converted to webp successfully: ${savePath}`
    )
  } catch (error) {
    console.error(`Error downloading or converting the image: ${error}`)
  }
}

async function scrapeFirstImagesFromReactWebsite(websiteUrl) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(websiteUrl, { waitUntil: 'networkidle0' })

  const imageUrls = await page.evaluate(() => {
    // This is the selector for the doms that contain the images
    const targetDoms = document.querySelectorAll('.container-list-item')
    const urls = []
    // Loop through the doms and get the image URLs
    targetDoms.forEach((item) => {
      const imgElement = item.querySelector('img')
      if (imgElement) {
        urls.push(imgElement.src)
      }
    })
    return urls
  })

  if (imageUrls.length > 0) {
    for (const [index, imageUrl] of imageUrls.entries()) {
      const savePath = path.resolve(__dirname, `img/${index}.webp`)
      await downloadAndConvertImage(imageUrl, savePath)
    }
  } else {
    console.log('No images found in the specified DOMs.')
  }

  await browser.close()
}

// This is the URL of the website we want to scrape the images
const websiteUrl = 'https://www.designkit.com/puzzle/'
scrapeFirstImagesFromReactWebsite(websiteUrl)
