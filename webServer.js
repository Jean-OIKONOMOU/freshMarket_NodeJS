const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");

const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%ORIGIN%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  }
  return output;
};

// Getting and storing the templates
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

// reading the API data once. We're using the synchronous version of the readFile because we don't want the website to actual load before we get the data that we actually want to show. It must block the execution of the rest of the code. Any operation that only needs to be executed once should be sync as it's probably going to be at the top part of the code and give information vital to the website, just like what we're doing below.
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

// this is the event loop, this must be/contain async as this will be executed plenty of times. It's problematic that something we call all the time isn't async as it can easily block our application's main NodeJS thread.
const server = http.createServer((req, res) => {
  //res.end("Hello from the server " + req.url);
  console.log(req.url);
  const pathName = req.url;
  if (pathName === "/overview" || pathName === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);
  } else if (pathName === "/product") {
    res.end("this is the PRODUCT");
  } else if (pathName === "/api") {
    res.writeHead(200, { "Content-Type": "text/json" });
    res.end(data);
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
      "sample-Header": "exemple",
      "I-can-write-whatever": "haha",
    });
    res.end("<h1>404</h1>");
  }
});

let port = 8000;
server.listen(port, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
