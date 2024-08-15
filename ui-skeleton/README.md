# Skeleton Loader UI Feature

In this project folder there is a demo of how the loader works.

This is an example of a ui feature I built with the design provided by a ui/ux designer and collaborated with a product manager on the use cases.
While it is a simple loader, I think it shows the importance of going back and forth and iterating over issues.

The original feature was used in a react app while fetching data for a better user experience, I was given a Figma design of how the skeleton loader should look like by the ui/ux designer and worked with her feedback initially to build the skeleton loader component.
It looked something like this:

**Skeleton loader component:**

```typescript

interface Props {
  items: number;
  direction: "row" | "column";
}

const SkeletonLoader: FunctionComponent<Props> = ({ items, direction }) => {

  return (
    <Stack spacing={3} direction={direction} alignItems={"center"} justifyContent={"center"} >
      {[...Array(items)].map((_, index) => (
        <Stack key={index} spacing={1} >
          <Stack spacing={1} direction={"row"}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" sx={{ fontSize: '1.7rem' }} width={180} />
          </Stack>
          <Skeleton variant="rectangular" width={240} height={60} />
          <Skeleton variant="rounded" width={240} height={60} />
        </Stack>
      ))}
    </Stack>
  );
}
```

However, after some testing, I noticed an issue with inconsistent data fetching times - in some cases it will take between 50-200ms and sometimes it can take more than 1200ms. This affected how the loader showed up in the app - it would either flash and disappear or show up normal.
To solve this issue, I decided to use `Promise.race` to control the visibility of the skeleton loader so it can provide a way to handle different loading scenarios.
For this I built a custom Hook:

**useSkeletonLoader Hook:**

```typescript

const fetchData = async (): Promise<DataResponse[]> => {
  return new Promise(resolve => setTimeout(() => resolve({data}), DATA_FETCH_MS));
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
        console.log('Showing Loader');
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

```

This approach in the code above offered several benefits:

1. It shows the skeleton loader after TIMEOUT_MS ( can be set to 200-100ms for example ) if the data hasn't arrived yet.
2. It continues fetching the data even after the timeout.
3. As soon as the data is available, you can access it via the getData() function.
4. If the data arrives before the timeout, you can use it immediately and not show the loader.
5. You can easily adjust the timeout duration for showing the skeleton.

This allows a more fine-grained control over the user experience.
Used in a component it will look this:

**Inside a component:**

```typescript

 const { data, loading } = useSkeletonLoader();

 return (
    <Container>
      {loading ? (
        <SkeletonLoader items={2} direction='row'/>
      ) : (
        <Stack>
          {data?.map(item =>
            <Card key={item.id}>
                {item.content}
            </Card>
          )}
        </Stack>
      )}
    </Container>
  )

```

In the end, what started as simple implementation of a loader while fetching data turned out into a custom Hook for using a `Promise.race` condition that will be used throughout the app. I think it shows that sometimes a design might behave differently in a real world scenario and it requires attention to details to make it work for the best user experience.
