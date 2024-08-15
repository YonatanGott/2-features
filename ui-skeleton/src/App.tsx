import { Stack, Container, Box, Card, CardHeader, Avatar, CardContent, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { useSkeletonLoader } from './hooks/useSkeletonLoader';
import SkeletonLoader from './components/SkeletonLoader';

function App() {
  const { data, loading } = useSkeletonLoader();
  console.log(loading, data);
  return (
    <Container maxWidth="sm"  >
      <Box
        width={"100%"}
        my={4}
        display="flex"
        alignItems="center"
        justifyContent={"center"}
        gap={4}
        p={2}
        sx={{ border: '2px solid grey' }}
      >
        List Loader using 'Promise.race'
      </Box>
      {loading ? (
        <SkeletonLoader items={2} direction='row'/>
      ) : (
        <Stack spacing={3} direction={"row"} alignItems={"center"} justifyContent={"center"} >
          {data?.map(item =>
            <Card key={item.id} sx={{ maxWidth: 240 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: blue[500] }} aria-label="recipe">
                    R
                  </Avatar>
                }
                title={item.header}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.content}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </Container>
  )
}

export default App
