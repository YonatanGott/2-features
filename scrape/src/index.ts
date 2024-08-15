import axios from 'axios';
import { JSDOM } from 'jsdom';

type Domain = {
  url: string;
  name: string;
};

type ScrapingResult = {
  domainName: string;
  data: any[];
};

interface ScrapingStrategy {
  scrape(html: string): any[];
}

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

