const fs = require('fs');
const {join} = require('path');

const ROOT_URL = 'https://www.cam.ac.uk';
let graph = new Map();
let currentPageUrl = '';
let urls = [];
let LOOP_LIMIT = 700;
function writeToFile(data) {
    const fileName = ROOT_URL.replace('http://', '').replace('https://', '').replaceAll('.', '_') + '.json';
    fs.writeFileSync(join(__dirname, 'data', fileName), JSON.stringify(data));
}

function getRedirectUrl(url) {
    if(url.length > 150) {
        return false;
    } else if(url.includes(ROOT_URL)) {
        return url;
    } else if(url.includes('http')) {
        return false;
    } else {
        return ROOT_URL + '/' + url;
    }

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

        for(let i = 0; i < links.length; i++) {
            LOOP_LIMIT--;
            const link = parseLinkString(links[i]);
            let urlToGo = getRedirectUrl(link);
            if(!urlToGo) {
                continue;
            }
            if(graph.has(link)) {
                const old = graph.get(link);
                graph.set(link, {...old, count: old.count++, referrerr: [...old.referrerr, this.url]})
            } else {
                graph.set(link, {visited: currentPageUrl == link, count: 1, href: link, referrerr: [this.url]})
                urls.push(link);
            }
        }

        for(let j = 0; j < urls.length; j++) {
            const urlToGo = getRedirectUrl(urls[j]);
            if(!urlToGo) {
                continue;
            }
            await page.goto(urlToGo);
            const current = graph.get(urls[j]);
            if(current.visited) {
                continue;
            }
            graph.set(urls[j], {...current, visited: true})
            await page.waitForSelector('body');
            let links = await page.evaluate(
                () => Array.from(
                    document.querySelectorAll('a[href]'),
                    a => a.getAttribute('href')
                )
            );
            for(let i = 0; i < links.length; i++) {
                LOOP_LIMIT--;
                const link = parseLinkString(links[i]);
                if(graph.has(link)) {
                    const old = graph.get(link);
                    graph.set(link, {...old, count: old.count + 1, referrerr: [...old.referrerr, urlToGo]})
                    console.log('OLD HAD COUNT< ADDING ONE TO THE NEW ONE.', old)
                } else {
                    graph.set(link, {visited: currentPageUrl == link, count: 1, href: link, referrerr: [urlToGo]})
                    urls.push(link);
                }
                if(LOOP_LIMIT <= 0) {
                    writeToFile(Array.from(graph.values()));
                    console.error(`Maximum page count exceded, if that site has more pages than ${LOOP_LIMIT} you can increase this number.`)
                    return;
                }
            }
            if(LOOP_LIMIT <= 0) {
                writeToFile(Array.from(graph.values()));
                console.error(`Maximum page count exceded, if that site has more pages than ${LOOP_LIMIT} you can increase this number.`)
                return;
            }
        }

        writeToFile(Array.from(graph.values()));
    }
}


module.exports = scraperObject;