import { useState, useEffect } from 'react';

const TIMEOUT_MS = 200
const DATA_FETCH_MS = 2000

export interface DataResponse {
  id: number;
  title: string;
  header: string;
  content: string;
}

const list:DataResponse[] = [
  {id: 1, title: 'List Item 1 Title', header:'List Item 1', content:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac luctus sem. Nam nec neque arcu. Vivamus nec semper tellus, sed lobortis metus.'},
  {id: 2, title: 'List Item 2 Title', header:'List Item 2', content:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac luctus sem. Nam nec neque arcu. Vivamus nec semper tellus, sed lobortis metus.'},
]

const fetchData = async (): Promise<DataResponse[]> => {
  return new Promise(resolve => setTimeout(() => resolve(list), DATA_FETCH_MS));
};

export const useSkeletonLoader = () => {
  const [data, setData] = useState<DataResponse[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPromiseResponse = () => {
    let dataFetched = false;
    let data: any = null;

    const dataPromise = fetchData().then(result => {
      dataFetched = true;
      data = result;
      return result;
    });

    const timeoutPromise = new Promise<'TIMEOUT'>(resolve => {
      setTimeout(() => {
        if (!dataFetched) {
          resolve('TIMEOUT');
        }
      }, TIMEOUT_MS);
    });

    return {
      initialResponse: Promise.race([dataPromise, timeoutPromise]),
      fullDataPromise: dataPromise,
      getData: () => data
    };
  };

  const fetchAndDisplayLoader = async () => {
    const { initialResponse, fullDataPromise, getData } = fetchPromiseResponse();
    try {
      const initial = await initialResponse;
      if (initial === 'TIMEOUT') {
        console.log('Showing skeleton...');
        setLoading(true)
      } else {
        console.log('Data arrived quickly:', initial);
        setData(initial as DataResponse[]);
        setLoading(false)
        return;
      }
      await fullDataPromise;
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      const finalData = getData();
      if (finalData) {
        console.log('Full data arrived:', finalData);
        setData(finalData as DataResponse[]);
        setLoading(false)
      }
    }
  };

  useEffect(() => {
    fetchAndDisplayLoader()
    return () => {
      setLoading(false);
    };
  }, []);

  return { data, loading };
};