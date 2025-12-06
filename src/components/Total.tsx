export const Total = (porps) => {
  const { totalTime } = porps;

  return <p className="total">合計時間 {totalTime}/1000h</p>;
};
