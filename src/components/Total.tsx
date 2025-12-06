type TotalProps = {
  totalTime: number;
};

export const Total = ({ totalTime }: TotalProps) => {
  return <p className="total">合計時間 {totalTime}/1000h</p>;
};
