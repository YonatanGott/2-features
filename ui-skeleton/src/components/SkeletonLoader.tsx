import { Stack, Skeleton } from "@mui/material";
import { FunctionComponent } from "react";

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

export default SkeletonLoader;