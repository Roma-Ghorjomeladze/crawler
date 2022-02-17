const fs = require('fs');
const {join} = require('path');

const ROOT_URL = 'https://braendi-dog.online';
let graph = new Map();
let currentPageUrl = '';
let urls = [];
let LOOP_LIMIT = 1100;
const CONSTANT_LIMIT = LOOP_LIMIT;


function writeToFile(data) {
    const fileName = ROOT_URL.replace('http://', '').replace('https://', '').replaceAll('.', '_').replace('/', '_') + '.json';
    let json = [];
    data.forEach((value, key) => {
        json.push({...value, outDegrees: Array.from(value.outDegrees || []), referrer: Array.from(value.referrer)})
    })
    fs.writeFileSync(join(__dirname, 'data', fileName), JSON.stringify(json));
}

function getRedirectUrl(url) {
    if(!url) {
        return false;
    }
    if(url.includes('.png') || url.includes('.jpg')) {
        return false;
    }
    if(url.includes(ROOT_URL)) {
        return url;
    } else if(url.includes('http')) {
        return false;
    } else {
        return  url[0] == '/' ? ROOT_URL + url : ROOT_URL + '/' + url;
    }
}

function getHtmlFileName(pageUrl) {
    return pageUrl.replace(ROOT_URL, '').replaceAll('/', '_')+'.html';
}


function parseLinkString(link) {
    if(['/', '?', '&'].indexOf(link[link.length - 1]) >= 0) {
        return link.substring(0, link.length - 1);
    }
    return link.replaceAll('../', '').replace(ROOT_URL, '');
}


const scraperObject = {
    url: ROOT_URL,
    async scraper(browser){
        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
		console.log(`Navigating to ${this.url}...`);
		// Navigate to the selected page
		await page.goto(this.url);
        await page.waitForSelector('body');
        let links = await page.evaluate(
            () => Array.from(
                document.querySelectorAll('a[href]'),
                a => a.getAttribute('href')
            )
        );
        graph.set(this.url, {visited: true, id: 0, count: 1, href: this.url, referrer: new Set(), outDegrees: new Set(links) })
        const countOnMain = links.length;
        urls = [this.url, ...links];

        for(let j = 0; j < urls.length; j++) {
            const urlToGo = getRedirectUrl(urls[j]);
            if(!urlToGo) {
                continue;
            }
            const current = graph.get(urlToGo);
            if (current && current.visited) {
                continue;
            }
            console.log(`Navigating to  ${urlToGo} ...`, 'Visited  ', CONSTANT_LIMIT - LOOP_LIMIT)
            await page.goto(urlToGo);
            const html = await page.content();
            await fs.writeFileSync(join(__dirname, 'html', getHtmlFileName(urlToGo)), html)
            currentPageUrl = urlToGo;
            LOOP_LIMIT--;
           
            await page.waitForSelector('body');
            let links = await page.evaluate(
                () => Array.from(
                    document.querySelectorAll('a[href]'),
                    a => a.getAttribute('href')
                )
            );
            if(!current) {
                graph.set(urlToGo, {visited: true, id: CONSTANT_LIMIT - LOOP_LIMIT, count: 1, href: getRedirectUrl(urls[j]), outDegrees: new Set(links), referrer: j > countOnMain ? new Set() : new Set([ROOT_URL])})
            }
            if(current && !current.visited) {
                graph.set(urlToGo, {...current,  visited: true, id: CONSTANT_LIMIT - LOOP_LIMIT, count: current.count + 1, outDegrees: new Set(links)})
            }
            if(links?.length && links.length > 0) {
                for(let i = 0; i < links.length; i++) {
                    const link = getRedirectUrl(links[i]);
                    if(graph.has(link)) {
                        const old = graph.get(link);
                        graph.set(link, {...old, count: old.count + 1, referrer: old.referrer.add(urlToGo)})
                    } else {
                        graph.set(link, {visited: currentPageUrl == link, count: 0, href: link, referrer: new Set([urlToGo])})
                        urls.push(link);
                    }
                }
            }
            if(LOOP_LIMIT <= 0) {
                writeToFile(Array.from(graph.values()));
                console.error(`Maximum page count exceded, if that site has more pages than ${CONSTANT_LIMIT} you can increase this number.`)
                browser.close();
                return;
            }
        }

        writeToFile(Array.from(graph.values()));
        browser.close();
    
    }
}


module.exports = scraperObject;