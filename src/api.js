const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let page;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  page = await browser.newPage();
})();

async function getFollowerCount(url) {
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const selector = "td.S_line1:nth-child(3) > strong";

  await page.waitForSelector(selector);
  let element = await page.$(selector);
  const text = await (await element.getProperty("textContent")).jsonValue();
  const strText = String(text);

  const hasWanChar = strText[strText.length - 1] === "万";

  if (hasWanChar) {
    const followerCountToNum = Number(strText.replace("万", ""));

    return followerCountToNum * 10000;
  }

  return Number(strText);
}

app.get("/wb_followers", async (req, res) => {
  const followers = await getFollowerCount(String(req.query.url));
  res.json({ wb_supertopic: followers });
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
