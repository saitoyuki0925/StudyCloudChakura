import { Text } from '@chakra-ui/react';

type TotalProps = {
  totalTime: number;
};

export const Total = ({ totalTime }: TotalProps) => {
  return (
    <Text textStyle="xl" textAlign="right" fontWeight="bold">
      合計時間 {totalTime}/1000h
    </Text>
  );
};
