
# Web Scraper Class With Different Strategies

In this project folder there is some code of how the web scraper would work.

This is an example of improving performance and scalability in a web scraping server.
I was tasked in debugging and adding several web sites to be scraped by a web scraper. The web scraper was built in Node and used Puppeteer for the scraping.
The first issue I noticed was the execution time was very long - mainly because of the Puppeteer instance, and the other big issue was that every web site that was added had to be configured manually.
To solve these issues, I first improved the Puppeteer instance and implemented it into a class, so that there will be a few of them running in parallel and not closing after every page - This made the execution time significantly less. After that I reworked how the web sites are added to scraper, sites with dynamic content that required Javascript execution will be using the Puppeteer scraper class with there own strategy configuration and site that have static content ( which were the majority of the web sites ) will using a new web scraper based on just Axios + Cheerio/JSDOM.

**WebScraper Class Simplified Example:**

```typescript
class WebScraper {
  private strategy: ScrapingStrategy;

  constructor(strategy: ScrapingStrategy) {
    this.strategy = strategy;
  }

  async scrapeWebsite(domain:Domain): Promise<ScrapingResult | void > {
    try {
      const { data } = await axios.get(domain.url);
      return  { domainName: domain.name, data: this.strategy.scrape(data) };
    } catch (error) {
      console.error('Error scraping website:',domain, error)
    }
  }
}
```

The rewrite into classes with the strategy design pattern allowed for better scalability and easier readability, instead of configuring each web page/site on how the scraper should extract data -  it is better to define a strategy that will work on multiple pages :

**Scraping Strategy Simplified Example:**

```typescript
interface ScrapingStrategy {
  scrape(html: string): any[];
}

class ArticleScrapingStrategy implements ScrapingStrategy {
  scrape(html: string): any[] {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const articles = [...doc.querySelectorAll('.article')].map(article => {
      return {
        title: article?.querySelector('h2')?.textContent || '',
        content: article?.querySelector('.content')?.innerHTML || ''
      };
    });
    return articles;
  }
}

class ProductScrapingStrategy implements ScrapingStrategy {
  scrape(html: string): any[] {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const products = [...doc.querySelectorAll('.product')].map(product => {
      return {
        name: product?.querySelector('.name')?.textContent || '',
        price: product?.querySelector('.price')?.textContent || '',
        description: product?.querySelector('.description')?.textContent || ''
      };
    });
    return products;
  }
}
```

This approach makes it easier to extend the scraper with new strategies by simply implementing new strategy classes and setting them with the
`WebScraper` class, and it allows the `WebScraper` to be flexible and reuse the scraping logic with different strategies.

**Example for scraping sites:**

```typescript
const articleStrategy = new ArticleScrapingStrategy();
const productStrategy = new ProductScrapingStrategy();

const articleDomains: Domain[] = [
  { url: 'https://wwww.articles.com', name: 'Example Articles' },
  { url: 'https://www.news-site.com', name: 'News Site' }

];

const productDomains: Domain[] = [
  { url: 'https://www.e-shop.com', name: 'Ecommerce Site' },
  { url: 'https://wwww.products.com', name: 'Online Shop' }
];

async function main() {
  const articleScraper = new WebScraper(articleStrategy);
  articleDomains.forEach(async (domain:Domain) => {
    const articles = await articleScraper.scrapeWebsite(domain)
    console.log(articles)
  })
  const productScraper = new WebScraper(productStrategy);
  productDomains.forEach(async (domain:Domain) => {
    const products = await productScraper.scrapeWebsite(domain)
    console.log(products)
  })
}
```

In the end, the rewrite of the scraper made it more efficient and now it can easily be scaled with more control.
This shows that technical debt can start from the beginning of a project when there is no thought of how it will scale, in this case a web scraper that worked very well on a handful of web sites but made it more complex and cumbersome as it grew - using patterns to simplify it made it better and can be used and modified by multiple developers.
